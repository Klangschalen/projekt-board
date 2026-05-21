import React, { useState } from 'react';
import { signInWithEmail } from '../data/supabase.js';

export default function Login({ onLogin, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const session = await signInWithEmail(email, password);
      onLogin(session);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="login-overlay" onClick={handleOverlayClick}>
      <div className="login-modal">
        <button className="login-close-btn" onClick={onClose}>×</button>

        <div className="login-logo">
          <span className="login-logo-icon">🎵</span>
          <h1>Sound-Spirit</h1>
        </div>

        <p className="login-subtitle">Team-Plattform — Nur für autorisierte Mitarbeiter</p>

        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">E-Mail</label>
            <input
              id="email"
              type="email"
              placeholder="name@sound-spirit.de"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Passwort</label>
            <input
              id="password"
              type="password"
              placeholder="Passwort eingeben"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary login-submit" disabled={loading}>
            {loading ? 'Anmeldung läuft...' : 'Anmelden'}
          </button>
        </form>

        <p className="login-hint">
          Noch kein Konto? Bitte Frank kontaktieren für einen Zugang.
        </p>
      </div>
    </div>
  );
}
