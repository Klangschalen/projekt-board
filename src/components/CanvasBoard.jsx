import React, { useState, useMemo } from 'react';

const STATUS_CONFIG = {
  offen:    { label: 'Offen',     color: '#e74c3c', bg: '#fdf2f2' },
  aktiv:    { label: 'In Arbeit', color: '#f39c12', bg: '#fef9f0' },
  erledigt: { label: 'Erledigt',  color: '#27ae60', bg: '#f0fdf4' },
};

const PRIO_COLORS = {
  MUST: '#e74c3c', SHOULD: '#f39c12', COULD: '#3498db', WONT: '#95a5a6',
};

function IceBadge({ score }) {
  if (score == null) return null;
  const color = score >= 7 ? '#27ae60' : score >= 4 ? '#f39c12' : '#e74c3c';
  return (
    <span className="canvas-ice-badge" style={{ color, borderColor: color }}>
      ICE {score}
    </span>
  );
}

function ProjectCard({ project, tasks, onTaskClick }) {
  const [collapsed, setCollapsed] = useState(false);
  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter(t => t.status === 'erledigt').length;
    const active = tasks.filter(t => t.status === 'aktiv').length;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, active, progress };
  }, [tasks]);

  return (
    <div className="canvas-project-card">
      <div className="canvas-project-header" onClick={() => setCollapsed(!collapsed)}>
        <div className="canvas-project-title-row">
          <span className="canvas-collapse-icon">{collapsed ? '▶' : '▼'}</span>
          <h3 className="canvas-project-name">{project || 'Ohne Projekt'}</h3>
          <span className="canvas-task-count">{stats.total} Aufgaben</span>
        </div>
        <div className="canvas-project-progress">
          <div className="canvas-progress-bar">
            <div
              className="canvas-progress-fill"
              style={{ width: `${stats.progress}%` }}
            />
          </div>
          <span className="canvas-progress-label">{stats.progress}%</span>
        </div>
        <div className="canvas-project-stats">
          {stats.active > 0 && (
            <span className="canvas-stat canvas-stat-active">{stats.active} aktiv</span>
          )}
          {stats.done > 0 && (
            <span className="canvas-stat canvas-stat-done">{stats.done} erledigt</span>
          )}
        </div>
      </div>

      {!collapsed && (
        <div className="canvas-task-grid">
          {tasks.map(task => (
            <CanvasTaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </div>
      )}
    </div>
  );
}

function CanvasTaskCard({ task, onClick }) {
  const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.offen;
  const overdue = task.deadline && new Date(task.deadline) < new Date();

  return (
    <div
      className="canvas-task-card"
      style={{ borderLeftColor: statusCfg.color, backgroundColor: statusCfg.bg }}
      onClick={onClick}
    >
      <div className="canvas-task-top">
        <span
          className="canvas-prio-dot"
          style={{ backgroundColor: PRIO_COLORS[task.prio] || '#95a5a6' }}
          title={task.prio}
        />
        <IceBadge score={task.ice} />
        <span
          className="canvas-status-dot"
          style={{ backgroundColor: statusCfg.color }}
          title={statusCfg.label}
        />
      </div>
      <h4 className="canvas-task-title">{task.titel}</h4>
      <div className="canvas-task-footer">
        {task.wer && <span className="canvas-task-wer">{task.wer}</span>}
        {task.deadline && (
          <span className={`canvas-task-deadline ${overdue ? 'overdue' : ''}`}>
            {task.deadline}
          </span>
        )}
      </div>
    </div>
  );
}

function StatusLane({ status, tasks, onTaskClick }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <div className="canvas-lane" style={{ borderTopColor: cfg.color }}>
      <div className="canvas-lane-header" style={{ backgroundColor: cfg.bg }}>
        <span className="canvas-lane-dot" style={{ backgroundColor: cfg.color }} />
        <span className="canvas-lane-label">{cfg.label}</span>
        <span className="canvas-lane-count">{tasks.length}</span>
      </div>
      <div className="canvas-lane-tasks">
        {tasks.map(task => (
          <CanvasTaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
        ))}
        {tasks.length === 0 && (
          <div className="canvas-lane-empty">Keine Aufgaben</div>
        )}
      </div>
    </div>
  );
}

export default function CanvasBoard({ tasks, onTaskClick }) {
  const [viewMode, setViewMode] = useState('project'); // 'project' | 'status' | 'ice'

  // Gruppierung nach Projekt
  const byProject = useMemo(() => {
    const groups = {};
    for (const task of tasks) {
      const key = task.project || '';
      if (!groups[key]) groups[key] = [];
      groups[key].push(task);
    }
    // Sortiere Projekte: zuerst benannte, dann ohne Projekt
    return Object.entries(groups).sort(([a], [b]) => {
      if (!a) return 1;
      if (!b) return -1;
      return a.localeCompare(b);
    });
  }, [tasks]);

  // Gruppierung nach Status
  const byStatus = useMemo(() => ({
    offen: tasks.filter(t => t.status === 'offen'),
    aktiv: tasks.filter(t => t.status === 'aktiv'),
    erledigt: tasks.filter(t => t.status === 'erledigt'),
  }), [tasks]);

  // ICE-Rangliste
  const byIce = useMemo(() => {
    return [...tasks].sort((a, b) => (b.ice || 0) - (a.ice || 0));
  }, [tasks]);

  return (
    <div className="canvas-board">
      {/* Ansichts-Umschalter */}
      <div className="canvas-view-switcher">
        <button
          className={`canvas-view-btn ${viewMode === 'project' ? 'active' : ''}`}
          onClick={() => setViewMode('project')}
        >
          Nach Projekt
        </button>
        <button
          className={`canvas-view-btn ${viewMode === 'status' ? 'active' : ''}`}
          onClick={() => setViewMode('status')}
        >
          Nach Status (Kanban)
        </button>
        <button
          className={`canvas-view-btn ${viewMode === 'ice' ? 'active' : ''}`}
          onClick={() => setViewMode('ice')}
        >
          ICE-Rangliste
        </button>
      </div>

      {/* Projekt-Ansicht */}
      {viewMode === 'project' && (
        <div className="canvas-project-view">
          {byProject.map(([project, projectTasks]) => (
            <ProjectCard
              key={project || '__none__'}
              project={project}
              tasks={projectTasks}
              onTaskClick={onTaskClick}
            />
          ))}
          {byProject.length === 0 && (
            <div className="canvas-empty">Keine Aufgaben vorhanden.</div>
          )}
        </div>
      )}

      {/* Status-Ansicht (Kanban) */}
      {viewMode === 'status' && (
        <div className="canvas-status-view">
          {Object.keys(STATUS_CONFIG).map(status => (
            <StatusLane
              key={status}
              status={status}
              tasks={byStatus[status] || []}
              onTaskClick={onTaskClick}
            />
          ))}
        </div>
      )}

      {/* ICE-Rangliste */}
      {viewMode === 'ice' && (
        <div className="canvas-ice-view">
          <div className="canvas-ice-header">
            <span>Rang</span>
            <span>Aufgabe</span>
            <span>ICE</span>
            <span>Priorität</span>
            <span>Status</span>
            <span>Projekt</span>
          </div>
          {byIce.map((task, idx) => {
            const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.offen;
            return (
              <div
                key={task.id}
                className="canvas-ice-row"
                onClick={() => onTaskClick(task)}
              >
                <span className="canvas-ice-rank">#{idx + 1}</span>
                <span className="canvas-ice-task-title">{task.titel}</span>
                <IceBadge score={task.ice} />
                <span
                  className="canvas-prio-badge"
                  style={{ color: PRIO_COLORS[task.prio] || '#95a5a6' }}
                >
                  {task.prio}
                </span>
                <span
                  className="canvas-status-label"
                  style={{ color: statusCfg.color }}
                >
                  {statusCfg.label}
                </span>
                <span className="canvas-project-label">{task.project || '—'}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
