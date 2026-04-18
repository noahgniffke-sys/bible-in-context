import { useState } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import { formatTimeAgo } from '../lib/utils'
import { parseVerseRef, formatVerseRef } from '../lib/bible-books'
import EmptyState from '../components/EmptyState'
import TabBar from '../components/TabBar'
import { useConfirm } from '../components/ConfirmDialog'
import { useToast } from '../components/Toast'
import { triggerHaptic, HapticStyle } from '../lib/haptics'

const PRAYER_TABS = [
  { key: 'active', label: 'Active' },
  { key: 'answered', label: 'Answered' },
]

function PrayerJournal() {
  const [prayers, setPrayers] = useLocalStorage('bic_prayers_local', [])
  const [tab, setTab] = useState('active')
  const [showEditor, setShowEditor] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [verseRef, setVerseRef] = useState('')
  const confirm = useConfirm()
  const toast = useToast()

  const activePrayers = prayers.filter(p => !p.is_answered).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  const answeredPrayers = prayers.filter(p => p.is_answered).sort((a, b) => new Date(b.answered_at || b.created_at) - new Date(a.answered_at || a.created_at))
  const displayPrayers = tab === 'active' ? activePrayers : answeredPrayers

  function openEditor(prayer = null) {
    if (prayer) {
      setEditingId(prayer.id)
      setTitle(prayer.title || '')
      setContent(prayer.content)
      setVerseRef(prayer.verse_ref || '')
    } else {
      setEditingId(null)
      setTitle('')
      setContent('')
      setVerseRef('')
    }
    setShowEditor(true)
    triggerHaptic(HapticStyle.LIGHT)
  }

  function savePrayer() {
    if (!content.trim()) return

    triggerHaptic(HapticStyle.SUCCESS)
    const now = new Date().toISOString()

    if (editingId) {
      setPrayers(prayers.map(p => p.id === editingId ? {
        ...p,
        title: title.trim() || null,
        content: content.trim(),
        verse_ref: verseRef.trim() || null,
        updated_at: now,
      } : p))
    } else {
      setPrayers([...prayers, {
        id: crypto.randomUUID(),
        title: title.trim() || null,
        content: content.trim(),
        verse_ref: verseRef.trim() || null,
        is_answered: false,
        answered_at: null,
        created_at: now,
        updated_at: now,
      }])
    }

    setShowEditor(false)
    toast.success(editingId ? 'Prayer updated' : 'Prayer added')
  }

  async function markAnswered(id) {
    const yes = await confirm({
      title: 'Mark as Answered',
      message: 'Move this prayer to your answered list?',
      confirmLabel: 'Yes, Answered',
    })
    if (yes) {
      triggerHaptic(HapticStyle.SUCCESS)
      setPrayers(prayers.map(p => p.id === id ? {
        ...p,
        is_answered: true,
        answered_at: new Date().toISOString(),
      } : p))
      toast.success('Prayer marked as answered')
    }
  }

  async function deletePrayer(id) {
    const yes = await confirm({
      title: 'Delete Prayer',
      message: 'This prayer will be permanently deleted.',
      confirmLabel: 'Delete',
      destructive: true,
    })
    if (yes) {
      triggerHaptic(HapticStyle.ERROR)
      setPrayers(prayers.filter(p => p.id !== id))
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Prayer Journal</h2>
        <button
          onClick={() => openEditor()}
          className="px-4 py-2 bg-[var(--accent-secondary)] text-white rounded-lg font-medium text-sm active:scale-95"
        >
          + New
        </button>
      </div>

      <TabBar tabs={PRAYER_TABS} activeTab={tab} onChange={setTab} />

      {/* Prayer editor */}
      {showEditor && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4 mb-4 fade-in-up">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Prayer title (optional)"
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-lg px-3 py-2 text-[var(--text-primary)] text-sm mb-2 focus:outline-none focus:border-[var(--accent-secondary)]"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your prayer..."
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-lg px-3 py-2 text-[var(--text-primary)] text-sm resize-none min-h-[100px] mb-2 focus:outline-none focus:border-[var(--accent-secondary)]"
          />
          <input
            type="text"
            value={verseRef}
            onChange={(e) => setVerseRef(e.target.value)}
            placeholder="Link a verse (e.g. JHN.3.16) (optional)"
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-lg px-3 py-2 text-[var(--text-primary)] text-sm mb-3 focus:outline-none focus:border-[var(--accent-secondary)]"
          />
          <div className="flex gap-2">
            <button
              onClick={savePrayer}
              disabled={!content.trim()}
              className="flex-1 py-2 rounded-lg bg-[var(--accent-secondary)] text-white font-medium text-sm disabled:opacity-50 active:scale-95"
            >
              {editingId ? 'Update' : 'Save'}
            </button>
            <button
              onClick={() => setShowEditor(false)}
              className="py-2 px-4 rounded-lg border border-[var(--border-primary)] text-[var(--text-secondary)] text-sm active:scale-95"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Prayer list */}
      {displayPrayers.length > 0 ? (
        <div className="space-y-3">
          {displayPrayers.map(prayer => (
            <div key={prayer.id} className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  {prayer.title && (
                    <h3 className="font-bold text-[var(--text-primary)] text-sm">{prayer.title}</h3>
                  )}
                  {prayer.verse_ref && (
                    <p className="text-xs text-[var(--accent-secondary)]">
                      {(() => {
                        const p = parseVerseRef(prayer.verse_ref)
                        return formatVerseRef(p.bookId, p.chapter, p.verse)
                      })()}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-sm text-[var(--text-primary)] leading-relaxed mb-3">{prayer.content}</p>

              {/* Timestamps */}
              <div className="flex flex-col gap-1 mb-3 text-xs text-[var(--text-muted)]">
                <p>🕐 Submitted: {new Date(prayer.created_at).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
                {prayer.is_answered && prayer.answered_at && (
                  <p className="text-[var(--accent-success)]">✅ Answered: {new Date(prayer.answered_at).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
                )}
              </div>

              <div className="flex gap-2">
                {!prayer.is_answered && (
                  <button
                    onClick={() => markAnswered(prayer.id)}
                    className="text-xs text-[var(--accent-success)] font-medium min-h-[auto] min-w-[auto] py-1 px-2"
                  >
                    Mark Answered
                  </button>
                )}
                <button
                  onClick={() => openEditor(prayer)}
                  className="text-xs text-[var(--text-muted)] min-h-[auto] min-w-[auto] py-1 px-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => deletePrayer(prayer.id)}
                  className="text-xs text-[var(--accent-error)] min-h-[auto] min-w-[auto] py-1 px-2"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          emoji={tab === 'active' ? '🙏' : '✅'}
          title={tab === 'active' ? 'No Active Prayers' : 'No Answered Prayers'}
          description={tab === 'active'
            ? 'Tap "+ New" to add your first prayer.'
            : 'Prayers you mark as answered will appear here.'
          }
        />
      )}
    </div>
  )
}

export default PrayerJournal
