import React, { useState, useEffect } from 'react';
import Board from './components/Board.jsx';
import Header from './components/Header.jsx';
import NaechsteSession from './components/NaechsteSession.jsx';
import PlanOverview from './components/PlanOverview.jsx';
import DeepResearch from './components/DeepResearch.jsx';
import Portfolio from './components/Portfolio.jsx';
import { loadTasks, loadPortfolio, updateTaskStatus } from './data/supabase.js';

const DB_STATUS = { offen: 'IDEE', aktiv: 'IN_ARBEIT', erledigt: 'FERTIG' };

const TABS = [
  { id: 'session', label: 'Naechste Session' },
  { id: 'board', label: 'Board' },
  { id: 'moneymaker', label: 'Money-Maker' },
  { id: 'plans', label: 'Plaene' },
  { id: 'research', label: 'Deep Research' },
];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('alle');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('session');
  const [supabaseOk, setSupabaseOk] = useState(null);

  const [sessionData, setSessionData] = useState(null);
  const [plansData, setPlansData] = useState([]);
  const [ausgabenData, setAusgabenData] = useState([]);
  const [portfolioData, setPortfolioData] = useState([]);

  useEffect(() => {
    async function init() {
      loadLocalData();
      await Promise.all([fetchTasksFromSupabase(), fetchPortfolioFromSupabase()]);
      setLoading(false);
    }
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

  async function fetchTasksFromSupabase() {
    try {
      const loaded = await loadTasks();
      setTasks(loaded);
      setSupabaseOk(true);
    } catch (err) {
      console.warn('Supabase nicht erreichbar:', err.message);
      setSupabaseOk(false);
    }
  }

  async function fetchPortfolioFromSupabase() {
    try {
      setPortfolioData(await loadPortfolio());
    } catch (err) {
      console.warn('Portfolio nicht ladbar:', err.message);
    }
  }

  async function moveTask(id, newStatus) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    const ok = await updateTaskStatus(id, DB_STATUS[newStatus] || 'IDEE');
    if (!ok) {
      await fetchTasksFromSupabase();
    }
  }

  if (loading) return <div className="app"><p>Lade...</p></div>;

  const filtered = filter === 'alle' ? tasks : tasks.filter(t => t.wer === filter || t.project === filter);
  const personen = [...new Set(tasks.map(t => t.wer).filter(Boolean))];
  const projekte = [...new Set(tasks.map(t => t.project).filter(Boolean))];

  return (
    <div className="app">
      <Header
        personen={personen} projekte={projekte} filter={filter}
        onFilter={setFilter} taskCount={tasks.length}
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
          Supabase-Verbindung fehlgeschlagen - Board zeigt keine Daten.
        </div>
      )}

      <div className="tab-content">
        {tab === 'session' && <NaechsteSession data={sessionData} />}
        {tab === 'board' && <Board tasks={filtered} onMove={moveTask} />}
        {tab === 'moneymaker' && <Portfolio portfolio={portfolioData} />}
        {tab === 'plans' && <PlanOverview plans={plansData} />}
        {tab === 'research' && <DeepResearch ausgaben={ausgabenData} />}
      </div>
    </div>
  );
}
