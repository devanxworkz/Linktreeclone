import { Link } from 'react-router-dom';
import { Badge, Card, EmptyState, Skeleton, StatCard } from '../../components/ui';
import { BarChart, ErrorBanner, formatDateTime } from '../../components/admin/AdminBits';
import { api } from '../../lib/api';
import { useAsync } from '../../lib/useAsync';
import { formatNumber } from '../../lib/format';
import type { AdminAnalyticsData } from '../../lib/types';

export default function AdminAnalytics() {
  const { data, loading, error } = useAsync(() => api.get<AdminAnalyticsData>('/api/admin/analytics'));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold">Analytics</h2>
        <p className="mt-1 text-sm text-text-muted">Platform-wide reach, measured from real page views and clicks.</p>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading || !data ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
          <Skeleton className="h-56" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total views" value={formatNumber(data.totals.views)} hint={`${formatNumber(data.totals.views_7d)} this week`} />
            <StatCard label="Views · 30 days" value={formatNumber(data.totals.views_30d)} />
            <StatCard label="Link clicks" value={formatNumber(data.totals.clicks)} />
            <StatCard label="Published pages" value={formatNumber(data.totals.published)} />
          </div>

          <Card>
            <h3 className="text-lg font-bold">Page views · last 30 days</h3>
            {data.totals.views === 0 ? (
              <p className="mt-4 text-sm text-text-muted">No page views recorded yet.</p>
            ) : (
              <div className="mt-4">
                <BarChart series={data.series} ariaLabel="Page views over the last 30 days" height={200} />
              </div>
            )}
          </Card>

          <Card className="overflow-x-auto p-0">
            <div className="border-b border-border p-4">
              <h3 className="text-base font-bold">Top storefronts by views</h3>
            </div>
            {data.topCreators.length === 0 ? (
              <div className="p-6">
                <EmptyState title="No storefronts yet" hint="Creator pages will rank here once they get views." />
              </div>
            ) : (
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface text-text-muted">
                    <th scope="col" className="p-4 font-semibold">#</th>
                    <th scope="col" className="p-4 font-semibold">Storefront</th>
                    <th scope="col" className="p-4 font-semibold">Status</th>
                    <th scope="col" className="p-4 font-semibold">Views</th>
                    <th scope="col" className="p-4 font-semibold">Clicks</th>
                    <th scope="col" className="p-4 font-semibold">Links</th>
                    <th scope="col" className="p-4 font-semibold">Products</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topCreators.map((c, i) => (
                    <tr key={c.tenantId} className="border-b border-border/60">
                      <td className="p-4 text-text-muted">{i + 1}</td>
                      <td className="p-4">
                        <p className="font-medium">{c.displayName ?? 'Untitled'}</p>
                        <p className="font-mono text-xs text-text-muted">{c.username ? `/u/${c.username}` : '—'}</p>
                      </td>
                      <td className="p-4">
                        {c.isPublished ? <Badge tone="success">Live</Badge> : <Badge tone="muted">Draft</Badge>}
                      </td>
                      <td className="p-4 font-semibold">{formatNumber(c.views)}</td>
                      <td className="p-4">{formatNumber(c.clicks)}</td>
                      <td className="p-4">{formatNumber(c.links)}</td>
                      <td className="p-4">{formatNumber(c.products)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>

          <p className="text-xs text-text-muted">
            Snapshot generated {formatDateTime(new Date().toISOString())} from live data.
            <Link to="/admin/storefronts" className="ml-1 font-semibold text-accent hover:underline">
              Browse all storefronts
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
