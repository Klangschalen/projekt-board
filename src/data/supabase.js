const SUPABASE_URL = 'https://hdxmswteiesvcwqdgpwm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkeG1zd3RlaWVzdmN3cWRncHdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NjU1OTQsImV4cCI6MjA4MzU0MTU5NH0.HcRVpgh-2pKaDYfg74WdT1G146xoARhtYepUeOrnYP4';

let accessToken = null;
let currentUser = null;

// --- Auth ---

export async function signInWithEmail(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error_description || err.msg || 'Login fehlgeschlagen');
  }
  const data = await res.json();
  setSession(data.access_token, data.user);
  return data.user;
}

export function signInWithGoogle() {
  const redirectTo = window.location.origin + window.location.pathname;
  window.location.href = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`;
}

export function handleOAuthCallback() {
  const hash = window.location.hash;
  if (!hash || !hash.includes('access_token')) return null;
  const params = new URLSearchParams(hash.substring(1));
  const token = params.get('access_token');
  if (token) {
    setSession(token, null);
    window.history.replaceState(null, '', window.location.pathname);
    return true;
  }
  return null;
}

export async function fetchUser() {
  if (!accessToken) return null;
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${accessToken}` },
  });
  if (!res.ok) { signOut(); return null; }
  const user = await res.json();
  currentUser = { email: user.email, id: user.id };
  localStorage.setItem('sb_user', JSON.stringify(currentUser));
  return currentUser;
}

function setSession(token, user) {
  accessToken = token;
  localStorage.setItem('sb_token', token);
  if (user) {
    currentUser = { email: user.email, id: user.id };
    localStorage.setItem('sb_user', JSON.stringify(currentUser));
  }
}

export function restoreSession() {
  const token = localStorage.getItem('sb_token');
  if (token) {
    accessToken = token;
    currentUser = JSON.parse(localStorage.getItem('sb_user') || 'null');
    return currentUser;
  }
  return null;
}

export function signOut() {
  accessToken = null;
  currentUser = null;
  localStorage.removeItem('sb_token');
  localStorage.removeItem('sb_user');
}

export function getUser() { return currentUser; }

// --- Data ---

function headers(write = false) {
  const h = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${accessToken}`,
    'Accept-Profile': 'planning',
  };
  if (write) {
    h['Content-Profile'] = 'planning';
    h['Content-Type'] = 'application/json';
    h['Prefer'] = 'return=minimal';
  }
  return h;
}

const STATUS_MAP = {
  'IDEE': 'offen', 'EVALUATING': 'offen', 'EVALUATED': 'offen',
  'GEPLANT': 'offen', 'IN_ARBEIT': 'aktiv', 'PAUSIERT': 'offen',
  'FERTIG': 'erledigt', 'VERWORFEN': 'erledigt',
};

export async function loadTasks() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/idea_scores?select=*&order=ice_score.desc`,
    { headers: headers() }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.map(row => ({
    id: String(row.id),
    titel: row.title,
    prio: row.moscow_priority || 'COULD',
    ice: row.ice_score,
    status: STATUS_MAP[row.status] || 'offen',
    dbStatus: row.status,
    wer: row.created_by || '',
    deadline: row.deadline || row.target_date || '',
    details: row.description || '',
    project: row.project || '',
  }));
}

export async function updateTaskStatus(id, newDbStatus) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/idea_scores?id=eq.${id}`,
    { method: 'PATCH', headers: headers(true), body: JSON.stringify({ status: newDbStatus }) }
  );
  return res.ok;
}
