import { useState, type FormEvent } from 'react';
import { Avatar, Button, Card, Field, Input, Textarea } from '../../components/ui';
import { useAuth } from '../../context/AuthProvider';
import { useToast } from '../../components/Toast';
import { ApiError, api } from '../../lib/api';
import type { Profile } from '../../lib/types';

interface FormState {
  displayName: string;
  bio: string;
  avatarUrl: string;
  whatsappNumber: string;
  upiId: string;
  upiQrUrl: string;
  metaTitle: string;
  metaDescription: string;
}

function toForm(p: Profile | null): FormState {
  return {
    displayName: p?.displayName ?? '',
    bio: p?.bio ?? '',
    avatarUrl: p?.avatarUrl ?? '',
    whatsappNumber: p?.whatsappNumber ?? '',
    upiId: p?.upiId ?? '',
    upiQrUrl: p?.upiQrUrl ?? '',
    metaTitle: p?.metaTitle ?? '',
    metaDescription: p?.metaDescription ?? '',
  };
}

export default function ProfileEditor() {
  const { profile, setProfile, refresh } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState<FormState>(() => toForm(profile));
  const [username, setUsername] = useState(profile?.username ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setBusy(true);
    try {
      const { profile: updated } = await api.put<{ profile: Profile }>('/api/profile', form);
      setProfile(updated);
      toast.push('Profile saved.', 'success');
    } catch (err) {
      handleError(err);
    } finally {
      setBusy(false);
    }
  }

  async function onUsernameBlur() {
    if (!profile || username === profile.username) return;
    try {
      const { profile: updated } = await api.put<{ profile: Profile }>('/api/profile/username', {
        username,
      });
      setProfile(updated);
      toast.push('Username updated.', 'success');
    } catch (err) {
      setErrors((e) => ({
        ...e,
        username: err instanceof ApiError ? err.fieldError('username') ?? err.message : 'Could not update username.',
      }));
      setUsername(profile.username);
    }
  }

  function handleError(err: unknown) {
    if (err instanceof ApiError) {
      const fe: Record<string, string> = {};
      for (const d of err.details ?? []) {
        const key = d.path.split('.').pop() ?? d.path;
        if (!fe[key]) fe[key] = d.message;
      }
      setErrors(fe);
      if (Object.keys(fe).length === 0) toast.push(err.message, 'error');
    } else {
      toast.push('Could not save. Please try again.', 'error');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold">Profile</h2>
        <p className="mt-1 text-sm text-text-muted">This is what visitors see at the top of your page.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <Card className="space-y-4">
            <Field label="Display name" htmlFor="displayName" error={errors.displayName}>
              <Input
                id="displayName"
                value={form.displayName}
                onChange={(e) => set('displayName', e.target.value)}
                required
              />
            </Field>
            <Field label="Bio" htmlFor="bio" error={errors.bio} hint="Up to 500 characters.">
              <Textarea
                id="bio"
                rows={3}
                maxLength={500}
                value={form.bio}
                onChange={(e) => set('bio', e.target.value)}
              />
            </Field>
            <Field label="Avatar image URL" htmlFor="avatarUrl" error={errors.avatarUrl} hint="A direct link to a square image.">
              <Input
                id="avatarUrl"
                placeholder="https://…"
                value={form.avatarUrl}
                onChange={(e) => set('avatarUrl', e.target.value)}
              />
            </Field>
          </Card>

          <Card className="space-y-4">
            <h3 className="font-bold">Get in touch</h3>
            <Field
              label="WhatsApp number"
              htmlFor="whatsappNumber"
              error={errors.whatsappNumber}
              hint="Include the country code, for example 91 for India."
            >
              <Input
                id="whatsappNumber"
                inputMode="tel"
                placeholder="919876543210"
                value={form.whatsappNumber}
                onChange={(e) => set('whatsappNumber', e.target.value)}
              />
            </Field>
            <Field label="UPI id" htmlFor="upiId" error={errors.upiId} hint="For example name@bank. Shown so people can pay you directly.">
              <Input
                id="upiId"
                placeholder="name@bank"
                value={form.upiId}
                onChange={(e) => set('upiId', e.target.value)}
              />
            </Field>
            <Field label="UPI QR image URL" htmlFor="upiQrUrl" error={errors.upiQrUrl} hint="Optional. A screenshot of your UPI QR.">
              <Input
                id="upiQrUrl"
                placeholder="https://…"
                value={form.upiQrUrl}
                onChange={(e) => set('upiQrUrl', e.target.value)}
              />
            </Field>
          </Card>

          <Card className="space-y-4">
            <h3 className="font-bold">Search & sharing</h3>
            <Field label="Meta title" htmlFor="metaTitle" error={errors.metaTitle} hint="Up to 70 characters.">
              <Input
                id="metaTitle"
                maxLength={70}
                value={form.metaTitle}
                onChange={(e) => set('metaTitle', e.target.value)}
              />
            </Field>
            <Field label="Meta description" htmlFor="metaDescription" error={errors.metaDescription} hint="Up to 160 characters.">
              <Textarea
                id="metaDescription"
                rows={2}
                maxLength={160}
                value={form.metaDescription}
                onChange={(e) => set('metaDescription', e.target.value)}
              />
            </Field>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" disabled={busy}>
              {busy ? 'Saving…' : 'Save profile'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setForm(toForm(profile))}>
              Reset
            </Button>
          </div>
        </form>

        <div className="space-y-6">
          <Card>
            <h3 className="font-bold">Preview</h3>
            <div className="mt-4 flex flex-col items-center text-center">
              <Avatar src={form.avatarUrl || null} name={form.displayName || '?'} size={80} />
              <p className="mt-3 text-lg font-bold">{form.displayName || 'Your name'}</p>
              <p className="mt-1 text-sm text-text-muted">{form.bio || 'Your bio goes here.'}</p>
            </div>
          </Card>

          <Card className="space-y-3">
            <h3 className="font-bold">Username</h3>
            <Field label="Your page address" htmlFor="username" error={errors.username}>
              <div className="flex items-center rounded-md border border-border bg-elevated focus-within:ring-2 focus-within:ring-accent/40">
                <span className="px-3 text-sm text-text-muted">/u/</span>
                <input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  onBlur={onUsernameBlur}
                  className="w-full bg-transparent py-2.5 pr-3 text-sm outline-none"
                />
              </div>
            </Field>
            <p className="text-xs text-text-muted">
              Changing this updates your public link. Old links will stop working.
            </p>
            <Button size="sm" variant="ghost" onClick={() => void refresh()}>
              Refresh profile
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
