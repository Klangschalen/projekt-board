const SUPABASE_URL = 'https://hdxmswteiesvcwqdgpwm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkeG1zd3RlaWVzdmN3cWRncHdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NjU1OTQsImV4cCI6MjA4MzU0MTU5NH0.HcRVpgh-2pKaDYfg74WdT1G146xoARhtYepUeOrnYP4';

function headers(write = false) {
  const h = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
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

export async function loadPortfolio() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/project_portfolio?select=*`,
    { headers: headers() }
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

export async function updateTaskStatus(id, newDbStatus) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/idea_scores?id=eq.${id}`,
    { method: 'PATCH', headers: headers(true), body: JSON.stringify({ status: newDbStatus }) }
  );
  return res.ok;
}
