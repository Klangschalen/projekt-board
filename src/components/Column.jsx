import React from 'react';
import TaskCard from './TaskCard.jsx';

export default function Column({ column, tasks, onMove }) {
  function handleDrop(e) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    onMove(id, column.id);
  }

  const sorted = [...tasks].sort((a, b) => (b.ice || 0) - (a.ice || 0));

  return (
    <div className="column" onDrop={handleDrop} onDragOver={e => e.preventDefault()}>
      <div className="column-header" style={{ borderTopColor: column.color }}>
        <h2>{column.label}</h2>
        <span className="column-count">{tasks.length}</span>
      </div>
      <div className="column-tasks">
        {sorted.map(task => <TaskCard key={task.id} task={task} />)}
      </div>
    </div>
  );
}
