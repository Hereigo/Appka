import { useState, type FormEvent } from 'react'
import type { Note } from './types'

type NoteFormProps = {
  onCreateNote: (text: string) => Promise<Note>
}

function NoteForm({ onCreateNote }: NoteFormProps) {
  const [noteText, setNoteText] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = noteText.trim()

    if (text.length < 2) {
      setCreateError('Enter at least 2 characters.')
      return
    }

    setSaving(true)
    setCreateError(null)

    try {
      await onCreateNote(text)
      setNoteText('')
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Could not add note.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="note-form" onSubmit={handleSubmit}>
      <label htmlFor="note-text">New note</label>
      <textarea
        id="note-text"
        name="text"
        rows={3}
        minLength={2}
        required
        placeholder="Write something worth remembering…"
        value={noteText}
        onChange={(event) => setNoteText(event.target.value)}
      />
      <div className="form-actions">
        {createError && <p className="error" role="alert">{createError}</p>}
        <button type="submit" disabled={saving || noteText.trim().length < 2}>
          {saving ? 'Adding…' : 'Add note'}
        </button>
      </div>
    </form>
  )
}

export default NoteForm
