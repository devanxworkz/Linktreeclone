import { useState } from 'react';
import { Badge, Button, Card, Toggle } from '../../components/ui';
import { PublicView, type PublicViewData } from '../../components/PublicView';
import { IconCopy, IconCheck } from '../../components/icons';
import { useAuth } from '../../context/AuthProvider';
import { useToast } from '../../components/Toast';
import { api } from '../../lib/api';
import { useAsync } from '../../lib/useAsync';
import { copyText } from '../../lib/format';
import type { LinkItem, ProductItem } from '../../lib/types';

export default function PreviewPublish() {
  const { profile, refresh } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const linksAsync = useAsync(() => api.get<{ links: LinkItem[] }>('/api/links'));
  const productsAsync = useAsync(() => api.get<{ products: ProductItem[] }>('/api/products'));

  const activeLinks = (linksAsync.data?.links ?? []).filter((l) => l.isActive);
  const activeProducts = (productsAsync.data?.products ?? []).filter((p) => p.isActive);

  const publicUrl = profile ? `${window.location.origin}/u/${profile.username}` : '';

  const data: PublicViewData = {
    displayName: profile?.displayName ?? 'Your name',
    bio: profile?.bio ?? '',
    avatarUrl: profile?.avatarUrl ?? null,
    whatsappNumber: profile?.whatsappNumber ?? null,
    upiId: profile?.upiId ?? null,
    upiQrUrl: profile?.upiQrUrl ?? null,
    appearance: profile?.appearance ?? null,
    theme: profile?.theme ?? { themeKey: 'saffron', layout: 'classic', accent: '#c2410c' },
    links: activeLinks.map((l) => ({ id: l.id, title: l.title, url: l.url, icon: l.icon })),
    products: activeProducts.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      imageUrl: p.imageUrl,
      pricePaise: p.pricePaise,
      currency: p.currency,
      destinationUrl: p.destinationUrl,
    })),
  };

  async function togglePublish(next: boolean) {
    setBusy(true);
    try {
      await api.post('/api/profile/publish', { isPublished: next });
      await refresh();
      toast.push(next ? 'Your page is live.' : 'Your page is hidden.', 'success');
    } catch {
      toast.push('Could not update publish status.', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    const ok = await copyText(publicUrl);
    if (ok) {
      setCopied(true);
      toast.push('Link copied.', 'success');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.push('Could not copy the link.', 'error');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold">Preview & publish</h2>
          <p className="mt-1 text-sm text-text-muted">This is exactly what visitors will see.</p>
        </div>
        <div className="flex items-center gap-3">
          {profile?.isPublished ? <Badge tone="success">Live</Badge> : <Badge tone="muted">Draft</Badge>}
          <label className="flex items-center gap-2 text-sm font-semibold">
            {profile?.isPublished ? 'Published' : 'Unpublished'}
            <Toggle
              checked={profile?.isPublished ?? false}
              onChange={(v) => void togglePublish(v)}
              busy={busy}
              label="Publish my page"
            />
          </label>
        </div>
      </div>

      <Card className="flex flex-wrap items-center gap-3">
        <span className="truncate rounded-md border border-border bg-surface px-3 py-1.5 font-mono text-xs text-text-muted">
          {publicUrl || '—'}
        </span>
        <Button size="sm" variant="ghost" onClick={copy} disabled={!publicUrl}>
          <span className="flex items-center gap-1.5">{copied ? <IconCheck /> : <IconCopy />} Copy link</span>
        </Button>
        {profile?.isPublished && (
          <a
            href={`/u/${profile.username}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-accent hover:underline"
          >
            Open public page →
          </a>
        )}
        {!profile?.isPublished && (
          <span className="text-xs text-text-muted">
            Turn on “Published” so the link works for visitors.
          </span>
        )}
      </Card>

      <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-[2rem] border-4 border-text/10 shadow-pop">
        <div className="max-h-[70vh] overflow-y-auto">
          <PublicView data={data} compact />
        </div>
      </div>
    </div>
  );
}
