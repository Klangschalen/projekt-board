import React, { useState, useEffect } from 'react';
import Board from './components/Board.jsx';
import Header from './components/Header.jsx';
import Login from './components/Login.jsx';
import { signIn, signOut, restoreSession, isLoggedIn, loadTasks, updateTaskStatus } from './data/supabase.js';

const DB_STATUS = { offen: 'IDEE', aktiv: 'IN_ARBEIT', erledigt: 'FERTIG' };

export default function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('alle');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restored = restoreSession();
    if (restored) {
      setUser(restored);
      fetchTasks();
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchTasks() {
    try {
      const data = await loadTasks();
      setTasks(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function handleLogin(email, password) {
    const u = await signIn(email, password);
    setUser({ email: u.email });
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

  if (!user && !loading) return <Login onLogin={handleLogin} />;
  if (loading) return <div className="app"><p>Lade...</p></div>;

  const filtered = filter === 'alle' ? tasks : tasks.filter(t => t.wer === filter || t.project === filter);
  const personen = [...new Set(tasks.map(t => t.wer).filter(Boolean))];
  const projekte = [...new Set(tasks.map(t => t.project).filter(Boolean))];

  return (
    <div className="app">
      <Header
        personen={personen}
        projekte={projekte}
        filter={filter}
        onFilter={setFilter}
        taskCount={tasks.length}
        user={user}
        onLogout={handleLogout}
      />
      <Board tasks={filtered} onMove={moveTask} />
    </div>
  );
}
