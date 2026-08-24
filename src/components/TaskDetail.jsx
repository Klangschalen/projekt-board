import React, { useState, useEffect, useRef } from 'react';
import { loadComments, addComment, deleteComment, updateTaskRevenue } from '../data/supabase.js';

const PRIO_COLORS = {
  MUST: '#e74c3c',
  SHOULD: '#f39c12',
  COULD: '#3498db',
  WONT: '#95a5a6',
};

const REVENUE_OPTIONS = [
  { value: 'NO_REVENUE', label: 'Kein Umsatz', hint: 'Interne Aufgabe, kein direkter Geld-Effekt' },
  { value: 'INDIRECT_REVENUE', label: 'Indirekt', hint: 'Hilft dabei, Umsatz zu machen (z.B. Marketing, Vorbereitung)' },
  { value: 'DIRECT_REVENUE', label: 'Direkt', hint: 'Bringt unmittelbar Umsatz (z.B. neues Produkt, Shop-Änderung)' },
];

const STATUS_LABELS = {
  IDEE: 'Idee', EVALUATING: 'In Bewertung', EVALUATED: 'Bewertet',
  GEPLANT: 'Geplant', IN_ARBEIT: 'In Arbeit', PAUSIERT: 'Pausiert',
  FERTIG: 'Fertig', VERWORFEN: 'Verworfen',
};

function Avatar({ profile, size = 32 }) {
  if (!profile) return (
    <div className="avatar-placeholder" style={{ width: size, height: size, fontSize: size * 0.4 }}>?</div>
  );
  if (profile.avatar_url) return (
    <img src={profile.avatar_url} alt={profile.full_name} className="avatar-img" style={{ width: size, height: size }} />
  );
  const initials = (profile.full_name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div className="avatar-initials" style={{ width: size, height: size, fontSize: size * 0.35 }}>
      {initials}
    </div>
  );
}

function CommentItem({ comment, currentUserId, onDelete }) {
  const profile = comment.user_profiles;
  const isOwn = profile?.id === currentUserId;
  const date = new Date(comment.created_at).toLocaleString('de-DE', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className={`comment-item ${isOwn ? 'comment-own' : ''}`}>
      <div className="comment-header">
        <Avatar profile={profile} size={28} />
        <span className="comment-author">{profile?.full_name || 'Unbekannt'}</span>
        <span className="comment-date">{date}</span>
        {isOwn && (
          <button className="comment-delete-btn" onClick={() => onDelete(comment.id)} title="Kommentar löschen">
            ×
          </button>
        )}
      </div>
      <div className="comment-content">{comment.content}</div>
    </div>
  );
}

export default function TaskDetail({ task, session, userProfile, onClose, onStatusChange, onRevenueChange }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [revenueCategory, setRevenueCategory] = useState(task?.revenueCategory || 'NO_REVENUE');
  const [revenueEur, setRevenueEur] = useState(task?.estimatedRevenueImpact ?? '');
  const [savingRevenue, setSavingRevenue] = useState(false);
  const [revenueSaved, setRevenueSaved] = useState(false);
  const textareaRef = useRef(null);
  const token = session?.access_token;

  useEffect(() => {
    setRevenueCategory(task?.revenueCategory || 'NO_REVENUE');
    setRevenueEur(task?.estimatedRevenueImpact ?? '');
    setRevenueSaved(false);
  }, [task?.id]);

  async function handleSaveRevenue() {
    if (!token) return;
    setSavingRevenue(true);
    const eurValue = revenueEur === '' ? null : Number(revenueEur);
    const ok = await updateTaskRevenue(task.id, revenueCategory, eurValue, token);
    if (ok) {
      setRevenueSaved(true);
      onRevenueChange?.(task.id, revenueCategory, eurValue);
    } else {
      setError('Umsatz-Einschätzung konnte nicht gespeichert werden.');
    }
    setSavingRevenue(false);
  }

  useEffect(() => {
    if (task && token) {
      fetchComments();
    }
  }, [task?.id]);

  async function fetchComments() {
    setLoadingComments(true);
    try {
      const data = await loadComments(task.id, token);
      setComments(data);
    } catch (err) {
      console.warn('Kommentare konnten nicht geladen werden:', err);
    }
    setLoadingComments(false);
  }

  async function handleSubmitComment(e) {
    e.preventDefault();
    if (!newComment.trim() || !userProfile) return;
    setSubmitting(true);
    setError('');
    try {
      await addComment(task.id, userProfile.id, newComment.trim(), token);
      setNewComment('');
      await fetchComments();
    } catch (err) {
      setError(err.message);
    }
    setSubmitting(false);
  }

  async function handleDeleteComment(commentId) {
    if (!confirm('Kommentar wirklich löschen?')) return;
    await deleteComment(commentId, token);
    setComments(prev => prev.filter(c => c.id !== commentId));
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  if (!task) return null;

  const overdue = task.deadline && new Date(task.deadline) < new Date();

  return (
    <div className="task-detail-overlay" onClick={handleOverlayClick}>
      <div className="task-detail-modal">
        {/* Header */}
        <div className="task-detail-header">
          <div className="task-detail-badges">
            <span className="prio-badge" style={{ backgroundColor: PRIO_COLORS[task.prio] || '#95a5a6' }}>
              {task.prio}
            </span>
            {task.ice != null && <span className="ice-badge">ICE {task.ice}</span>}
            <span className="status-badge">{STATUS_LABELS[task.dbStatus] || task.dbStatus}</span>
          </div>
          <button className="task-detail-close" onClick={onClose}>×</button>
        </div>

        {/* Titel */}
        <h2 className="task-detail-title">{task.titel}</h2>

        {/* Meta-Informationen */}
        <div className="task-detail-meta">
          {task.project && (
            <div className="meta-item">
              <span className="meta-label">Projekt</span>
              <span className="meta-value project-badge">{task.project}</span>
            </div>
          )}
          {task.wer && (
            <div className="meta-item">
              <span className="meta-label">Erstellt von</span>
              <span className="meta-value">{task.wer}</span>
            </div>
          )}
          {task.deadline && (
            <div className="meta-item">
              <span className="meta-label">Deadline</span>
              <span className={`meta-value ${overdue ? 'text-danger' : ''}`}>{task.deadline}</span>
            </div>
          )}
        </div>

        {/* Status-Änderung */}
        {onStatusChange && (
          <div className="task-detail-status-change">
            <span className="meta-label">Status ändern:</span>
            <div className="status-buttons">
              {['offen', 'aktiv', 'erledigt'].map(s => (
                <button
                  key={s}
                  className={`status-btn ${task.status === s ? 'status-btn-active' : ''}`}
                  onClick={() => onStatusChange(task.id, s)}
                >
                  {s === 'offen' ? 'Offen' : s === 'aktiv' ? 'In Arbeit' : 'Erledigt'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Umsatz-Einschätzung */}
        {token && (
          <div className="task-detail-revenue">
            <span className="meta-label">Bringt das Umsatz?</span>
            <div className="revenue-buttons">
              {REVENUE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`revenue-option-btn ${revenueCategory === opt.value ? 'revenue-option-active' : ''}`}
                  title={opt.hint}
                  onClick={() => { setRevenueCategory(opt.value); setRevenueSaved(false); }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {revenueCategory !== 'NO_REVENUE' && (
              <div className="revenue-eur-input">
                <label htmlFor="revenue-eur">Geschätzter Umsatz in EUR (optional)</label>
                <input
                  id="revenue-eur"
                  type="number"
                  min="0"
                  placeholder="z.B. 5000"
                  value={revenueEur}
                  onChange={e => { setRevenueEur(e.target.value); setRevenueSaved(false); }}
                />
              </div>
            )}
            <button
              type="button"
              className="btn-primary revenue-save-btn"
              onClick={handleSaveRevenue}
              disabled={savingRevenue}
            >
              {savingRevenue ? 'Wird gespeichert...' : revenueSaved ? 'Gespeichert ✓' : 'Umsatz-Einschätzung speichern'}
            </button>
          </div>
        )}

        {/* Beschreibung / Vertiefung */}
        <div className="task-detail-description">
          <h3>Beschreibung</h3>
          {task.details ? (
            <p>{task.details}</p>
          ) : (
            <p className="empty-state">Keine Beschreibung vorhanden.</p>
          )}
        </div>

        {/* Kommentare */}
        <div className="task-detail-comments">
          <h3>Kommentare ({comments.length})</h3>

          {loadingComments ? (
            <p className="loading-text">Lade Kommentare...</p>
          ) : comments.length === 0 ? (
            <p className="empty-state">Noch keine Kommentare. Sei der Erste!</p>
          ) : (
            <div className="comments-list">
              {comments.map(c => (
                <CommentItem
                  key={c.id}
                  comment={c}
                  currentUserId={userProfile?.id}
                  onDelete={handleDeleteComment}
                />
              ))}
            </div>
          )}

          {/* Neuer Kommentar */}
          {token && userProfile ? (
            <form className="comment-form" onSubmit={handleSubmitComment}>
              <div className="comment-form-header">
                <Avatar profile={userProfile} size={32} />
                <textarea
                  ref={textareaRef}
                  className="comment-textarea"
                  placeholder="Kommentar schreiben..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  rows={3}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmitComment(e);
                  }}
                />
              </div>
              {error && <div className="error-msg">{error}</div>}
              <div className="comment-form-footer">
                <span className="comment-hint">Strg+Enter zum Absenden</span>
                <button type="submit" disabled={submitting || !newComment.trim()} className="btn-primary">
                  {submitting ? 'Wird gespeichert...' : 'Kommentieren'}
                </button>
              </div>
            </form>
          ) : (
            <p className="empty-state">Bitte anmelden um zu kommentieren.</p>
          )}
        </div>
      </div>
    </div>
  );
}
