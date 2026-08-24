import React from 'react';
import Column from './Column.jsx';

const COLUMNS = [
  { id: 'offen', label: 'Offen', color: '#e74c3c' },
  { id: 'aktiv', label: 'In Arbeit', color: '#f39c12' },
  { id: 'erledigt', label: 'Erledigt', color: '#27ae60' },
];

export default function Board({ tasks, onMove, onTaskClick }) {
  return (
    <div className="board">
      {COLUMNS.map(col => (
        <Column
          key={col.id}
          column={col}
          tasks={tasks.filter(t => t.status === col.id)}
          onMove={onMove}
          onTaskClick={onTaskClick}
        />
      ))}
    </div>
  );
}
