// Figma node-id: 1639-343791
import { useState } from 'react';
import type { AISuccessResponse } from './types';
import MeetingInput from './components/MeetingInput';
import MeetingReview from './components/MeetingReview';
import Dashboard from './components/Dashboard';
import './App.css';

type View = 'input' | 'review' | 'dashboard';

interface ReviewState {
  aiResult: AISuccessResponse;
  submitter: string;
}

function App() {
  const [view, setView] = useState<View>('input');
  const [reviewState, setReviewState] = useState<ReviewState | null>(null);

  function handleAISuccess(aiResult: AISuccessResponse, submitter: string) {
    setReviewState({ aiResult, submitter });
    setView('review');
  }

  function handleSaved() {
    setReviewState(null);
    setView('dashboard');
  }

  function handleNewMeeting() {
    setReviewState(null);
    setView('input');
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <span className="app-logo">Meeting Notes</span>
          <nav className="app-nav">
            <button
              className={`nav-link ${view === 'input' ? 'nav-link--active' : ''}`}
              onClick={handleNewMeeting}
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
        {view === 'input' && (
          <MeetingInput onSuccess={handleAISuccess} />
        )}
        {view === 'review' && reviewState && (
          <MeetingReview
            aiResult={reviewState.aiResult}
            submitter={reviewState.submitter}
            onSaved={handleSaved}
            onBack={handleNewMeeting}
          />
        )}
        {view === 'dashboard' && (
          <Dashboard onNewMeeting={handleNewMeeting} />
        )}
      </main>
    </div>
  );
}

export default App;
