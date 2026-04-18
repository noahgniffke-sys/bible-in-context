const BLOCKED_WORDS = [
  // Profanity and slurs (abbreviated patterns to catch variations)
  'fuck', 'shit', 'damn', 'bitch', 'asshole', 'bastard', 'cunt',
  'dick', 'pussy', 'cock', 'whore', 'slut', 'fag', 'nigger', 'nigga',
  'retard', 'kike', 'spic', 'chink',
]

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/

export function validateUsername(username) {
  if (!username) return { valid: false, error: 'Username is required' }
  if (!USERNAME_REGEX.test(username)) {
    return { valid: false, error: 'Username must be 3-20 characters, letters, numbers, and underscores only' }
  }
  const lower = username.toLowerCase()
  if (BLOCKED_WORDS.some(w => lower.includes(w))) {
    return { valid: false, error: 'Username contains inappropriate content' }
  }
  return { valid: true, error: null }
}

export function validateDisplayName(name) {
  if (!name) return { valid: false, error: 'Display name is required' }
  if (name.length > 50) return { valid: false, error: 'Display name must be under 50 characters' }
  const lower = name.toLowerCase()
  if (BLOCKED_WORDS.some(w => lower.includes(w))) {
    return { valid: false, error: 'Display name contains inappropriate content' }
  }
  return { valid: true, error: null }
}

export function validateText(text, maxLength = 500, fieldName = 'Text') {
  if (!text?.trim()) return { valid: false, error: `${fieldName} is required` }
  if (text.length > maxLength) {
    return { valid: false, error: `${fieldName} must be under ${maxLength} characters` }
  }
  const lower = text.toLowerCase()
  if (BLOCKED_WORDS.some(w => lower.includes(w))) {
    return { valid: false, error: `${fieldName} contains inappropriate content` }
  }
  return { valid: true, error: null }
}
