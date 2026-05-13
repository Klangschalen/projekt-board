import React, { useState } from 'react';

const STATUS_COLORS = {
  'OFFEN': '#e74c3c',
  'IN BEARBEITUNG': '#f39c12',
  'PHASE': '#3498db',
  'FERTIG': '#27ae60',
  'ERLEDIGT': '#27ae60',
};

function getStatusColor(status) {
  if (!status) return '#95a5a6';
  const upper = status.toUpperCase();
  for (const [key, color] of Object.entries(STATUS_COLORS)) {
    if (upper.includes(key)) return color;
  }
  return '#95a5a6';
}

function ProgressBar({ open, done, total }) {
  if (total === 0) return null;
  const pct = Math.round((done / total) * 100);
  return (
    <div className="progress-bar-container">
      <div className="progress-bar" style={{ width: `${pct}%` }} />
      <span className="progress-text">{done}/{total} ({pct}%)</span>
    </div>
  );
}

function PlanCard({ plan }) {
  const [expanded, setExpanded] = useState(false);
  const lastMod = new Date(plan.lastModified);

  return (
    <div className="plan-card">
      <div className="plan-card-header" onClick={() => setExpanded(!expanded)}>
        <div className="plan-card-top">
          <span className="plan-status-badge" style={{ backgroundColor: getStatusColor(plan.status) }}>
            {plan.status}
          </span>
          <span className="plan-ice">{plan.ice}</span>
        </div>
        <h3 className="plan-title">{plan.title}</h3>
        <div className="plan-meta">
          <span>{lastMod.toLocaleDateString('de-DE')}</span>
          {plan.deadline !== '-' && <span className="plan-deadline">Deadline: {plan.deadline}</span>}
        </div>
        <ProgressBar open={plan.openItems} done={plan.doneItems} total={plan.totalItems} />
      </div>
      {expanded && (
        <div className="plan-detail">
          <pre className="plan-content">{plan.content}</pre>
        </div>
      )}
    </div>
  );
}

export default function PlanOverview({ plans }) {
  if (!plans || plans.length === 0) {
    return (
      <div className="plans-panel">
        <h2>Aktive Plaene</h2>
        <p className="empty-state">Keine Plaene gefunden in ~/.claude/plans/</p>
      </div>
    );
  }

  // Sortierung: Offene/In Bearbeitung zuerst, dann nach Datum
  const sorted = [...plans].sort((a, b) => {
    const aActive = !a.status.toUpperCase().includes('FERTIG') && !a.status.toUpperCase().includes('ERLEDIGT');
    const bActive = !b.status.toUpperCase().includes('FERTIG') && !b.status.toUpperCase().includes('ERLEDIGT');
    if (aActive !== bActive) return aActive ? -1 : 1;
    return b.lastModified.localeCompare(a.lastModified);
  });

  const activeCount = sorted.filter(p => {
    const s = p.status.toUpperCase();
    return !s.includes('FERTIG') && !s.includes('ERLEDIGT');
  }).length;

  return (
    <div className="plans-panel">
      <h2>Plaene ({activeCount} aktiv, {plans.length} gesamt)</h2>
      <div className="plans-grid">
        {sorted.map(plan => <PlanCard key={plan.file} plan={plan} />)}
      </div>
    </div>
  );
}
