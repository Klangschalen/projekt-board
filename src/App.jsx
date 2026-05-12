import React, { useState, useEffect } from 'react';
import Board from './components/Board.jsx';
import Header from './components/Header.jsx';
import { loadTasks, updateTaskStatus } from './data/storage.js';

const DB_STATUS = {
  'offen': 'IDEE',
  'aktiv': 'IN_ARBEIT',
  'erledigt': 'FERTIG',
};

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('alle');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTasks()
      .then(data => { setTasks(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  async function moveTask(id, newStatus) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    const dbStatus = DB_STATUS[newStatus] || 'IDEE';
    const ok = await updateTaskStatus(id, dbStatus);
    if (!ok) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status } : t));
    }
  }

  if (loading) return <div className="app"><p>Lade Aufgaben aus Supabase...</p></div>;
  if (error) return <div className="app"><p>Fehler: {error}</p></div>;

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
      />
      <Board tasks={filtered} onMove={moveTask} />
    </div>
  );
}
