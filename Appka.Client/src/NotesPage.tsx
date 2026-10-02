import { useEffect, useState } from 'react'
import { useAuth } from 'react-oidc-context'
import NoteForm from './NoteForm'
import NoteList from './NoteList'
import type { HelloMessage, Note } from './types'

function NotesPage() {
  const accessToken = useAuth().user?.access_token
  const [hello, setHello] = useState<HelloMessage | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const [helloRes, notesRes] = await Promise.all([
          fetch('/api/hello', { signal: controller.signal }),
          fetch('/api/notes', {
            signal: controller.signal,
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
        ])

        if (notesRes.status === 401 || notesRes.status === 403) {
          throw new Error('Your session is not allowed to read notes. Try signing in again.')
        }

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
  }, [accessToken])

  async function createNote(text: string): Promise<Note> {
    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ text }),
    })

    if (response.status === 401 || response.status === 403) {
      throw new Error('Your session is not allowed to add notes. Try signing in again.')
    }

    if (!response.ok) {
      throw new Error(`Could not add note (HTTP ${response.status}).`)
    }

    const note: Note = await response.json()
    setNotes((currentNotes) =>
      [...currentNotes, note].sort((left, right) => left.id - right.id),
    )
    return note
  }

  return (
    <>
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
        <NoteForm onCreateNote={createNote} />
        <NoteList notes={notes} loading={loading} loadError={loadError} />
      </section>
    </>
  )
}

export default NotesPage