import React, { useState, useEffect } from 'react';
import Board from './components/Board.jsx';
import Header from './components/Header.jsx';
import { loadTasks, saveTasks } from './data/storage.js';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('alle');

  useEffect(() => {
    setTasks(loadTasks());
  }, []);

  useEffect(() => {
    if (tasks.length > 0) saveTasks(tasks);
  }, [tasks]);

  function moveTask(id, newStatus) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  }

  function updateTask(id, updates) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }

  const filtered = filter === 'alle' ? tasks : tasks.filter(t => t.wer === filter);
  const personen = [...new Set(tasks.map(t => t.wer).filter(Boolean))];

  return (
    <div className="app">
      <Header
        personen={personen}
        filter={filter}
        onFilter={setFilter}
        taskCount={tasks.length}
      />
      <Board tasks={filtered} onMove={moveTask} onUpdate={updateTask} />
    </div>
  );
}
