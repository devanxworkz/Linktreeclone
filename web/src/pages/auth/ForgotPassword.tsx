import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../../components/AuthLayout';
import { Button, Field, Input } from '../../components/ui';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    // This build has no email delivery configured. We deliberately do not
    // reveal whether the address exists, and we tell the truth about the
    // limitation rather than pretending a reset link was sent.
    window.setTimeout(() => {
      setSent(true);
      setBusy(false);
    }, 300);
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
            If an account exists for <strong>{email}</strong>, a reset would be sent there.
          </p>
          <p className="text-text-muted">
            Note: email delivery is not configured in this demonstration build, so no message was
            actually sent. A production deployment connects an email provider here. If you are
            already signed in, you can change your password from Account settings.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-4">
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
            {busy ? 'Checking…' : 'Send reset instructions'}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
