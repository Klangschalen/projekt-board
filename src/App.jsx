import React, { useState, useEffect } from 'react';
import Board from './components/Board.jsx';
import Header from './components/Header.jsx';
import Login from './components/Login.jsx';
import {
  signInWithEmail, signInWithGoogle, signOut,
  restoreSession, handleOAuthCallback, fetchUser,
  loadTasks, updateTaskStatus
} from './data/supabase.js';

const DB_STATUS = { offen: 'IDEE', aktiv: 'IN_ARBEIT', erledigt: 'FERTIG' };

export default function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('alle');
  const [loading, setLoading] = useState(true);
  const [googleEnabled, setGoogleEnabled] = useState(false);

  useEffect(() => {
    async function init() {
      // Google OAuth Callback pruefen
      const oauthResult = handleOAuthCallback();
      if (oauthResult) {
        const u = await fetchUser();
        if (u) { setUser(u); await fetchTasks(); return; }
      }

      // Gespeicherte Session pruefen
      const restored = restoreSession();
      if (restored) {
        const u = await fetchUser();
        if (u) { setUser(u); await fetchTasks(); return; }
      }
      setLoading(false);
    }

    // Google Provider Status pruefen
    fetch('https://hdxmswteiesvcwqdgpwm.supabase.co/auth/v1/settings', {
      headers: { apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkeG1zd3RlaWVzdmN3cWRncHdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NjE2MDAsImV4cCI6MjA1ODMzNzYwMH0.yFcCkOskWJ5wBjIxPCJN6vOI2r9L44jcJIPfAyEA76I' }
    })
      .then(r => r.json())
      .then(d => setGoogleEnabled(d?.external?.google === true))
      .catch(() => {});

    init();
  }, []);

  async function fetchTasks() {
    try {
      setTasks(await loadTasks());
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function handleEmailLogin(email, password) {
    await signInWithEmail(email, password);
    const u = await fetchUser();
    setUser(u);
    setLoading(true);
    await fetchTasks();
  }

  function handleLogout() {
    signOut();
    setUser(null);
    setTasks([]);
  }

  async function moveTask(id, newStatus) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    await updateTaskStatus(id, DB_STATUS[newStatus] || 'IDEE');
  }

  if (!user && !loading) {
    return <Login
      onEmailLogin={handleEmailLogin}
      onGoogleLogin={signInWithGoogle}
      googleEnabled={googleEnabled}
    />;
  }
  if (loading) return <div className="app"><p>Lade...</p></div>;

  const filtered = filter === 'alle' ? tasks : tasks.filter(t => t.wer === filter || t.project === filter);
  const personen = [...new Set(tasks.map(t => t.wer).filter(Boolean))];
  const projekte = [...new Set(tasks.map(t => t.project).filter(Boolean))];

  return (
    <div className="app">
      <Header personen={personen} projekte={projekte} filter={filter}
        onFilter={setFilter} taskCount={tasks.length} user={user} onLogout={handleLogout} />
      <Board tasks={filtered} onMove={moveTask} />
    </div>
  );
}
