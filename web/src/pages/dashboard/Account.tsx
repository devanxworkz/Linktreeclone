import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Field, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthProvider';
import { useI18n } from '../../components/I18nProvider';
import { useToast } from '../../components/Toast';
import { ApiError, api } from '../../lib/api';
import { LOCALES, LOCALE_LABELS, type Locale } from '../../lib/i18n';

export default function Account() {
  const { user, logout } = useAuth();
  const { locale, setLocale } = useI18n();
  const toast = useToast();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.post('/api/auth/change-password', { currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      toast.push('Password changed. Other sessions were signed out.', 'success');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not change your password.');
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold">Account</h2>
        <p className="mt-1 text-sm text-text-muted">Manage how you sign in and your preferences.</p>
      </div>

      <Card>
        <h3 className="font-bold">Sign-in details</h3>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-text-muted">Email</dt>
            <dd className="font-medium">{user?.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-text-muted">Role</dt>
            <dd className="font-medium capitalize">{user?.role}</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <h3 className="font-bold">Language</h3>
        <p className="mt-1 text-xs text-text-muted">Interface language for your workspace.</p>
        <div className="mt-3 max-w-xs">
          <Field label="Preferred language" htmlFor="locale-pref">
            <select
              id="locale-pref"
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              className="w-full rounded-md border border-border-input bg-elevated px-3 py-2 text-sm"
            >
              {LOCALES.map((l) => (
                <option key={l} value={l}>
                  {LOCALE_LABELS[l]}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Card>

      <Card>
        <h3 className="font-bold">Change password</h3>
        <form onSubmit={changePassword} noValidate className="mt-3 max-w-md space-y-4">
          {error && (
            <div role="alert" className="rounded-md border border-danger/30 bg-red-50 px-3 py-2 text-sm text-danger">
              {error}
            </div>
          )}
          <Field label="Current password" htmlFor="currentPassword">
            <Input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </Field>
          <Field label="New password" htmlFor="newPassword" hint="At least 8 characters.">
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Field>
          <Button type="submit" loading={busy}>
            Update password
          </Button>
        </form>
      </Card>

      <Card>
        <h3 className="font-bold">Session</h3>
        <p className="mt-1 text-sm text-text-muted">Sign out of this device.</p>
        <Button variant="secondary" className="mt-3" onClick={signOut}>
          Log out
        </Button>
      </Card>
    </div>
  );
}
