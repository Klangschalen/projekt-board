import React, { useState } from 'react';

function formatEur(value) {
  if (value == null) return '-';
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
}

function RevenueBar({ direct, indirect, none, total }) {
  if (!total) return null;
  const pct = n => `${(n / total) * 100}%`;
  return (
    <div className="revenue-bar" title={`${direct} direkt / ${indirect} indirekt / ${none} unbewertet`}>
      {direct > 0 && <span className="revenue-seg revenue-direct" style={{ width: pct(direct) }} />}
      {indirect > 0 && <span className="revenue-seg revenue-indirect" style={{ width: pct(indirect) }} />}
      {none > 0 && <span className="revenue-seg revenue-none" style={{ width: pct(none) }} />}
    </div>
  );
}

const PRIO_COLORS = { MUST: '#e74c3c', SHOULD: '#f39c12', COULD: '#3498db', WONT: '#95a5a6' };

function OpenTasksList({ project, tasks, onTaskClick }) {
  const offen = tasks
    .filter(t => t.project === project && t.status !== 'erledigt')
    .sort((a, b) => (b.ice || 0) - (a.ice || 0));

  if (offen.length === 0) {
    return <p className="empty-state">Keine offenen Aufgaben mehr - alles zu diesem Projekt ist erledigt.</p>;
  }

  return (
    <ul className="portfolio-open-tasks">
      {offen.map(t => (
        <li key={t.id} onClick={() => onTaskClick?.(t)}>
          <span className="prio-badge" style={{ backgroundColor: PRIO_COLORS[t.prio] || '#95a5a6' }}>{t.prio || '?'}</span>
          <span className="portfolio-open-task-title">{t.titel}</span>
          {t.wer && <span className="task-wer">{t.wer}</span>}
        </li>
      ))}
    </ul>
  );
}

function ProjectRow({ row, tasks, expanded, onToggle, onTaskClick }) {
  const isMoneyMaker = row.directRevenueCount > 0;
  const isUnclassified = row.classifiedPct < 20;
  const openCount = row.openCount ?? row.entries;

  return (
    <>
      <tr className={isMoneyMaker ? 'portfolio-row-money' : ''} onClick={onToggle} style={{ cursor: 'pointer' }}>
        <td className="portfolio-project">
          <span className={`portfolio-expand-arrow ${expanded ? 'portfolio-expand-open' : ''}`}>▸</span>
          {isMoneyMaker && <span className="money-maker-badge">Money-Maker</span>}
          {row.project}
        </td>
        <td className="portfolio-num">{openCount} offen <span className="portfolio-total-hint">(von {row.entries})</span></td>
        <td className="portfolio-num"><span className="ice-badge">{row.avgIce}</span></td>
        <td className="portfolio-num">{row.maxIce}</td>
        <td>
          <RevenueBar
            direct={row.directRevenueCount}
            indirect={row.indirectRevenueCount}
            none={row.noRevenueCount}
            total={row.entries}
          />
          {isUnclassified && <span className="unclassified-badge">unbewertet</span>}
        </td>
        <td className="portfolio-num">{formatEur(row.sumEstimatedRevenueEur)}</td>
        <td className="portfolio-num">{row.mustCount || '-'}</td>
      </tr>
      {expanded && (
        <tr className="portfolio-row-expanded">
          <td colSpan={7}>
            <OpenTasksList project={row.project} tasks={tasks} onTaskClick={onTaskClick} />
          </td>
        </tr>
      )}
    </>
  );
}

export default function Portfolio({ portfolio, tasks = [], onTaskClick }) {
  const [expandedProject, setExpandedProject] = useState(null);

  if (!portfolio || portfolio.length === 0) {
    return (
      <div className="portfolio-panel">
        <h2>Money-Maker-Projekte</h2>
        <p className="empty-state">Keine Portfolio-Daten geladen (Supabase-Verbindung pruefen).</p>
      </div>
    );
  }

  // Projekte ohne offene Aufgaben (alles erledigt/verworfen) stehen dem Team nicht mehr im Weg -
  // separat unten, statt die Money-Maker-Rangliste mit totem Bestand zu verwaesseren.
  const aktiv = portfolio.filter(r => (r.openCount ?? r.entries) > 0);
  const komplettErledigt = portfolio.filter(r => (r.openCount ?? r.entries) === 0);

  const sorted = [...aktiv].sort((a, b) => {
    if (a.directRevenueCount !== b.directRevenueCount) return b.directRevenueCount - a.directRevenueCount;
    const revA = a.sumEstimatedRevenueEur || 0;
    const revB = b.sumEstimatedRevenueEur || 0;
    if (revA !== revB) return revB - revA;
    return (b.avgIce || 0) - (a.avgIce || 0);
  });

  const totalEntries = aktiv.reduce((s, r) => s + r.entries, 0);
  const totalClassified = aktiv.reduce((s, r) => s + r.directRevenueCount + r.indirectRevenueCount, 0);
  const totalRevenueEur = aktiv.reduce((s, r) => s + (r.sumEstimatedRevenueEur || 0), 0);
  const moneyMakerCount = aktiv.filter(r => r.directRevenueCount > 0).length;

  function toggle(project) {
    setExpandedProject(prev => prev === project ? null : project);
  }

  return (
    <div className="portfolio-panel">
      <h2>Money-Maker-Projekte ({moneyMakerCount} von {aktiv.length} aktiven Projekten mit direktem Umsatzbezug)</h2>
      <p className="portfolio-hint">Zeile anklicken zeigt die offenen Aufgaben des Projekts.</p>

      <div className="portfolio-stats">
        <div className="portfolio-stat">
          <span className="portfolio-stat-value">{totalEntries}</span>
          <span className="portfolio-stat-label">Eintraege in aktiven Projekten</span>
        </div>
        <div className="portfolio-stat">
          <span className="portfolio-stat-value">{totalEntries ? Math.round((totalClassified / totalEntries) * 100) : 0}%</span>
          <span className="portfolio-stat-label">umsatz-klassifiziert</span>
        </div>
        <div className="portfolio-stat">
          <span className="portfolio-stat-value">{formatEur(totalRevenueEur) || '-'}</span>
          <span className="portfolio-stat-label">geschaetzter Umsatz (nur beziffert)</span>
        </div>
      </div>

      {totalEntries > 0 && totalClassified / totalEntries < 0.3 && (
        <div className="notice notice-warn">
          Die meisten Eintraege sind noch auf Umsatz-Default "keine Angabe" - die Staffelung
          unten ist nur so gut wie die bisherige Klassifizierung. Umsatzkategorie + EUR-Schaetzung
          pro Eintrag nachtragen, um echte Money-Maker sichtbar zu machen.
        </div>
      )}

      <div className="portfolio-table-wrap">
        <table className="portfolio-table">
          <thead>
            <tr>
              <th>Projekt</th>
              <th>Aufgaben</th>
              <th>Ø ICE</th>
              <th>Max ICE</th>
              <th>Umsatz-Klassifizierung</th>
              <th>Umsatz geschaetzt</th>
              <th>MUST</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(row => (
              <ProjectRow
                key={row.project}
                row={row}
                tasks={tasks}
                expanded={expandedProject === row.project}
                onToggle={() => toggle(row.project)}
                onTaskClick={onTaskClick}
              />
            ))}
          </tbody>
        </table>
      </div>

      {komplettErledigt.length > 0 && (
        <details className="portfolio-done-section">
          <summary>{komplettErledigt.length} Projekte komplett erledigt (ausgeblendet, aufklappen zum Ansehen)</summary>
          <ul className="portfolio-done-list">
            {komplettErledigt.map(r => <li key={r.project}>{r.project} ({r.entries} Aufgaben, alle fertig/verworfen)</li>)}
          </ul>
        </details>
      )}
    </div>
  );
}
