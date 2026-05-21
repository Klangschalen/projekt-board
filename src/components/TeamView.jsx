import React, { useState, useEffect } from 'react';
import { loadMyTeams, loadAllUserProfiles } from '../data/supabase.js';

function Avatar({ profile, size = 36 }) {
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

const ROLE_LABELS = {
  owner: 'Inhaber',
  admin: 'Admin',
  member: 'Mitglied',
  viewer: 'Betrachter',
  lead: 'Team-Lead',
};

const ROLE_COLORS = {
  owner: '#e74c3c',
  admin: '#f39c12',
  member: '#3498db',
  viewer: '#95a5a6',
  lead: '#9b59b6',
};

function MemberCard({ member }) {
  const profile = member.user_profiles || {};
  const role = member.role_in_team || 'member';
  return (
    <div className="member-card">
      <Avatar profile={profile} size={44} />
      <div className="member-info">
        <span className="member-name">{profile.full_name || 'Unbekannt'}</span>
        <span
          className="member-role-badge"
          style={{ backgroundColor: ROLE_COLORS[role] || '#95a5a6' }}
        >
          {ROLE_LABELS[role] || role}
        </span>
      </div>
    </div>
  );
}

function TeamCard({ team }) {
  const [expanded, setExpanded] = useState(false);
  const members = team.team_members || [];

  return (
    <div className="team-card">
      <div className="team-card-header" onClick={() => setExpanded(!expanded)}>
        <div className="team-color-dot" style={{ backgroundColor: team.color || '#3498db' }} />
        <div className="team-card-info">
          <h3 className="team-name">{team.name}</h3>
          {team.description && <p className="team-description">{team.description}</p>}
        </div>
        <div className="team-meta">
          <span className="team-member-count">{members.length} Mitglieder</span>
          <span className="team-expand-icon">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className="team-members-list">
          {members.length === 0 ? (
            <p className="empty-state">Noch keine Mitglieder in diesem Team.</p>
          ) : (
            members.map(m => (
              <MemberCard key={m.user_id} member={m} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function UserProfileCard({ profile }) {
  const roleLabel = ROLE_LABELS[profile.role] || profile.role;
  const roleColor = ROLE_COLORS[profile.role] || '#95a5a6';

  return (
    <div className="user-profile-card">
      <Avatar profile={profile} size={48} />
      <div className="user-profile-info">
        <span className="user-profile-name">{profile.full_name || 'Unbekannt'}</span>
        <span
          className="user-profile-role"
          style={{ color: roleColor }}
        >
          {roleLabel}
        </span>
      </div>
    </div>
  );
}

export default function TeamView({ session, userProfile }) {
  const [teams, setTeams] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('teams');
  const token = session?.access_token;

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  async function loadData() {
    setLoading(true);
    try {
      const [teamsData, usersData] = await Promise.all([
        loadMyTeams(token),
        loadAllUserProfiles(token),
      ]);
      setTeams(teamsData);
      setAllUsers(usersData);
    } catch (err) {
      console.warn('Team-Daten konnten nicht geladen werden:', err);
    }
    setLoading(false);
  }

  if (!session) {
    return (
      <div className="team-view-empty">
        <p>Bitte anmelden um die Teamverwaltung zu sehen.</p>
      </div>
    );
  }

  return (
    <div className="team-view">
      <div className="team-view-header">
        <h2>Team & Mitglieder</h2>
        {userProfile && (
          <div className="current-user-info">
            <Avatar profile={userProfile} size={32} />
            <span>{userProfile.full_name}</span>
            <span
              className="user-role-badge"
              style={{ backgroundColor: ROLE_COLORS[userProfile.role] || '#95a5a6' }}
            >
              {ROLE_LABELS[userProfile.role] || userProfile.role}
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="team-tabs">
        <button
          className={`team-tab ${activeTab === 'teams' ? 'active' : ''}`}
          onClick={() => setActiveTab('teams')}
        >
          Teams ({teams.length})
        </button>
        <button
          className={`team-tab ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          Alle Mitglieder ({allUsers.length})
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Lade Team-Daten...</div>
      ) : (
        <>
          {/* Teams-Ansicht */}
          {activeTab === 'teams' && (
            <div className="teams-list">
              {teams.length === 0 ? (
                <div className="empty-state-card">
                  <p>Noch keine Teams vorhanden.</p>
                  <p className="hint">Teams werden über das Supabase-Dashboard oder die SQL-Migration angelegt.</p>
                </div>
              ) : (
                teams.map(team => (
                  <TeamCard key={team.id} team={team} />
                ))
              )}
            </div>
          )}

          {/* Mitglieder-Ansicht */}
          {activeTab === 'members' && (
            <div className="users-grid">
              {allUsers.length === 0 ? (
                <div className="empty-state-card">
                  <p>Noch keine Mitglieder registriert.</p>
                </div>
              ) : (
                allUsers.map(user => (
                  <UserProfileCard key={user.id} profile={user} />
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
