import { Link } from 'react-router-dom';
import { Badge, Button, Card, EmptyState, Skeleton, StatCard, cx } from '../../components/ui';
import { IconCopy, IconCheck } from '../../components/icons';
import { useAuth } from '../../context/AuthProvider';
import { useToast } from '../../components/Toast';
import { api } from '../../lib/api';
import { useAsync } from '../../lib/useAsync';
import { formatNumber } from '../../lib/format';
import type { OwnerStats } from '../../lib/types';
import { useState } from 'react';

export default function Overview() {
  const { profile, refresh } = useAuth();
  const toast = useToast();
  const { data, loading, error } = useAsync(() => api.get<{ stats: OwnerStats }>('/api/stats'));
  const [copied, setCopied] = useState(false);

  const publicUrl = profile ? `${window.location.origin}/u/${profile.username}` : '';

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.push('Link copied to clipboard.', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.push('Could not copy. Select the link manually.', 'error');
    }
  }

  async function togglePublish() {
    if (!profile) return;
    try {
      await api.post('/api/profile/publish', { isPublished: !profile.isPublished });
      await refresh();
      toast.push(profile.isPublished ? 'Your page is now hidden.' : 'Your page is live.', 'success');
    } catch {
      toast.push('Could not update publish status.', 'error');
    }
  }

  const stats = data?.stats;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold">Hi {profile?.displayName ?? 'there'} 👋</h2>
          <p className="mt-1 text-sm text-text-muted">
            Here is how your Pehchaan page is doing.
          </p>
        </div>
        <Button variant={profile?.isPublished ? 'secondary' : 'primary'} onClick={togglePublish}>
          {profile?.isPublished ? 'Hide page' : 'Publish page'}
        </Button>
      </div>

      <Card className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-text-muted">Status</span>
          {profile?.isPublished ? <Badge tone="success">Live</Badge> : <Badge tone="muted">Draft</Badge>}
        </div>
        <div className="mx-2 hidden h-6 w-px bg-border sm:block" />
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="truncate rounded-md border border-border bg-surface px-3 py-1.5 font-mono text-xs text-text-muted">
            {publicUrl || '—'}
          </span>
          <Button size="sm" variant="ghost" onClick={copyUrl} disabled={!publicUrl}>
            <span className="flex items-center gap-1.5">
              {copied ? <IconCheck /> : <IconCopy />}
              {copied ? 'Copied' : 'Copy'}
            </span>
          </Button>
          {profile?.isPublished && (
            <a
              href={`/u/${profile.username}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-accent hover:underline"
            >
              Open →
            </a>
          )}
        </div>
      </Card>

      {error && (
        <div role="alert" className="rounded-md border border-danger/30 bg-red-50 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading || !stats ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <StatCard label="Page views (all time)" value={formatNumber(stats.views)} />
            <StatCard label="Views (last 7 days)" value={formatNumber(stats.views_7d)} />
            <StatCard label="Link clicks" value={formatNumber(stats.clicks)} />
            <StatCard label="Links" value={formatNumber(stats.links)} />
            <StatCard label="Products" value={formatNumber(stats.products)} />
          </>
        )}
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Views, last 14 days</h3>
        </div>
        {loading || !stats ? (
          <Skeleton className="mt-4 h-40" />
        ) : stats.series.length === 0 ? (
          <div className="mt-2">
            <EmptyState
              title="No views yet"
              hint="Publish your page and share the link to start seeing activity here."
            />
          </div>
        ) : (
          <BarChart series={stats.series} />
        )}
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <QuickLink to="/dashboard/links" title="Manage links" body="Add, reorder and hide links." />
        <QuickLink to="/dashboard/products" title="Manage products" body="Add items with ₹ prices." />
        <QuickLink to="/dashboard/appearance" title="Change look" body="Pick a theme and layout." />
      </div>
    </div>
  );
}

function QuickLink({ to, title, body }: { to: string; title: string; body: string }) {
  return (
    <Link
      to={to}
      className="rounded-lg border border-border bg-bg p-5 shadow-card transition hover:border-accent hover:shadow-pop"
    >
      <p className="font-bold">{title}</p>
      <p className="mt-1 text-sm text-text-muted">{body}</p>
      <p className="mt-3 text-sm font-semibold text-accent">Open →</p>
    </Link>
  );
}

function BarChart({ series }: { series: { day: string; count: number }[] }) {
  const max = Math.max(1, ...series.map((s) => s.count));
  return (
    <div className="mt-6 flex h-40 items-end gap-1.5" role="img" aria-label="Daily page views bar chart">
      {series.map((s) => {
        const height = Math.round((s.count / max) * 100);
        return (
          <div key={s.day} className="group relative flex flex-1 flex-col items-center justify-end">
            <div
              className={cx('w-full rounded-t bg-accent/80 transition group-hover:bg-accent')}
              style={{ height: `${Math.max(height, s.count > 0 ? 6 : 2)}%` }}
            />
            <span className="pointer-events-none absolute -top-7 hidden rounded bg-text px-2 py-1 text-[10px] font-semibold text-bg group-hover:block">
              {s.count} · {s.day.slice(5)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
