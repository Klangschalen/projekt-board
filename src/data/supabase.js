// ============================================================
// Sound-Spirit Team-Plattform: Supabase Client
// Erweitert um: Auth, Teams, User-Profile, Kommentare
// ============================================================

const SUPABASE_URL = 'https://hdxmswteiesvcwqdgpwm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkeG1zd3RlaWVzdmN3cWRncHdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NjU1OTQsImV4cCI6MjA4MzU0MTU5NH0.HcRVpgh-2pKaDYfg74WdT1G146xoARhtYepUeOrnYP4';

// ============================================================
// AUTH HELPERS
// ============================================================

function authHeaders(token, write = false) {
  const h = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${token || SUPABASE_ANON_KEY}`,
    'Accept-Profile': 'planning',
  };
  if (write) {
    h['Content-Profile'] = 'planning';
    h['Content-Type'] = 'application/json';
    h['Prefer'] = 'return=representation';
  }
  return h;
}

export async function signInWithEmail(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.msg || 'Login fehlgeschlagen');
  return data;
}

export async function signOut(token) {
  await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
    method: 'POST',
    headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${token}` },
  });
}

export function getStoredSession() {
  try {
    const raw = localStorage.getItem('sb_session');
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (session.expires_at && session.expires_at * 1000 < Date.now()) {
      localStorage.removeItem('sb_session');
      return null;
    }
    return session;
  } catch { return null; }
}

export function storeSession(session) {
  if (session) localStorage.setItem('sb_session', JSON.stringify(session));
  else localStorage.removeItem('sb_session');
}

// ============================================================
// USER PROFILE
// ============================================================

export async function loadUserProfile(userId, token) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/user_profiles?id=eq.${userId}&select=*`,
    { headers: authHeaders(token) }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data[0] || null;
}

export async function loadAllUserProfiles(token) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/user_profiles?select=id,full_name,avatar_url,role`,
    { headers: authHeaders(token) }
  );
  if (!res.ok) return [];
  return await res.json();
}

export async function updateUserProfile(userId, updates, token) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/user_profiles?id=eq.${userId}`,
    { method: 'PATCH', headers: authHeaders(token, true), body: JSON.stringify(updates) }
  );
  return res.ok;
}

// ============================================================
// TEAMS
// ============================================================

export async function loadMyTeams(token) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/teams?select=*,team_members(user_id,role_in_team,user_profiles(id,full_name,avatar_url))`,
    { headers: authHeaders(token) }
  );
  if (!res.ok) return [];
  return await res.json();
}

// ============================================================
// TASKS (idea_scores - erweitert)
// ============================================================

const STATUS_MAP = {
  'IDEE': 'offen', 'EVALUATING': 'offen', 'EVALUATED': 'offen',
  'GEPLANT': 'offen', 'IN_ARBEIT': 'aktiv', 'PAUSIERT': 'offen',
  'FERTIG': 'erledigt', 'VERWORFEN': 'erledigt',
};

export async function loadTasks(token) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/idea_scores?select=*&order=revenue_score.desc,ice_score.desc`,
    { headers: authHeaders(token) }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.map(row => ({
    id: String(row.id),
    titel: row.title,
    prio: row.moscow_priority || 'COULD',
    ice: row.ice_score,
    revenueCategory: row.revenue_category,
    revenueScore: row.revenue_score,
    estimatedRevenueImpact: row.estimated_revenue_impact,
    roas: row.roas,
    status: STATUS_MAP[row.status] || 'offen',
    dbStatus: row.status,
    wer: row.created_by || '',
    assigneeId: row.assignee_id || null,
    deadline: row.deadline || row.target_date || '',
    details: row.description || '',
    project: row.project || '',
    projectId: row.project_id || null,
    teamId: row.team_id || null,
    canvasPosition: row.canvas_position || { x: 0, y: 0 },
  }));
}

// Portfolio-Sicht je Projekt (planning.project_portfolio, aggregiert idea_scores):
// macht sichtbar, welche Projekte wirklich Money-Maker sind (direkter Umsatzbezug,
// geschaetzter Umsatz) und wie sie ICE-maessig gestaffelt sind.
export async function loadPortfolio(token) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/project_portfolio?select=*`,
    { headers: authHeaders(token) }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.map(row => ({
    project: row.project,
    entries: row.entries,
    avgIce: row.avg_ice,
    maxIce: row.max_ice,
    directRevenueCount: row.direct_revenue_count,
    indirectRevenueCount: row.indirect_revenue_count,
    noRevenueCount: row.no_revenue_count,
    classifiedPct: row.classified_pct,
    sumEstimatedRevenueEur: row.sum_estimated_revenue_eur,
    revenueEstimatesCount: row.revenue_estimates_count,
    mustCount: row.must_count,
    openCount: row.open_count,
  }));
}

export async function updateTaskStatus(id, newDbStatus, token) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/idea_scores?id=eq.${id}`,
    {
      method: 'PATCH',
      headers: authHeaders(token, true),
      body: JSON.stringify({ status: newDbStatus, updated_at: new Date().toISOString() }),
    }
  );
  return res.ok;
}

export async function updateTaskAssignee(id, assigneeId, token) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/idea_scores?id=eq.${id}`,
    {
      method: 'PATCH',
      headers: authHeaders(token, true),
      body: JSON.stringify({ assignee_id: assigneeId, updated_at: new Date().toISOString() }),
    }
  );
  return res.ok;
}

// ============================================================
// KOMMENTARE
// ============================================================

export async function loadComments(taskId, token) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/comments?task_id=eq.${taskId}&select=*,user_profiles(id,full_name,avatar_url)&order=created_at.asc`,
    { headers: authHeaders(token) }
  );
  if (!res.ok) return [];
  return await res.json();
}

export async function addComment(taskId, userId, content, token) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/comments`,
    {
      method: 'POST',
      headers: authHeaders(token, true),
      body: JSON.stringify({ task_id: parseInt(taskId), user_id: userId, content }),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Kommentar konnte nicht gespeichert werden');
  }
  return await res.json();
}

export async function deleteComment(commentId, token) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/comments?id=eq.${commentId}`,
    { method: 'DELETE', headers: authHeaders(token, true) }
  );
  return res.ok;
}
