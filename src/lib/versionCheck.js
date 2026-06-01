import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'

// TODO: Fill in the numeric App Store ID for Bible in Context.
// You can find it in App Store Connect → My Apps → Bible in Context → App Information → Apple ID.
const APPLE_APP_ID = '0000000000'
const APP_STORE_URL = `https://apps.apple.com/us/app/bible-in-context/id${APPLE_APP_ID}`
const ITUNES_LOOKUP = `https://itunes.apple.com/lookup?id=${APPLE_APP_ID}&country=us`

function isNewerVersion(store, current) {
  const a = String(store).split('.').map((n) => parseInt(n, 10) || 0)
  const b = String(current).split('.').map((n) => parseInt(n, 10) || 0)
  const len = Math.max(a.length, b.length)
  for (let i = 0; i < len; i++) {
    const x = a[i] || 0
    const y = b[i] || 0
    if (x > y) return true
    if (x < y) return false
  }
  return false
}

export async function checkForUpdate() {
  if (!Capacitor.isNativePlatform()) return null
  if (APPLE_APP_ID === '0000000000') return null

  let current = '0.0.0'
  try {
    const info = await App.getInfo()
    current = info.version || '0.0.0'
  } catch {
    return null
  }

  try {
    const res = await fetch(`${ITUNES_LOOKUP}&t=${Date.now()}`)
    const data = await res.json()
    const storeVersion = data?.results?.[0]?.version
    if (!storeVersion) return null
    if (isNewerVersion(storeVersion, current)) {
      return {
        available: true,
        storeVersion,
        current,
        url: APP_STORE_URL,
        releaseNotes: data.results[0].releaseNotes || '',
      }
    }
    return { available: false }
  } catch {
    return null
  }
}

export { APP_STORE_URL }
