import React from 'react';

export default function Header({ personen, projekte, filter, onFilter, taskCount }) {
  return (
    <header className="header">
      <div className="header-left">
        <h1>Sound-Spirit Projekt-Board</h1>
        {taskCount > 0 && <span className="task-count">{taskCount} Aufgaben</span>}
      </div>
      <div className="header-right">
        {personen.length > 0 && (
          <select value={filter} onChange={e => onFilter(e.target.value)}>
            <option value="alle">Alle</option>
            <optgroup label="Person">
              {personen.map(p => <option key={p} value={p}>{p}</option>)}
            </optgroup>
            <optgroup label="Projekt">
              {projekte.map(p => <option key={p} value={p}>{p}</option>)}
            </optgroup>
          </select>
        )}
      </div>
    </header>
  );
}
