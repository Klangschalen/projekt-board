import React, { useState } from 'react';

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AusgabeCard({ ausgabe }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="ausgabe-card" onClick={() => setExpanded(!expanded)}>
      <div className="ausgabe-header">
        <span className="ausgabe-title">{ausgabe.title}</span>
        <span className="ausgabe-size">{formatSize(ausgabe.size)}</span>
      </div>
      <div className="ausgabe-meta">
        <span className="ausgabe-file">{ausgabe.file}</span>
      </div>
      {expanded && (
        <div className="ausgabe-content">
          <pre>{ausgabe.content}</pre>
        </div>
      )}
    </div>
  );
}

export default function DeepResearch({ ausgaben }) {
  const [selectedDate, setSelectedDate] = useState(null);

  if (!ausgaben || ausgaben.length === 0) {
    return (
      <div className="research-panel">
        <h2>Deep Research / Ausgaben</h2>
        <p className="empty-state">Keine Ausgaben gefunden in ~/.claude/docs/ausgaben/</p>
      </div>
    );
  }

  // Nach Datum gruppieren
  const byDate = {};
  for (const a of ausgaben) {
    if (!byDate[a.date]) byDate[a.date] = [];
    byDate[a.date].push(a);
  }
  const dates = Object.keys(byDate).sort().reverse();
  const activeDate = selectedDate || dates[0];

  return (
    <div className="research-panel">
      <h2>Deep Research / Ausgaben ({ausgaben.length} Dateien)</h2>

      <div className="research-layout">
        <div className="date-sidebar">
          {dates.map(date => (
            <button
              key={date}
              className={`date-btn ${date === activeDate ? 'date-active' : ''}`}
              onClick={() => setSelectedDate(date)}
            >
              <span className="date-label">{date}</span>
              <span className="date-count">{byDate[date].length}</span>
            </button>
          ))}
        </div>

        <div className="ausgaben-list">
          <h3>{activeDate} ({byDate[activeDate]?.length || 0} Dateien)</h3>
          {(byDate[activeDate] || []).map(a => (
            <AusgabeCard key={a.path} ausgabe={a} />
          ))}
        </div>
      </div>
    </div>
  );
}
