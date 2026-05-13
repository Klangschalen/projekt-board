import React, { useState } from 'react';

function parseMarkdown(md) {
  if (!md) return '';
  // Einfacher Markdown-to-HTML Konverter
  let html = md
    // Tabellen
    .replace(/^\|(.+)\|$/gm, (match) => {
      const cells = match.split('|').filter(c => c.trim());
      if (cells.every(c => /^[\s-:]+$/.test(c))) return ''; // Separator
      const tag = 'td';
      return '<tr>' + cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('') + '</tr>';
    })
    // Headers
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Liste
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ol-item">$2</li>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Absaetze
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');

  // Tabellen wrappen
  if (html.includes('<tr>')) {
    html = html.replace(/(<tr>[\s\S]*?<\/tr>)+/g, '<table class="md-table">$&</table>');
  }

  return html;
}

export default function NaechsteSession({ data }) {
  const [expanded, setExpanded] = useState(true);

  if (!data || !data.exists) {
    return (
      <div className="session-panel">
        <h2>Naechste Session</h2>
        <p className="empty-state">Keine NAECHSTE-SESSION.md gefunden. Wird am Ende jeder Session automatisch erstellt.</p>
      </div>
    );
  }

  const lastMod = data.lastModified ? new Date(data.lastModified) : null;
  const isOld = lastMod && (Date.now() - lastMod.getTime()) > 24 * 60 * 60 * 1000;

  return (
    <div className="session-panel">
      <div className="session-header">
        <h2>Naechste Session - Hier weitermachen</h2>
        <div className="session-meta">
          {lastMod && (
            <span className={isOld ? 'session-date old' : 'session-date'}>
              Zuletzt: {lastMod.toLocaleDateString('de-DE')} {lastMod.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button className="toggle-btn" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Einklappen' : 'Aufklappen'}
          </button>
        </div>
      </div>
      {expanded && (
        <div
          className="session-content markdown-body"
          dangerouslySetInnerHTML={{ __html: parseMarkdown(data.content) }}
        />
      )}
    </div>
  );
}
