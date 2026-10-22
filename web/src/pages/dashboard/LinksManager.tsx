import { useState, type FormEvent } from 'react';
import {
  Button,
  Card,
  Dialog,
  Field,
  Input,
  Select,
  Skeleton,
  Toggle,
  cx,
} from '../../components/ui';
import { IconGrip, IconPlus, IconTrash, IconUp, IconDown } from '../../components/icons';
import { ICON_KEYS, LinkIcon } from '../../components/LinkIcon';
import { useToast } from '../../components/Toast';
import { ApiError, api } from '../../lib/api';
import { useAsync } from '../../lib/useAsync';
import { hostOf } from '../../lib/format';
import type { LinkItem } from '../../lib/types';

interface Draft {
  id?: string;
  title: string;
  url: string;
  icon: string;
  isActive: boolean;
}

const EMPTY: Draft = { title: '', url: '', icon: 'link', isActive: true };

export default function LinksManager() {
  const toast = useToast();
  const { data, loading, setData, reload } = useAsync(() => api.get<{ links: LinkItem[] }>('/api/links'));
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const links = data?.links ?? [];

  function openAdd() {
    setErrors({});
    setDraft({ ...EMPTY });
  }

  function openEdit(link: LinkItem) {
    setErrors({});
    setDraft({ id: link.id, title: link.title, url: link.url, icon: link.icon, isActive: link.isActive });
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!draft) return;
    setBusy(true);
    setErrors({});
    try {
      if (draft.id) {
        const { link } = await api.put<{ link: LinkItem }>(`/api/links/${draft.id}`, {
          title: draft.title,
          url: draft.url,
          icon: draft.icon,
          isActive: draft.isActive,
        });
        setData((prev) => ({
          links: (prev?.links ?? []).map((l) => (l.id === link.id ? link : l)),
        }));
      } else {
        const { link } = await api.post<{ link: LinkItem }>('/api/links', {
          title: draft.title,
          url: draft.url,
          icon: draft.icon,
          isActive: draft.isActive,
        });
        setData((prev) => ({ links: [...(prev?.links ?? []), link] }));
      }
      setDraft(null);
      toast.push('Link saved.', 'success');
    } catch (err) {
      if (err instanceof ApiError) {
        const fe: Record<string, string> = {};
        for (const d of err.details ?? []) {
          const key = d.path.split('.').pop() ?? d.path;
          if (!fe[key]) fe[key] = d.message;
        }
        setErrors(fe);
        if (Object.keys(fe).length === 0) toast.push(err.message, 'error');
      } else {
        toast.push('Could not save the link.', 'error');
      }
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(link: LinkItem) {
    try {
      const { link: updated } = await api.put<{ link: LinkItem }>(`/api/links/${link.id}`, {
        isActive: !link.isActive,
      });
      setData((prev) => ({ links: (prev?.links ?? []).map((l) => (l.id === updated.id ? updated : l)) }));
    } catch {
      toast.push('Could not update the link.', 'error');
    }
  }

  async function remove(link: LinkItem) {
    if (!window.confirm(`Delete “${link.title}”?`)) return;
    try {
      await api.delete(`/api/links/${link.id}`);
      setData((prev) => ({ links: (prev?.links ?? []).filter((l) => l.id !== link.id) }));
      toast.push('Link deleted.', 'success');
    } catch {
      toast.push('Could not delete the link.', 'error');
    }
  }

  async function move(index: number, delta: number) {
    const next = [...links];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target]!, next[index]!];
    const reordered = next.map((l, i) => ({ ...l, position: i }));
    setData({ links: reordered });
    try {
      const { links: saved } = await api.put<{ links: LinkItem[] }>('/api/links/reorder', {
        ids: reordered.map((l) => l.id),
      });
      setData({ links: saved });
    } catch {
      toast.push('Could not save the new order.', 'error');
      await reload();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold">Links</h2>
          <p className="mt-1 text-sm text-text-muted">Add anywhere you exist online. Drag order with the arrows.</p>
        </div>
        <Button onClick={openAdd}>
          <span className="flex items-center gap-1.5"><IconPlus /> Add link</span>
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : links.length === 0 ? (
        <Card className="text-center">
          <p className="font-semibold">No links yet</p>
          <p className="mt-1 text-sm text-text-muted">Add your first link — Instagram is a good start.</p>
          <Button className="mt-4" onClick={openAdd}>
            <span className="flex items-center gap-1.5"><IconPlus /> Add link</span>
          </Button>
        </Card>
      ) : (
        <ul className="space-y-3">
          {links.map((link, i) => (
            <li key={link.id}>
              <div className="flex items-center gap-3 rounded-lg border border-border bg-elevated p-3 shadow-card">
                <span className="cursor-grab text-text-muted" aria-hidden="true"><IconGrip /></span>
                <span
                  className={cx(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-md',
                    link.isActive ? 'bg-accent-soft text-accent' : 'bg-surface text-text-muted',
                  )}
                >
                  <LinkIcon name={link.icon} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cx('truncate font-semibold', !link.isActive && 'text-text-muted line-through')}>
                    {link.title}
                  </p>
                  <p className="truncate text-xs text-text-muted">{hostOf(link.url)}</p>
                </div>
                <span className="hidden text-xs text-text-muted sm:block">{link.clickCount} clicks</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="rounded p-1.5 text-text-muted hover:bg-surface disabled:opacity-30"
                    aria-label={`Move ${link.title} up`}
                    disabled={i === 0}
                    onClick={() => void move(i, -1)}
                  >
                    <IconUp />
                  </button>
                  <button
                    type="button"
                    className="rounded p-1.5 text-text-muted hover:bg-surface disabled:opacity-30"
                    aria-label={`Move ${link.title} down`}
                    disabled={i === links.length - 1}
                    onClick={() => void move(i, 1)}
                  >
                    <IconDown />
                  </button>
                  <Toggle
                    checked={link.isActive}
                    onChange={() => void toggleActive(link)}
                    label={`${link.isActive ? 'Hide' : 'Show'} ${link.title}`}
                  />
                  <button
                    type="button"
                    className="rounded p-1.5 text-text-muted hover:bg-surface hover:text-danger"
                    aria-label={`Delete ${link.title}`}
                    onClick={() => void remove(link)}
                  >
                    <IconTrash />
                  </button>
                </div>
              </div>
              <div className="mt-1 ml-3">
                <Button size="sm" variant="ghost" onClick={() => openEdit(link)}>
                  Edit details
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={draft !== null}
        onClose={() => setDraft(null)}
        title={draft?.id ? 'Edit link' : 'Add link'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDraft(null)}>
              Cancel
            </Button>
            <Button form="link-form" type="submit" loading={busy}>
              Save
            </Button>
          </>
        }
      >
        <form id="link-form" onSubmit={save} noValidate className="space-y-4">
          <Field label="Title" htmlFor="link-title" error={errors.title} required>
            <Input
              id="link-title"
              value={draft?.title ?? ''}
              onChange={(e) => setDraft((d) => (d ? { ...d, title: e.target.value } : d))}
              maxLength={80}
              required
            />
          </Field>
          <Field label="URL" htmlFor="link-url" error={errors.url} required hint="Must start with http:// or https://">
            <Input
              id="link-url"
              type="url"
              placeholder="https://instagram.com/…"
              value={draft?.url ?? ''}
              onChange={(e) => setDraft((d) => (d ? { ...d, url: e.target.value } : d))}
              required
            />
          </Field>
          <Field label="Icon" htmlFor="link-icon">
            <Select
              id="link-icon"
              value={draft?.icon ?? 'link'}
              onChange={(e) => setDraft((d) => (d ? { ...d, icon: e.target.value } : d))}
            >
              {ICON_KEYS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </Select>
          </Field>
          <label className="flex items-center justify-between rounded-md border border-border px-3 py-2">
            <span className="text-sm font-semibold">Visible on my page</span>
            <Toggle
              checked={draft?.isActive ?? true}
              onChange={(v) => setDraft((d) => (d ? { ...d, isActive: v } : d))}
              label="Visible on my page"
            />
          </label>
        </form>
      </Dialog>
    </div>
  );
}
