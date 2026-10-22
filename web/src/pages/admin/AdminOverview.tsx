import { Link } from 'react-router-dom';
import { Badge, Button, Card, EmptyState, Skeleton, StatCard } from '../../components/ui';
import { BarChart, ErrorBanner, humanAction, timeAgo } from '../../components/admin/AdminBits';
import { IconRefresh } from '../../components/icons';
import { api } from '../../lib/api';
import { useAsync } from '../../lib/useAsync';
import { formatNumber } from '../../lib/format';
import type { AdminOverviewData } from '../../lib/types';

export default function AdminOverview() {
  const { data, loading, error, reload } = useAsync(() =>
    api.get<AdminOverviewData>('/api/admin/overview'),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold">Platform overview</h2>
          <p className="mt-1 text-sm text-text-muted">A live snapshot across every creator and tenant.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => void reload()} loading={loading}>
          <IconRefresh /> Refresh
        </Button>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading || !data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Creators"
              value={formatNumber(data.totals.creators)}
              hint={`${formatNumber(data.activity.newUsers7d)} joined in the last 7 days`}
            />
            <StatCard label="Administrators" value={formatNumber(data.totals.admins)} />
            <StatCard
              label="Published pages"
              value={formatNumber(data.totals.published)}
              hint={`${formatNumber(data.totals.drafts)} still in draft`}
            />
            <StatCard
              label="Suspended accounts"
              value={formatNumber(data.totals.suspended)}
              hint={data.totals.suspended > 0 ? 'Review in Moderation' : 'All clear'}
            />
            <StatCard
              label="Page views"
              value={formatNumber(data.activity.views)}
              hint={`${formatNumber(data.activity.views7d)} in the last 7 days`}
            />
            <StatCard
              label="Links & products"
              value={`${formatNumber(data.totals.links)} / ${formatNumber(data.totals.products)}`}
              hint="Across all storefronts"
            />
          </div>

          <Card>
            <h3 className="text-lg font-bold">Page views · last 14 days</h3>
            {data.activity.views === 0 ? (
              <p className="mt-4 text-sm text-text-muted">No page views recorded yet.</p>
            ) : (
              <div className="mt-4">
                <BarChart series={data.series} ariaLabel="Page views over the last 14 days" />
              </div>
            )}
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="overflow-hidden p-0">
              <div className="flex items-center justify-between border-b border-border p-4">
                <h3 className="text-base font-bold">Newest accounts</h3>
                <Link to="/admin/creators" className="text-sm font-semibold text-accent hover:underline">
                  View all
                </Link>
              </div>
              {data.recentUsers.length === 0 ? (
                <p className="p-6 text-center text-sm text-text-muted">No accounts yet.</p>
              ) : (
                <ul className="divide-y divide-border/60">
                  {data.recentUsers.map((u) => (
                    <li key={u.id} className="flex items-center justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{u.displayName ?? u.username ?? u.email}</p>
                        <p className="truncate text-xs text-text-muted">{u.email}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {u.role === 'admin' && <Badge tone="info">Admin</Badge>}
                        {u.status === 'active' ? (
                          <Badge tone="success">Active</Badge>
                        ) : (
                          <Badge tone="danger">Suspended</Badge>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card className="overflow-hidden p-0">
              <div className="flex items-center justify-between border-b border-border p-4">
                <h3 className="text-base font-bold">Recent admin activity</h3>
                <Link to="/admin/roles" className="text-sm font-semibold text-accent hover:underline">
                  Audit log
                </Link>
              </div>
              {data.recentAudit.length === 0 ? (
                <EmptyState title="No admin activity yet" hint="Actions like suspending an account will appear here." />
              ) : (
                <ul className="divide-y divide-border/60">
                  {data.recentAudit.map((a) => (
                    <li key={a.id} className="p-4">
                      <p className="text-sm font-medium">{humanAction(a.action)}</p>
                      <p className="mt-0.5 text-xs text-text-muted">
                        {a.actorEmail}
                        {a.targetLabel ? ` → ${a.targetLabel}` : ''} · {timeAgo(a.createdAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
