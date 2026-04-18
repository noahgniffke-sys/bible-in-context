import { formatVerseRef } from './bible-books'
import { getTranslation } from './bible-api'

export async function shareVerse(bookId, chapter, verse, text) {
  const ref = formatVerseRef(bookId, chapter, verse)
  const translation = getTranslation()
  const shareText = `"${text}"\n\n— ${ref} (${translation})\n\nShared via Bible in Context`

  try {
    const { Share } = await import('@capacitor/share')
    await Share.share({
      title: ref,
      text: shareText,
    })
    return true
  } catch {
    // Fallback to Web Share API
    if (navigator.share) {
      try {
        await navigator.share({ title: ref, text: shareText })
        return true
      } catch {}
    }
    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(shareText)
      return 'copied'
    } catch {
      return false
    }
  }
}

export async function shareNote(noteContent, verseRef, verseText) {
  const translation = getTranslation()
  const shareText = `"${verseText}"\n— ${verseRef} (${translation})\n\nNote: ${noteContent}\n\nShared via Bible in Context`

  try {
    const { Share } = await import('@capacitor/share')
    await Share.share({ title: 'Bible Note', text: shareText })
    return true
  } catch {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Bible Note', text: shareText })
        return true
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(shareText)
      return 'copied'
    } catch {
      return false
    }
  }
}
