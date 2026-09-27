'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LockKeyhole, LoaderCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Unable to sign in.');
      router.replace('/admin');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <form className="login-form" onSubmit={login}>
        <div className="login-icon">
          <LockKeyhole size={19} />
        </div>
        <p className="page-kicker">BLOG ADMIN</p>
        <h1>Sign in</h1>
        <p className="login-description">
          Enter the administrator password to manage posts.
        </p>
        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error && (
          <p className="login-error" role="alert">
            {error}
          </p>
        )}
        <button className="primary-button" disabled={loading}>
          {loading ? (
            <LoaderCircle className="spin" size={16} />
          ) : (
            <LockKeyhole size={15} />
          )}
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
