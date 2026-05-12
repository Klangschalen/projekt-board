const SUPABASE_URL = 'https://hdxmswteiesvcwqdgpwm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkeG1zd3RlaWVzdmN3cWRncHdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NjE2MDAsImV4cCI6MjA1ODMzNzYwMH0.yFcCkOskWJ5wBjIxPCJN6vOI2r9L44jcJIPfAyEA76I';

const STATUS_MAP = {
  'IDEE': 'offen',
  'EVALUATING': 'offen',
  'EVALUATED': 'offen',
  'GEPLANT': 'offen',
  'IN_ARBEIT': 'aktiv',
  'PAUSIERT': 'offen',
  'FERTIG': 'erledigt',
  'VERWORFEN': 'erledigt',
};

const MOSCOW_MAP = {
  'MUST': 'MUST',
  'SHOULD': 'SHOULD',
  'COULD': 'COULD',
  'WONT': 'WONT',
};

export async function loadTasks() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/idea_scores?select=*&order=ice_score.desc`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Accept-Profile': 'planning',
      },
    });
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
  } catch (err) {
    console.error('Supabase-Fehler:', err);
    return [];
  }
}

export async function updateTaskStatus(id, newDbStatus) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/idea_scores?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Profile': 'planning',
        'Accept-Profile': 'planning',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ status: newDbStatus }),
    });
    return res.ok;
  } catch (err) {
    console.error('Update-Fehler:', err);
    return false;
  }
}
