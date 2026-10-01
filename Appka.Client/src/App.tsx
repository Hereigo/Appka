import { useEffect, useState, type FormEvent } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'

type HelloMessage = {
  message: string
  serverTime: string
}

type Note = {
  id: number
  isArchived: boolean
  text: string
}

function App() {
  const [hello, setHello] = useState<HelloMessage | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [noteText, setNoteText] = useState('')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const [helloRes, notesRes] = await Promise.all([
          fetch('/api/hello', { signal: controller.signal }),
          fetch('/api/notes', { signal: controller.signal }),
        ])

        if (!helloRes.ok || !notesRes.ok) {
          throw new Error(`API returned ${helloRes.status} / ${notesRes.status}`)
        }

        setHello(await helloRes.json())
        setNotes(await notesRes.json())
        setLoadError(null)
      } catch (err) {
        if (controller.signal.aborted) return
        setLoadError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [])

  async function handleCreateNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = noteText.trim()

    if (text.length < 2) {
      setCreateError('Enter at least 2 characters.')
      return
    }

    setSaving(true)
    setCreateError(null)

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error(`Could not add note (HTTP ${response.status}).`)
      }

      const note: Note = await response.json()
      setNotes((currentNotes) =>
        [...currentNotes, note].sort((left, right) => left.id - right.id),
      )
      setNoteText('')
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Could not add note.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="page">
      <header className="header">
        <img src={reactLogo} className="logo" alt="React logo" />
        <div>
          <h1>Appka</h1>
          <p className="subtitle">A small place for your notes</p>
        </div>
      </header>

      <section className="card">
        <h2>Server says</h2>
        {loading && <p className="muted">Loading…</p>}
        {hello && (
          <>
            <p className="message">{hello.message}</p>
            <p className="muted">
              Server time: {new Date(hello.serverTime).toLocaleString()}
            </p>
          </>
        )}
      </section>

      <section className="card notes-card" aria-labelledby="notes-heading">
        <h2 id="notes-heading">Notes</h2>

        <form className="note-form" onSubmit={handleCreateNote}>
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

        <div className="note-list" aria-live="polite">
          {loadError && (
            <p className="error" role="alert">
              Could not load notes from <code>Appka.Server</code>: {loadError}
            </p>
          )}
          {loading && <p className="muted">Loading notes…</p>}
          {!loading && !loadError && notes.length === 0 && (
            <p className="empty-state">No notes yet. Add one above.</p>
          )}
          {!loading && !loadError && notes.map((note) => (
            <article className="note-row" key={note.id}>
              <p className="note-text">{note.text}</p>
              <div className="note-details">
                <span className="note-id">#{note.id}</span>
                {note.isArchived && <span className="note-status">Archived</span>}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default App
