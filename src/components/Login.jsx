import React, { useState } from 'react';

export default function Login({ onEmailLogin, onGoogleLogin, googleEnabled }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onEmailLogin(email, password);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Sound-Spirit Projekt-Board</h1>
        <p>Internes Team-Board - nur fuer autorisierte Mitarbeiter</p>

        {error && <div className="login-error">{error}</div>}

        {googleEnabled && (
          <>
            <button type="button" className="google-btn" onClick={onGoogleLogin}>
              Mit Google anmelden
            </button>
            <div className="divider"><span>oder</span></div>
          </>
        )}

        <input
          type="email" placeholder="E-Mail" value={email}
          onChange={e => setEmail(e.target.value)} required autoFocus
        />
        <input
          type="password" placeholder="Passwort" value={password}
          onChange={e => setPassword(e.target.value)} required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Wird geladen...' : 'Anmelden'}
        </button>
      </form>
    </div>
  );
}
