// Bible in Context username + display-name + text moderation.
// Keep this conservative. False positives are recoverable (user picks
// another username); false negatives ship offensive content to a Bible app.

const PROFANITY = [
  'fuck', 'shit', 'damn', 'bitch', 'asshole', 'bastard', 'cunt',
  'dick', 'pussy', 'cock', 'whore', 'slut', 'fag', 'nigger', 'nigga',
  'retard', 'kike', 'spic', 'chink', 'tranny', 'gook', 'wetback', 'beaner',
  'porn', 'sex', 'rape', 'nude', 'naked', 'horny', 'cum', 'jizz',
  'piss', 'turd', 'twat', 'wank', 'jerkoff', 'douche', 'jackoff',
]

// Reserved usernames — impersonation, admin, sacred names treated reverently.
const RESERVED = [
  'admin', 'administrator', 'moderator', 'mod', 'support', 'official',
  'help', 'staff', 'team', 'bibleincontext', 'biblein_context', 'bic',
  'root', 'system', 'null', 'undefined', 'anonymous', 'user', 'guest',
  // Sacred names — disallowed to prevent impersonation
  'god', 'jesus', 'jesuschrist', 'christ', 'yahweh', 'jehovah', 'yhwh',
  'allah', 'holyspirit', 'holyghost', 'lord', 'lordgod', 'thelord',
  'satan', 'devil', 'lucifer', 'antichrist', 'demon',
]

// Blasphemy phrases (substring match) — best-effort, not exhaustive.
const BLASPHEMY_FRAGMENTS = [
  'fuckgod', 'fuckjesus', 'killgod', 'killjesus', 'godisdead',
  'hailsatan', 'hailthedevil', 'satanic', 'antichrist',
]

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/

function containsAny(text, list) {
  const lower = text.toLowerCase().replace(/[\s_]/g, '')
  return list.some(w => lower.includes(w))
}

export function validateUsername(username) {
  if (!username) return { valid: false, error: 'Username is required' }
  if (!USERNAME_REGEX.test(username)) {
    return { valid: false, error: 'Username must be 3–20 characters: letters, numbers, underscores' }
  }
  const lower = username.toLowerCase()
  if (RESERVED.includes(lower)) {
    return { valid: false, error: 'That username is reserved. Please choose another.' }
  }
  if (containsAny(username, PROFANITY)) {
    return { valid: false, error: 'Username contains inappropriate language.' }
  }
  if (containsAny(username, BLASPHEMY_FRAGMENTS)) {
    return { valid: false, error: 'Please choose a username that respects the focus of this app.' }
  }
  return { valid: true, error: null }
}

export function validateDisplayName(name) {
  if (!name) return { valid: false, error: 'Display name is required' }
  if (name.length > 50) return { valid: false, error: 'Display name must be under 50 characters' }
  if (containsAny(name, PROFANITY)) {
    return { valid: false, error: 'Display name contains inappropriate language.' }
  }
  if (containsAny(name, BLASPHEMY_FRAGMENTS)) {
    return { valid: false, error: 'Please choose a display name that respects the focus of this app.' }
  }
  return { valid: true, error: null }
}

export function validateText(text, maxLength = 500, fieldName = 'Text') {
  if (!text?.trim()) return { valid: false, error: `${fieldName} is required` }
  if (text.length > maxLength) {
    return { valid: false, error: `${fieldName} must be under ${maxLength} characters` }
  }
  if (containsAny(text, PROFANITY)) {
    return { valid: false, error: `${fieldName} contains inappropriate language.` }
  }
  return { valid: true, error: null }
}
