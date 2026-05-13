import React, { useState, useEffect } from 'react';
import Board from './components/Board.jsx';
import Header from './components/Header.jsx';
import Login from './components/Login.jsx';
import NaechsteSession from './components/NaechsteSession.jsx';
import PlanOverview from './components/PlanOverview.jsx';
import DeepResearch from './components/DeepResearch.jsx';
import {
  signInWithEmail, signInWithGoogle, signOut,
  restoreSession, handleOAuthCallback, fetchUser,
  loadTasks, updateTaskStatus
} from './data/supabase.js';

const DB_STATUS = { offen: 'IDEE', aktiv: 'IN_ARBEIT', erledigt: 'FERTIG' };
const SUPABASE_URL = 'https://hdxmswteiesvcwqdgpwm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkeG1zd3RlaWVzdmN3cWRncHdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NjU1OTQsImV4cCI6MjA4MzU0MTU5NH0.HcRVpgh-2pKaDYfg74WdT1G146xoARhtYepUeOrnYP4';

const TABS = [
  { id: 'session', label: 'Naechste Session' },
  { id: 'board', label: 'Board' },
  { id: 'plans', label: 'Plaene' },
  { id: 'research', label: 'Deep Research' },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('alle');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('session');
  const [showLogin, setShowLogin] = useState(false);
  const [supabaseOk, setSupabaseOk] = useState(null);
  const [googleEnabled, setGoogleEnabled] = useState(false);

  // Lokale Daten
  const [sessionData, setSessionData] = useState(null);
  const [plansData, setPlansData] = useState([]);
  const [ausgabenData, setAusgabenData] = useState([]);

  useEffect(() => {
    async function init() {
      // Lokale Daten parallel laden
      loadLocalData();

      // OAuth Callback pruefen
      const oauthResult = handleOAuthCallback();
      if (oauthResult) {
        const u = await fetchUser();
        if (u) setUser(u);
      } else {
        // Gespeicherte Session pruefen
        const restored = restoreSession();
        if (restored) {
          const u = await fetchUser();
          if (u) setUser(u);
        }
      }

      // Tasks laden (auch ohne Auth - testet ob anon read geht)
      await fetchTasksWithFallback();
      setLoading(false);
    }

    // Google Provider pruefen
    fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: SUPABASE_ANON_KEY }
    })
      .then(r => r.json())
      .then(d => setGoogleEnabled(d?.external?.google === true))
      .catch(() => {});

    init();
  }, []);

  async function loadLocalData() {
    try {
      const [sessionRes, plansRes, ausgabenRes] = await Promise.all([
        fetch('./data/naechste-session.json').catch(() => null),
        fetch('./data/plans.json').catch(() => null),
        fetch('./data/ausgaben.json').catch(() => null),
      ]);
      if (sessionRes?.ok) setSessionData(await sessionRes.json());
      if (plansRes?.ok) setPlansData(await plansRes.json());
      if (ausgabenRes?.ok) setAusgabenData(await ausgabenRes.json());
    } catch (err) {
      console.warn('Lokale Daten konnten nicht geladen werden:', err);
    }
  }

  async function fetchTasksWithFallback() {
    try {
      const loaded = await loadTasks();
      setTasks(loaded);
      setSupabaseOk(true);
    } catch (err) {
      console.warn('Supabase nicht erreichbar:', err.message);
      setSupabaseOk(false);
    }
  }

  async function handleEmailLogin(email, password) {
    await signInWithEmail(email, password);
    const u = await fetchUser();
    setUser(u);
    setShowLogin(false);
    await fetchTasksWithFallback();
  }

  function handleLogout() {
    signOut();
    setUser(null);
  }

  async function moveTask(id, newStatus) {
    if (!user) {
      setShowLogin(true);
      return;
    }
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    const ok = await updateTaskStatus(id, DB_STATUS[newStatus] || 'IDEE');
    if (!ok) {
      // Rollback
      await fetchTasksWithFallback();
    }
  }

  if (showLogin) {
    return (
      <div>
        <button className="back-btn" onClick={() => setShowLogin(false)}>Zurueck zum Board</button>
        <Login
          onEmailLogin={handleEmailLogin}
          onGoogleLogin={signInWithGoogle}
          googleEnabled={googleEnabled}
        />
      </div>
    );
  }

  if (loading) return <div className="app"><p>Lade...</p></div>;

  const filtered = filter === 'alle' ? tasks : tasks.filter(t => t.wer === filter || t.project === filter);
  const personen = [...new Set(tasks.map(t => t.wer).filter(Boolean))];
  const projekte = [...new Set(tasks.map(t => t.project).filter(Boolean))];

  return (
    <div className="app">
      <Header
        personen={personen} projekte={projekte} filter={filter}
        onFilter={setFilter} taskCount={tasks.length} user={user}
        onLogout={handleLogout} onLogin={() => setShowLogin(true)}
      />

      <nav className="tab-nav">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab-btn ${tab === t.id ? 'tab-active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {supabaseOk === false && tab === 'board' && (
        <div className="notice notice-warn">
          Supabase-Verbindung fehlgeschlagen. Anon-Read RLS-Policy fehlt oder Key ungueltig.
          {!user && <button className="login-link" onClick={() => setShowLogin(true)}>Anmelden fuer Zugriff</button>}
        </div>
      )}

      <div className="tab-content">
        {tab === 'session' && <NaechsteSession data={sessionData} />}
        {tab === 'board' && <Board tasks={filtered} onMove={moveTask} />}
        {tab === 'plans' && <PlanOverview plans={plansData} />}
        {tab === 'research' && <DeepResearch ausgaben={ausgabenData} />}
      </div>
    </div>
  );
}
