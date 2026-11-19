import { readFileSync } from 'node:fs';
import { createSign, createPrivateKey } from 'node:crypto';

const TEAM_ID = process.env.APPLE_TEAM_ID;
const KEY_ID = process.env.APPLE_KEY_ID;
const SERVICES_ID = process.env.APPLE_SERVICES_ID || 'com.noahgniffke.bibleincontext.signin';
const P8_PATH = process.env.APPLE_KEY_PATH;

if (!TEAM_ID || !KEY_ID || !P8_PATH) {
  console.error('Set APPLE_TEAM_ID, APPLE_KEY_ID, and APPLE_KEY_PATH to your Apple key. The .p8 file stays off this repo.');
  process.exit(1);
}

const now = Math.floor(Date.now() / 1000);
const sixMonths = 60 * 60 * 24 * 180;

const header = { alg: 'ES256', kid: KEY_ID, typ: 'JWT' };
const payload = {
  iss: TEAM_ID,
  iat: now,
  exp: now + sixMonths,
  aud: 'https://appleid.apple.com',
  sub: SERVICES_ID,
};

const b64url = (obj) =>
  Buffer.from(JSON.stringify(obj))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

const signingInput = `${b64url(header)}.${b64url(payload)}`;

const privateKey = createPrivateKey({
  key: readFileSync(P8_PATH),
  format: 'pem',
});

const derSig = createSign('SHA256').update(signingInput).sign(privateKey);

// Convert DER ECDSA signature -> raw r||s (64 bytes) for JOSE
function derToJose(der) {
  let offset = 2;
  if (der[1] & 0x80) offset += der[1] & 0x7f;
  if (der[offset] !== 0x02) throw new Error('Invalid DER: r marker');
  const rLen = der[offset + 1];
  let r = der.slice(offset + 2, offset + 2 + rLen);
  offset = offset + 2 + rLen;
  if (der[offset] !== 0x02) throw new Error('Invalid DER: s marker');
  const sLen = der[offset + 1];
  let s = der.slice(offset + 2, offset + 2 + sLen);
  // Trim leading zeros / left-pad to 32 bytes
  const pad = (buf) => {
    if (buf.length > 32) buf = buf.slice(buf.length - 32);
    if (buf.length < 32) buf = Buffer.concat([Buffer.alloc(32 - buf.length, 0), buf]);
    return buf;
  };
  return Buffer.concat([pad(r), pad(s)]);
}

const sigB64 = derToJose(derSig)
  .toString('base64')
  .replace(/=/g, '')
  .replace(/\+/g, '-')
  .replace(/\//g, '_');

const jwt = `${signingInput}.${sigB64}`;
const expDate = new Date((now + sixMonths) * 1000).toISOString().slice(0, 10);

console.log('\n=== Apple Sign In JWT ===');
console.log(`Expires: ${expDate} (regenerate before this date)`);
console.log('\nPaste this entire string into Supabase → Apple → Secret Key (for OAuth):\n');
console.log(jwt);
console.log('');
