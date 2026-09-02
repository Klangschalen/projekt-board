import React, { useState, useEffect } from 'react';
import Board from './components/Board.jsx';
import Header from './components/Header.jsx';
import NaechsteSession from './components/NaechsteSession.jsx';
import PlanOverview from './components/PlanOverview.jsx';
import DeepResearch from './components/DeepResearch.jsx';
import CanvasBoard from './components/CanvasBoard.jsx';
import TaskDetail from './components/TaskDetail.jsx';
import TeamView from './components/TeamView.jsx';
import Login from './components/Login.jsx';
import Portfolio from './components/Portfolio.jsx';
import {
  loadTasks, loadPortfolio, updateTaskStatus,
  getStoredSession, storeSession, signOut,
  loadUserProfile,
} from './data/supabase.js';

const DB_STATUS = { offen: 'IDEE', aktiv: 'IN_ARBEIT', erledigt: 'FERTIG' };

const TABS = [
  { id: 'session', label: 'Nächste Session', requiresAuth: false },
  { id: 'canvas', label: 'Canvas-Board', requiresAuth: false },
  { id: 'board', label: 'Kanban', requiresAuth: false },
  { id: 'moneymaker', label: 'Money-Maker', requiresAuth: false },
  { id: 'plans', label: 'Pläne', requiresAuth: false },
  { id: 'team', label: 'Team', requiresAuth: true },
  { id: 'research', label: 'Deep Research', requiresAuth: false },
];

export default function App() {
  // Auth State
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  // Tasks State
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('alle');
  const [loading, setLoading] = useState(true);
  const [supabaseOk, setSupabaseOk] = useState(null);

  // UI State
  const [tab, setTab] = useState('session');
  const [selectedTask, setSelectedTask] = useState(null);

  // Lokale Daten
  const [sessionData, setSessionData] = useState(null);
  const [plansData, setPlansData] = useState([]);
  const [ausgabenData, setAusgabenData] = useState([]);
  const [portfolioData, setPortfolioData] = useState([]);

  // Beim Start: Session aus localStorage laden
  useEffect(() => {
    const stored = getStoredSession();
    if (stored) {
      setSession(stored);
      loadUserProfile(stored.user?.id, stored.access_token).then(profile => {
        if (profile) setUserProfile(profile);
      });
    }
    loadLocalData();
    fetchTasksFromSupabase(stored?.access_token);
    fetchPortfolioFromSupabase(stored?.access_token);
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

  async function fetchTasksFromSupabase(token) {
    try {
      const loaded = await loadTasks(token);
      setTasks(loaded);
      setSupabaseOk(true);
    } catch (err) {
      console.warn('Supabase nicht erreichbar:', err.message);
      setSupabaseOk(false);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPortfolioFromSupabase(token) {
    try {
      setPortfolioData(await loadPortfolio(token));
    } catch (err) {
      console.warn('Portfolio nicht ladbar:', err.message);
    }
  }

  async function handleLogin(newSession) {
    storeSession(newSession);
    setSession(newSession);
    setShowLogin(false);
    const profile = await loadUserProfile(newSession.user?.id, newSession.access_token);
    if (profile) setUserProfile(profile);
    // Aufgaben mit Auth-Token neu laden (für vollständigen Zugriff)
    await fetchTasksFromSupabase(newSession.access_token);
    await fetchPortfolioFromSupabase(newSession.access_token);
  }

  async function handleLogout() {
    if (session?.access_token) {
      await signOut(session.access_token);
    }
    storeSession(null);
    setSession(null);
    setUserProfile(null);
    // Wieder anonym laden
    await fetchTasksFromSupabase(null);
    await fetchPortfolioFromSupabase(null);
  }

  async function moveTask(id, newStatus) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    const ok = await updateTaskStatus(id, DB_STATUS[newStatus] || 'IDEE', session?.access_token);
    if (!ok) {
      await fetchTasksFromSupabase(session?.access_token);
    }
  }

  function handleTaskClick(task) {
    setSelectedTask(task);
  }

  function handleRevenueChange(id, revenueCategory, estimatedRevenueImpact) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, revenueCategory, estimatedRevenueImpact } : t));
    setSelectedTask(prev => prev && prev.id === id ? { ...prev, revenueCategory, estimatedRevenueImpact } : prev);
    // Portfolio-Tab (Projekt-Aggregation) neu laden, damit Aenderung dort sofort sichtbar ist
    fetchPortfolioFromSupabase(session?.access_token);
  }

  function handleTabChange(tabId) {
    const tabConfig = TABS.find(t => t.id === tabId);
    if (tabConfig?.requiresAuth && !session) {
      setShowLogin(true);
      return;
    }
    setTab(tabId);
  }

  if (loading) return (
    <div className="app">
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Lade Daten...</p>
      </div>
    </div>
  );

  const filtered = filter === 'alle'
    ? tasks
    : filter === 'money-maker'
      ? tasks.filter(t => t.revenueCategory === 'DIRECT_REVENUE' || t.revenueCategory === 'INDIRECT_REVENUE')
      : tasks.filter(t => t.wer === filter || t.project === filter);
  const personen = [...new Set(tasks.map(t => t.wer).filter(Boolean))];
  const projekte = [...new Set(tasks.map(t => t.project).filter(Boolean))];

  return (
    <div className="app">
      {/* Login-Modal */}
      {showLogin && (
        <Login
          onLogin={handleLogin}
          onClose={() => setShowLogin(false)}
        />
      )}

      {/* Task-Detail-Modal */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          session={session}
          userProfile={userProfile}
          onClose={() => setSelectedTask(null)}
          onStatusChange={(id, newStatus) => {
            moveTask(id, newStatus);
            setSelectedTask(prev => prev ? { ...prev, status: newStatus } : null);
          }}
          onRevenueChange={handleRevenueChange}
        />
      )}

      {/* Header mit Auth-Status */}
      <Header
        personen={personen}
        projekte={projekte}
        filter={filter}
        onFilter={setFilter}
        taskCount={tasks.length}
        session={session}
        userProfile={userProfile}
        onLogin={() => setShowLogin(true)}
        onLogout={handleLogout}
      />

      {/* Navigation */}
      <nav className="tab-nav">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab-btn ${tab === t.id ? 'tab-active' : ''} ${t.requiresAuth && !session ? 'tab-locked' : ''}`}
            onClick={() => handleTabChange(t.id)}
            title={t.requiresAuth && !session ? 'Anmeldung erforderlich' : ''}
          >
            {t.label}
            {t.requiresAuth && !session && <span className="lock-icon"> 🔒</span>}
          </button>
        ))}
      </nav>

      {/* Supabase-Warnung */}
      {supabaseOk === false && (tab === 'board' || tab === 'canvas' || tab === 'moneymaker') && (
        <div className="notice notice-warn">
          Supabase-Verbindung fehlgeschlagen — Board zeigt keine Daten.
        </div>
      )}

      {/* Tab-Inhalt */}
      <div className="tab-content">
        {tab === 'session' && <NaechsteSession data={sessionData} />}
        {tab === 'canvas' && (
          <CanvasBoard tasks={filtered} onTaskClick={handleTaskClick} />
        )}
        {tab === 'board' && (
          <Board tasks={filtered} onMove={moveTask} onTaskClick={handleTaskClick} />
        )}
        {tab === 'moneymaker' && <Portfolio portfolio={portfolioData} tasks={tasks} onTaskClick={handleTaskClick} />}
        {tab === 'plans' && <PlanOverview plans={plansData} />}
        {tab === 'team' && (
          <TeamView session={session} userProfile={userProfile} />
        )}
        {tab === 'research' && <DeepResearch ausgaben={ausgabenData} />}
      </div>
    </div>
  );
}
