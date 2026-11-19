import { Capacitor } from '@capacitor/core'
import { getVerseOfTheDay } from './verse-of-day'
import { getVerse, getTranslation } from './bible-api'

const DAYS_AHEAD = 21
const BASE_ID = 4100

function atLocalNoon(daysFromToday) {
  const when = new Date()
  when.setDate(when.getDate() + daysFromToday)
  when.setHours(12, 0, 0, 0)
  return when
}

async function verseBody(date) {
  const pick = getVerseOfTheDay(date)
  if (!pick) return null
  const translation = getTranslation()
  let text = pick.text
  try {
    const verse = await getVerse(pick.bookId, pick.chapter, pick.verse, translation)
    if (verse?.text) text = verse.text
  } catch {
    // The bundled line is still Scripture in a public-domain wording.
  }
  const clipped = text.length > 170 ? `${text.slice(0, 167).trim()}…` : text
  return {
    title: `Verse of the Day · ${pick.ref}`,
    body: clipped,
    extra: {
      bookId: pick.bookId,
      chapter: pick.chapter,
      verse: pick.verse,
      ref: pick.ref,
    },
  }
}

// Schedule the next three weeks of noon reminders. iOS delivers these while
// the app is closed and while the screen is locked. A phone that is fully
// powered off cannot show anything until it turns back on; the pending
// reminder is delivered then.
export async function ensureDailyVerseNotification() {
  if (!Capacitor.isNativePlatform()) return
  const { LocalNotifications } = await import('@capacitor/local-notifications')
  const perm = await LocalNotifications.requestPermissions()
  if (perm.display !== 'granted') return

  const existing = []
  for (let i = 0; i < DAYS_AHEAD; i++) existing.push({ id: BASE_ID + i })
  await LocalNotifications.cancel({ notifications: existing })

  const notifications = []
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const when = atLocalNoon(i)
    if (when.getTime() <= Date.now() + 60 * 1000) continue
    const content = await verseBody(when)
    if (!content) continue
    notifications.push({
      id: BASE_ID + i,
      title: content.title,
      body: content.body,
      extra: content.extra,
      schedule: { at: when, allowWhileIdle: true },
    })
  }
  if (notifications.length) {
    await LocalNotifications.schedule({ notifications })
  }
}
