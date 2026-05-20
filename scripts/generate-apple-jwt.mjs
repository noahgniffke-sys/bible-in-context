// Generate the Apple Sign-In Secret JWT for Supabase.
// Apple caps these at 6 months — rerun this script and paste the new
// JWT into Supabase → Authentication → Providers → Apple → Secret Key
// before the expiry shown at the bottom of the output.
//
// Usage:
//   node scripts/generate-apple-jwt.mjs
//
// Requires the .p8 file at the path below. Update if you move it.

import crypto from 'crypto'
import fs from 'fs'

const TEAM_ID = 'T5C7G8A7GP'
const KEY_ID = 'YOUR_KEY_ID'
const CLIENT_ID = 'com.noahgniffke.bibleincontext.web'
const KEY_PATH = process.env.APPLE_KEY_PATH || ''

if (!fs.existsSync(KEY_PATH)) {
  console.error(`Apple key not found at: ${KEY_PATH}`)
  console.error('Set APPLE_KEY_PATH=/path/to/AuthKey_XXXX.p8 if you moved it.')
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
