import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../../components/AuthLayout';
import { Button, Field, Input } from '../../components/ui';
import { ApiError, api } from '../../lib/api';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await api.post('/api/auth/reset-password', { token, password });
      setDone(true);
      window.setTimeout(() => navigate('/login', { replace: true }), 1500);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 400) setError('This reset link is invalid or has expired. Please request a new one.');
        else if (err.status === 0 || err.status >= 500) setError('Server error. Please try again later.');
        else setError(err.message);
      } else {
        setError('Could not reset your password.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="Set a new password for your account."
      footer={
        <Link to="/login" className="font-semibold text-accent hover:underline">
          Back to log in
        </Link>
      }
    >
      {!token ? (
        <p role="alert" className="rounded-md border border-danger/30 bg-red-50 px-3 py-2 text-sm text-danger">
          This reset link is missing its token. Request a new one from the reset page.
        </p>
      ) : done ? (
        <p role="status" className="rounded-md border border-border bg-surface px-3 py-3 text-sm text-text">
          Your password has been updated. Redirecting you to log in…
        </p>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          {error && (
            <div role="alert" className="rounded-md border border-danger/30 bg-red-50 px-3 py-2 text-sm text-danger">
              {error}
            </div>
          )}
          <Field label="New password" htmlFor="password">
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Field label="Confirm new password" htmlFor="confirm">
            <Input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </Field>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? 'Saving…' : 'Update password'}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
