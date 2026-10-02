import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import AuthControls from './auth/AuthControls'
import RequireAuth from './auth/RequireAuth'
import HomePage from './HomePage'
import NotesPage from './NotesPage'
import ContactsPage from './ContactsPage'
import './App.css'

function App() {
  const [hash, setHash] = useState(() => window.location.hash)
  const currentPage = hash === '#/notes' ? 'notes' : hash === '#/contacts' ? 'contacts' : 'home'

  useEffect(() => {
    function handleHashChange() {
      setHash(window.location.hash)
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return (
    <div className="page">
      <header className="header">
        <div className="header-brand">
          <img src={reactLogo} className="logo" alt="React logo" />
          <div>
            <h1>Appka</h1>
            <p className="subtitle">A small place for your notes</p>
          </div>
        </div>
        <nav className="page-nav" aria-label="Main navigation">
          <a className="page-link" href="#/" aria-current={currentPage === 'home' ? 'page' : undefined}>Home</a>
          <a className="page-link" href="#/notes" aria-current={currentPage === 'notes' ? 'page' : undefined}>Notes</a>
          <a className="page-link" href="#/contacts" aria-current={currentPage === 'contacts' ? 'page' : undefined}>Contacts</a>
        </nav>
        <AuthControls />
      </header>
      <main>
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'notes' && (
          <RequireAuth>
            <NotesPage />
          </RequireAuth>
        )}
        {currentPage === 'contacts' && <ContactsPage />}
      </main>
    </div>
  )
}

export default App
