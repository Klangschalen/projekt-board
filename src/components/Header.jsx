import React from 'react';

export default function Header({ personen, filter, onFilter, taskCount }) {
  return (
    <header className="header">
      <div className="header-left">
        <h1>Sound-Spirit Projekt-Board</h1>
        <span className="task-count">{taskCount} Aufgaben</span>
      </div>
      <div className="header-right">
        <label>Filter: </label>
        <select value={filter} onChange={e => onFilter(e.target.value)}>
          <option value="alle">Alle</option>
          {personen.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
    </header>
  );
}
