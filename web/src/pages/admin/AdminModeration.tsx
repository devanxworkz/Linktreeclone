import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, EmptyState, Skeleton } from '../../components/ui';
import { ErrorBanner, formatDate, timeAgo } from '../../components/admin/AdminBits';
import { useToast } from '../../components/Toast';
import { api } from '../../lib/api';
import { useAsync } from '../../lib/useAsync';
import { formatNumber } from '../../lib/format';
import type { AdminStorefrontRow, AdminUserRow, Paginated } from '../../lib/types';

export default function AdminModeration() {
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  const suspended = useAsync(() =>
    api.get<Paginated<AdminUserRow>>('/api/admin/users?status=suspended&page=1'),
  );
  const drafts = useAsync(() =>
    api.get<Paginated<AdminStorefrontRow>>('/api/admin/storefronts?published=false&page=1'),
  );

  async function reactivate(row: AdminUserRow) {
    setBusy(row.id);
    try {
      await api.put(`/api/admin/users/${row.id}/status`, { status: 'active' });
      toast.push('Account reactivated.', 'success');
      await suspended.reload();
    } catch {
      toast.push('Could not reactivate this account.', 'error');
    } finally {
      setBusy(null);
    }
  }

  const suspendedRows = suspended.data?.rows ?? [];
  const draftRows = drafts.data?.rows ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold">Reports &amp; Moderation</h2>
        <p className="mt-1 text-sm text-text-muted">
          A queue of accounts and pages that may need attention. Actions here are recorded in the audit log.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Suspended accounts</p>
          <p className="mt-1 text-2xl font-bold">{formatNumber(suspended.data?.total ?? 0)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Draft storefronts</p>
          <p className="mt-1 text-2xl font-bold">{formatNumber(drafts.data?.total ?? 0)}</p>
        </Card>
      </div>

      {suspended.error && <ErrorBanner message={suspended.error} />}
      <Card className="overflow-x-auto p-0">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="text-base font-bold">Suspended accounts</h3>
          <Link to="/admin/creators?q=" className="text-sm font-semibold text-accent hover:underline">
            All accounts
          </Link>
        </div>
        {suspended.loading || !suspended.data ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
          </div>
        ) : suspendedRows.length === 0 ? (
          <div className="p-6">
            <EmptyState title="Nothing to review" hint="No accounts are currently suspended." />
          </div>
        ) : (
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-text-muted">
                <th scope="col" className="p-4 font-semibold">Account</th>
                <th scope="col" className="p-4 font-semibold">Username</th>
                <th scope="col" className="p-4 font-semibold">Registered</th>
                <th scope="col" className="p-4 font-semibold">Last sign-in</th>
                <th scope="col" className="p-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {suspendedRows.map((r) => (
                <tr key={r.id} className="border-b border-border/60">
                  <td className="p-4">
                    <p className="font-medium">{r.displayName ?? '—'}</p>
                    <p className="text-xs text-text-muted">{r.email}</p>
                  </td>
                  <td className="p-4 font-mono text-xs">{r.username ? `/u/${r.username}` : '—'}</td>
                  <td className="p-4 text-text-muted">{formatDate(r.createdAt)}</td>
                  <td className="p-4 text-text-muted">{timeAgo(r.lastLoginAt)}</td>
                  <td className="p-4">
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={busy === r.id}
                      onClick={() => void reactivate(r)}
                    >
                      Reactivate
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {drafts.error && <ErrorBanner message={drafts.error} />}
      <Card className="overflow-x-auto p-0">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="text-base font-bold">Draft storefronts</h3>
          <Link to="/admin/storefronts" className="text-sm font-semibold text-accent hover:underline">
            All storefronts
          </Link>
        </div>
        {drafts.loading || !drafts.data ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
          </div>
        ) : draftRows.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No drafts" hint="Every storefront is currently live." />
          </div>
        ) : (
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-text-muted">
                <th scope="col" className="p-4 font-semibold">Storefront</th>
                <th scope="col" className="p-4 font-semibold">State</th>
                <th scope="col" className="p-4 font-semibold">Links</th>
                <th scope="col" className="p-4 font-semibold">Products</th>
              </tr>
            </thead>
            <tbody>
              {draftRows.map((r) => (
                <tr key={r.tenantId} className="border-b border-border/60">
                  <td className="p-4">
                    <p className="font-medium">{r.displayName ?? 'Untitled'}</p>
                    <p className="font-mono text-xs text-text-muted">{r.username ? `/u/${r.username}` : '—'}</p>
                  </td>
                  <td className="p-4">
                    <Badge tone="muted">Draft</Badge>
                  </td>
                  <td className="p-4">{formatNumber(r.links)}</td>
                  <td className="p-4">{formatNumber(r.products)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
