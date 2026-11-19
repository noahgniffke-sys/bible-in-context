// Generate the Apple Sign-In Secret JWT for Supabase.
// Apple caps these at 6 months — rerun this script and paste the new
// JWT into Supabase → Authentication → Providers → Apple → Secret Key
// before the expiry shown at the bottom of the output.
//
// Usage:
//   APPLE_TEAM_ID=... APPLE_KEY_ID=... APPLE_KEY_PATH=/path/to/AuthKey.p8 node scripts/generate-apple-jwt.mjs
//
// The .p8 file stays on your Mac. Do not commit it.

import crypto from 'crypto'
import fs from 'fs'

const TEAM_ID = process.env.APPLE_TEAM_ID
const KEY_ID = process.env.APPLE_KEY_ID
const CLIENT_ID = process.env.APPLE_CLIENT_ID || 'com.noahgniffke.bibleincontext.web'
const KEY_PATH = process.env.APPLE_KEY_PATH

if (!TEAM_ID || !KEY_ID || !KEY_PATH) {
  console.error('Set APPLE_TEAM_ID, APPLE_KEY_ID, and APPLE_KEY_PATH. The .p8 file stays off this repo.')
  process.exit(1)
}

if (!fs.existsSync(KEY_PATH)) {
  console.error('Apple key file was not found. Check APPLE_KEY_PATH.')
  process.exit(1)
}

const privateKey = fs.readFileSync(KEY_PATH, 'utf8')
const now = Math.floor(Date.now() / 1000)

const header = { alg: 'ES256', kid: KEY_ID }
const payload = {
  iss: TEAM_ID,
  iat: now,
  exp: now + 15552000, // 6 months — Apple's max
  aud: 'https://appleid.apple.com',
  sub: CLIENT_ID,
}

const b64url = (s) => Buffer.from(s).toString('base64url')
const headerB64 = b64url(JSON.stringify(header))
const payloadB64 = b64url(JSON.stringify(payload))
const signingInput = `${headerB64}.${payloadB64}`

const sign = crypto.createSign('SHA256')
sign.update(signingInput)
sign.end()
const sig = sign.sign({ key: privateKey, dsaEncoding: 'ieee-p1363' })
const sigB64 = sig.toString('base64url')

const expiry = new Date((now + 15552000) * 1000).toISOString().slice(0, 10)

console.log('Apple Sign-In JWT (paste into Supabase Secret Key field):')
console.log('')
console.log(`${signingInput}.${sigB64}`)
console.log('')
console.log(`Expires: ${expiry}`)
