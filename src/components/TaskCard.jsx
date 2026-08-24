import React, { useState } from 'react';

const PRIO_COLORS = {
  MUST: '#e74c3c',
  SHOULD: '#f39c12',
  COULD: '#3498db',
  WONT: '#95a5a6',
};

const REVENUE_LABELS = {
  DIRECT_REVENUE: 'DIREKT',
  INDIRECT_REVENUE: 'INDIREKT',
};

const REVENUE_COLORS = {
  DIRECT_REVENUE: '#1e8449',
  INDIRECT_REVENUE: '#16a085',
};

export default function TaskCard({ task, onClick }) {
  const [expanded, setExpanded] = useState(false);

  function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', task.id);
  }

  function handleClick() {
    // Wenn ein Klick-Handler von aussen kommt (Task-Detail-Modal), diesen nutzen -
    // sonst wie bisher nur die Beschreibung lokal auf-/zuklappen.
    if (onClick) onClick();
    else setExpanded(!expanded);
  }

  const overdue = task.deadline && new Date(task.deadline) < new Date();

  return (
    <div className="task-card" draggable onDragStart={handleDragStart} onClick={handleClick}>
      <div className="task-top">
        <span className="prio-badge" style={{ backgroundColor: PRIO_COLORS[task.prio] || '#95a5a6' }}>
          {task.prio || '?'}
        </span>
        {task.ice != null && <span className="ice-badge">ICE {task.ice}</span>}
        {REVENUE_LABELS[task.revenueCategory] && (
          <span className="revenue-badge" style={{ backgroundColor: REVENUE_COLORS[task.revenueCategory] }}>
            {REVENUE_LABELS[task.revenueCategory]}
            {task.estimatedRevenueImpact != null && ` ~${task.estimatedRevenueImpact} EUR`}
          </span>
        )}
        {task.project && <span className="project-badge">{task.project}</span>}
      </div>
      <h3 className="task-title">{task.titel}</h3>
      <div className="task-meta">
        {task.wer && <span className="task-wer">{task.wer}</span>}
        {task.deadline && <span className={overdue ? 'deadline overdue' : 'deadline'}>{task.deadline}</span>}
      </div>
      {expanded && task.details && <p className="task-details">{task.details}</p>}
    </div>
  );
}
