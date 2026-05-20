// Pick today's verse from the bundled list, deterministic by PST date.

import { VERSES } from '../data/verse-of-the-day'

const PST_TZ = 'America/Los_Angeles'

// Returns 'YYYY-MM-DD' in PST. en-CA's locale produces ISO-style date strings.
export function getPSTDateKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: PST_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

// Days since a fixed PST epoch (2026-01-01). Used to index into the verse list.
function getPSTDayNumber(date = new Date()) {
  const today = getPSTDateKey(date) // 'YYYY-MM-DD'
  const [y, m, d] = today.split('-').map(Number)
  const todayUTC = Date.UTC(y, m - 1, d)
  const epochUTC = Date.UTC(2026, 0, 1)
  return Math.floor((todayUTC - epochUTC) / 86400000)
}

export function getVerseOfTheDay(date = new Date()) {
  if (VERSES.length === 0) return null
  const dayNum = getPSTDayNumber(date)
  const idx = ((dayNum % VERSES.length) + VERSES.length) % VERSES.length
  return { ...VERSES[idx], dateKey: getPSTDateKey(date), dayNumber: dayNum }
}

// Milliseconds until next PST midnight. Used to schedule the daily refresh.
export function msUntilNextPSTMidnight(date = new Date()) {
  // Find current PST hour/minute/second/ms by formatting parts
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: PST_TZ,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const parts = fmt.formatToParts(date)
  const get = type => Number(parts.find(p => p.type === type)?.value || 0)
  const hours = get('hour') % 24
  const minutes = get('minute')
  const seconds = get('second')
  const ms = date.getMilliseconds()
  const msSinceMidnightPST =
    hours * 3600000 + minutes * 60000 + seconds * 1000 + ms
  const msUntil = 86400000 - msSinceMidnightPST
  // Add a 1s buffer to ensure we're past midnight, not at it.
  return msUntil + 1000
}
