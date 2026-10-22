import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/AuthLayout';
import { Button, Field, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthProvider';
import { ApiError, api } from '../../lib/api';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^[-_]+|[-_]+$/g, '')
    .slice(0, 30);
}

export default function Register() {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameEdited, setUsernameEdited] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { refresh } = useAuth();

  function onNameChange(value: string) {
    setDisplayName(value);
    if (!usernameEdited) setUsername(slugify(value));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setBusy(true);
    try {
      await api.post('/api/auth/register', { email, password, displayName, username });
      await refresh();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        const fe: Record<string, string> = {};
        for (const d of err.details ?? []) {
          const key = d.path.split('.').pop() ?? d.path;
          if (!fe[key]) fe[key] = d.message;
        }
        setFieldErrors(fe);
        if (err.status === 409) {
          setError('That email or username is already taken.');
        } else if (Object.keys(fe).length === 0) {
          setError(err.message);
        }
      } else {
        setError('Could not create your account. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Create your Pehchaan"
      subtitle="Claim your username and get a page in a minute."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-accent hover:underline">
            Log in
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
        <Field label="Your name" htmlFor="displayName" error={fieldErrors.displayName}>
          <Input
            id="displayName"
            name="displayName"
            autoComplete="name"
            required
            value={displayName}
            onChange={(e) => onNameChange(e.target.value)}
          />
        </Field>
        <Field
          label="Username"
          htmlFor="username"
          error={fieldErrors.username}
          hint="Your page will be at /u/username"
        >
          <div className="flex items-center rounded-md border border-border bg-elevated focus-within:ring-2 focus-within:ring-accent/40">
            <span className="px-3 text-sm text-text-muted">/u/</span>
            <input
              id="username"
              name="username"
              required
              value={username}
              onChange={(e) => {
                setUsernameEdited(true);
                setUsername(slugify(e.target.value));
              }}
              className="w-full bg-transparent py-2.5 pr-3 text-sm text-text outline-none"
            />
          </div>
        </Field>
        <Field label="Email" htmlFor="email" error={fieldErrors.email}>
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
        <Field label="Password" htmlFor="password" error={fieldErrors.password} hint="At least 8 characters.">
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
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? 'Creating your page…' : 'Create my page'}
        </Button>
        <p className="text-center text-xs text-text-muted">
          By continuing you agree to our{' '}
          <Link to="/terms" className="underline">Terms</Link> and{' '}
          <Link to="/privacy" className="underline">Privacy policy</Link>.
        </p>
      </form>
    </AuthLayout>
  );
}
