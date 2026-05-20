// Verified accounts — founders / family. Manually curated, no paywall.
// To add or remove, edit the list below.

export const VERIFIED_USERNAMES = new Set([
  'noahgniffke',
  'allieridley',
  'alliegniffke',
])

export function isVerified(username) {
  if (!username) return false
  return VERIFIED_USERNAMES.has(username.toLowerCase())
}

// Shown in the verification info modal.
export const VERIFIED_MOTTO = 'Without Jesus We Are Nothing'

export const VERIFIED_VERSES = [
  { label: 'Matthew 5:14–16', bookId: 'MAT', chapter: 5, verse: 14 },
  { label: '2 Timothy 1:7',   bookId: '2TI', chapter: 1, verse: 7  },
  { label: 'Psalm 23',        bookId: 'PSA', chapter: 23, verse: null },
]
