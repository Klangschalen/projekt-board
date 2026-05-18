import React from 'react';
import { PHASES, phaseFromTask } from '../data/supabase.js';

/**
 * PhaseBoard - 6-Spalten gstack-View (Garry Tan)
 *
 * Spalten: THINK / PLAN / BUILD / REVIEW / TEST / SHIP
 *
 * Datenquelle: gleiches `tasks`-Array wie Board.jsx.
 * Phase wird ermittelt aus:
 *   1) task.phase  (wenn DB-Schema-Patch ausgefuehrt - siehe
 *      claude-config/tools/supabase_add_phase_column.sql)
 *   2) Fallback aus task.dbStatus per phaseFromTask() Mapping in supabase.js
 *
 * Iteration 1 ist READ-ONLY (kein Drag-and-Drop zwischen Phasen).
 * Drag-Move kommt in Iteration 2 wenn Frank Schreibrechte explizit will -
 * bis dahin nutzen Mitarbeiter weiter den klassischen Board-Tab.
 */
export default function PhaseBoard({ tasks }) {
  // Gruppieren
  const grouped = {};
  for (const p of PHASES) grouped[p] = [];
  grouped.UNASSIGNED = [];

  for (const t of tasks) {
    const phase = phaseFromTask(t);
    if (phase && grouped[phase]) {
      grouped[phase].push(t);
    } else {
      grouped.UNASSIGNED.push(t);
    }
  }

  const totalAssigned = PHASES.reduce((sum, p) => sum + grouped[p].length, 0);
  const totalShip = grouped.SHIP.length;
  const progress = totalAssigned > 0 ? Math.round((totalShip / totalAssigned) * 100) : 0;

  return (
    <div className="phase-board">
      <div className="phase-summary">
        <strong>gstack-Phasen-View (Garry Tan)</strong>
        <span className="phase-progress">
          Goal-Fortschritt: {totalShip}/{totalAssigned} im SHIP ({progress}%)
        </span>
        {grouped.UNASSIGNED.length > 0 && (
          <span className="phase-warn">
            {grouped.UNASSIGNED.length} Tasks ohne Phase-Zuordnung
          </span>
        )}
      </div>

      <div className="phase-grid">
        {PHASES.map((p) => (
          <div className="phase-col" key={p}>
            <div className="phase-col-head">
              <span className="phase-name">{p}</span>
              <span className="phase-count">{grouped[p].length}</span>
            </div>
            <div className="phase-col-body">
              {grouped[p].length === 0 && (
                <p className="phase-empty">leer</p>
              )}
              {grouped[p].map((t) => (
                <div className="phase-card" key={t.id}>
                  <div className="phase-card-title">{t.titel}</div>
                  <div className="phase-card-meta">
                    {t.prio && <span className={`pill pill-${t.prio.toLowerCase()}`}>{t.prio}</span>}
                    {typeof t.ice === 'number' && <span className="pill">ICE {t.ice.toFixed(1)}</span>}
                    {t.project && <span className="pill">{t.project}</span>}
                  </div>
                  {t.deadline && (
                    <div className="phase-card-deadline">Deadline: {t.deadline}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {grouped.UNASSIGNED.length > 0 && (
        <details className="phase-unassigned">
          <summary>{grouped.UNASSIGNED.length} Tasks ohne Phase-Zuordnung anzeigen</summary>
          <ul>
            {grouped.UNASSIGNED.map((t) => (
              <li key={t.id}>
                <code>[{t.dbStatus || 'STATUS?'}]</code> {t.titel}
              </li>
            ))}
          </ul>
          <p className="phase-tip">
            Tipp: Phase ueber DB-Schema-Patch
            (<code>tools/supabase_add_phase_column.sql</code>) setzen,
            oder weiter ueber den klassischen Board-Tab arbeiten.
          </p>
        </details>
      )}
    </div>
  );
}
