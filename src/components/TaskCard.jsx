import React, { useState } from 'react';

const PRIO_COLORS = {
  MUST: '#e74c3c',
  SHOULD: '#f39c12',
  COULD: '#3498db',
  WONT: '#95a5a6',
};

export default function TaskCard({ task, onUpdate }) {
  const [expanded, setExpanded] = useState(false);

  function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', task.id);
  }

  const deadlineClass = task.deadline && new Date(task.deadline) < new Date()
    ? 'deadline overdue' : 'deadline';

  return (
    <div
      className="task-card"
      draggable
      onDragStart={handleDragStart}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="task-top">
        <span
          className="prio-badge"
          style={{ backgroundColor: PRIO_COLORS[task.prio] || '#95a5a6' }}
        >
          {task.prio || '?'}
        </span>
        {task.ice && <span className="ice-badge">ICE {task.ice}</span>}
      </div>
      <h3 className="task-title">{task.titel}</h3>
      <div className="task-meta">
        {task.wer && <span className="task-wer">{task.wer}</span>}
        {task.deadline && <span className={deadlineClass}>{task.deadline}</span>}
      </div>
      {expanded && task.details && (
        <p className="task-details">{task.details}</p>
      )}
    </div>
  );
}
