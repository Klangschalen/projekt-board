import React from 'react';

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

function ProjectRow({ row }) {
  const isMoneyMaker = row.directRevenueCount > 0;
  const isUnclassified = row.classifiedPct < 20;

  return (
    <tr className={isMoneyMaker ? 'portfolio-row-money' : ''}>
      <td className="portfolio-project">
        {isMoneyMaker && <span className="money-maker-badge">Money-Maker</span>}
        {row.project}
      </td>
      <td className="portfolio-num">{row.entries}</td>
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
  );
}

export default function Portfolio({ portfolio }) {
  if (!portfolio || portfolio.length === 0) {
    return (
      <div className="portfolio-panel">
        <h2>Money-Maker-Projekte</h2>
        <p className="empty-state">Keine Portfolio-Daten geladen (Supabase-Verbindung pruefen).</p>
      </div>
    );
  }

  const sorted = [...portfolio].sort((a, b) => {
    if (a.directRevenueCount !== b.directRevenueCount) return b.directRevenueCount - a.directRevenueCount;
    const revA = a.sumEstimatedRevenueEur || 0;
    const revB = b.sumEstimatedRevenueEur || 0;
    if (revA !== revB) return revB - revA;
    return (b.avgIce || 0) - (a.avgIce || 0);
  });

  const totalEntries = portfolio.reduce((s, r) => s + r.entries, 0);
  const totalClassified = portfolio.reduce((s, r) => s + r.directRevenueCount + r.indirectRevenueCount, 0);
  const totalRevenueEur = portfolio.reduce((s, r) => s + (r.sumEstimatedRevenueEur || 0), 0);
  const moneyMakerCount = portfolio.filter(r => r.directRevenueCount > 0).length;

  return (
    <div className="portfolio-panel">
      <h2>Money-Maker-Projekte ({moneyMakerCount} von {portfolio.length} Projekten mit direktem Umsatzbezug)</h2>

      <div className="portfolio-stats">
        <div className="portfolio-stat">
          <span className="portfolio-stat-value">{totalEntries}</span>
          <span className="portfolio-stat-label">Eintraege gesamt</span>
        </div>
        <div className="portfolio-stat">
          <span className="portfolio-stat-value">{Math.round((totalClassified / totalEntries) * 100)}%</span>
          <span className="portfolio-stat-label">umsatz-klassifiziert</span>
        </div>
        <div className="portfolio-stat">
          <span className="portfolio-stat-value">{formatEur(totalRevenueEur) || '-'}</span>
          <span className="portfolio-stat-label">geschaetzter Umsatz (nur beziffert)</span>
        </div>
      </div>

      {totalClassified / totalEntries < 0.3 && (
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
              <th>Eintraege</th>
              <th>Ø ICE</th>
              <th>Max ICE</th>
              <th>Umsatz-Klassifizierung</th>
              <th>Umsatz geschaetzt</th>
              <th>MUST</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(row => <ProjectRow key={row.project} row={row} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
