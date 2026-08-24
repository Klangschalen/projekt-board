import React from 'react';

function Avatar({ profile, size = 28 }) {
  if (!profile) return null;
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

export default function Header({
  personen, projekte, filter, onFilter, taskCount,
  session, userProfile, onLogin, onLogout,
}) {
  return (
    <header className="header">
      <div className="header-left">
        <span className="header-logo">🎵</span>
        <h1>Sound-Spirit Team-Plattform</h1>
        {taskCount > 0 && <span className="task-count">{taskCount} Aufgaben</span>}
      </div>

      <div className="header-right">
        {/* Filter */}
        {personen.length > 0 && (
          <select value={filter} onChange={e => onFilter(e.target.value)} className="header-filter">
            <option value="alle">Alle anzeigen</option>
            <option value="money-maker">Nur Money-Maker (Umsatz-relevant)</option>
            <optgroup label="Person">
              {personen.map(p => <option key={p} value={p}>{p}</option>)}
            </optgroup>
            <optgroup label="Projekt">
              {projekte.map(p => <option key={p} value={p}>{p}</option>)}
            </optgroup>
          </select>
        )}

        {/* Auth-Bereich */}
        {session && userProfile ? (
          <div className="header-user">
            <Avatar profile={userProfile} size={30} />
            <span className="header-username">{userProfile.full_name}</span>
            <button className="btn-secondary header-logout-btn" onClick={onLogout}>
              Abmelden
            </button>
          </div>
        ) : (
          <button className="btn-primary header-login-btn" onClick={onLogin}>
            Anmelden
          </button>
        )}
      </div>
    </header>
  );
}
