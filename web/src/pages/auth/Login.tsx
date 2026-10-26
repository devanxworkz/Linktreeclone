import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/AuthLayout';
import { Button, Field, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthProvider';
import { ApiError, api } from '../../lib/api';

interface LocationState {
  from?: string;
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { refresh } = useAuth();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.post('/api/auth/login', { email, password });
      await refresh();
      const from = (location.state as LocationState | null)?.from ?? '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) setError('Invalid email or password.');
        else if (err.status === 403) setError('This account has been suspended.');
        else if (err.status === 0 || err.status >= 500) setError('Server error. Please try again later.');
        else setError(err.message);
      } else {
        setError('Could not log in. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setError(null);
    setBusy(true);
    try {
      const data = await api.get<{ url: string }>('/api/auth/google/url');
      window.location.href = data.url;
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 0 || err.status >= 500) setError('Google sign-in unavailable. Please try again later.');
        else setError(err.message);
      } else {
        setError('Could not start Google sign-in.');
      }
      setBusy(false);
    }
  }

  // Handle OAuth error redirect
  const searchParams = new URLSearchParams(location.search);
  const oauthError = searchParams.get('error');
  if (oauthError === 'google') {
    setError('Google sign-in was cancelled or failed. Please try again.');
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to manage your Pehchaan page."
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="font-semibold text-accent hover:underline">
            Create your page
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {error && (
          <div role="alert" className="rounded-md border border-danger/30 bg-red-50 px-3 py-2 text-sm text-danger">
            {error}
          </div>
        )}
        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Password" htmlFor="password">
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <div className="flex justify-end">
          <Link to="/forgot" className="text-sm font-medium text-accent hover:underline">
            Forgot your password?
          </Link>
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? 'Logging in…' : 'Log in'}
        </Button>
        <div className="flex items-center gap-3 py-1 text-xs uppercase tracking-wide text-text-muted">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>
        <Button type="button" variant="secondary" className="w-full" onClick={onGoogle} disabled={busy}>
          Continue with Google
        </Button>
      </form>
    </AuthLayout>
  );
}
