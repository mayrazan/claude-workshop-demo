import './App.css'
import { MeetingForm } from './components/MeetingForm'

function App() {
  return (
    <main className="app">
      <header>
        <span className="app-badge">Meeting Intelligence</span>
        <h1>Meeting Notes Processor</h1>
        <p>Paste meeting notes to extract a summary and action items.</p>
      </header>
      <MeetingForm />
    </main>
  )
}

export default App
