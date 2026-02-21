// src/App.tsx
import { useState } from 'react'
import MeetingInput from './components/MeetingInput'
import Dashboard from './components/Dashboard'
import './App.css'

type View = 'input' | 'dashboard'

export default function App() {
  const [view, setView] = useState<View>('input')
  const [refreshKey, setRefreshKey] = useState(0)

  function handleSuccess() {
    setRefreshKey((k) => k + 1)
    setView('dashboard')
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner">
          <span className="app-logo">Meeting Notes</span>
          <nav className="app-nav">
            <button
              className={`nav-link ${view === 'input' ? 'nav-link--active' : ''}`}
              onClick={() => setView('input')}
            >
              New Meeting
            </button>
            <button
              className={`nav-link ${view === 'dashboard' ? 'nav-link--active' : ''}`}
              onClick={() => setView('dashboard')}
            >
              Dashboard
            </button>
          </nav>
        </div>
      </header>

      <main className="app-main">
        {view === 'input' && <MeetingInput onSuccess={handleSuccess} />}
        {view === 'dashboard' && (
          <Dashboard onNewMeeting={() => setView('input')} refreshKey={refreshKey} />
        )}
      </main>
    </div>
  )
}
