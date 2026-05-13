const SUPABASE_URL = 'https://hdxmswteiesvcwqdgpwm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkeG1zd3RlaWVzdmN3cWRncHdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NjE2MDAsImV4cCI6MjA1ODMzNzYwMH0.yFcCkOskWJ5wBjIxPCJN6vOI2r9L44jcJIPfAyEA76I';

let accessToken = null;

export async function signIn(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error_description || err.msg || 'Login fehlgeschlagen');
  }
  const data = await res.json();
  accessToken = data.access_token;
  localStorage.setItem('sb_token', accessToken);
  localStorage.setItem('sb_user', JSON.stringify({ email: data.user.email }));
  return data.user;
}

export function restoreSession() {
  const token = localStorage.getItem('sb_token');
  if (token) {
    accessToken = token;
    return JSON.parse(localStorage.getItem('sb_user') || '{}');
  }
  return null;
}

export function signOut() {
  accessToken = null;
  localStorage.removeItem('sb_token');
  localStorage.removeItem('sb_user');
}

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

export function isLoggedIn() {
  return !!accessToken;
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
