import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../../components/AuthLayout';
import { Button, Field, Input } from '../../components/ui';
import { ApiError, api } from '../../lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.post('/api/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send reset instructions.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We will walk you through recovering access."
      footer={
        <Link to="/login" className="font-semibold text-accent hover:underline">
          Back to log in
        </Link>
      }
    >
      {sent ? (
        <div role="status" className="space-y-3 text-sm">
          <p className="rounded-md border border-border bg-surface px-3 py-3 text-text">
            If an account exists for <strong>{email}</strong>, a reset link has been sent.
          </p>
          <p className="text-text-muted">
            Check your inbox and spam folder. The link expires in one hour and can only be used
            once.
          </p>
        </div>
      ) : (
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
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? 'Sending…' : 'Send reset instructions'}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
