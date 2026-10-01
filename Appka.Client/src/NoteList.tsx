import type { Note } from './types'

type NoteListProps = {
  notes: Note[]
  loading: boolean
  loadError: string | null
}

function NoteList({ notes, loading, loadError }: NoteListProps) {
  return (
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
        <NoteRow key={note.id} note={note} />
      ))}
    </div>
  )
}

function NoteRow({ note }: { note: Note }) {
  return (
    <article className="note-row">
      <p className="note-text">{note.text}</p>
      <div className="note-details">
        <span className="note-id">#{note.id}</span>
        {note.isArchived && <span className="note-status">Archived</span>}
      </div>
    </article>
  )
}

export default NoteList
