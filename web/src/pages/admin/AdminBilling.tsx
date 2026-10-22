import { Link } from 'react-router-dom';
import { Card, Skeleton, StatCard } from '../../components/ui';
import { ErrorBanner } from '../../components/admin/AdminBits';
import { api } from '../../lib/api';
import { useAsync } from '../../lib/useAsync';
import { formatNumber } from '../../lib/format';
import type { AdminOverviewData } from '../../lib/types';

export default function AdminBilling() {
  const { data, loading, error } = useAsync(() => api.get<AdminOverviewData>('/api/admin/overview'));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold">Plans &amp; Billing</h2>
        <p className="mt-1 text-sm text-text-muted">The commercial state of the platform.</p>
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading || !data ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <StatCard label="Creators on free plan" value={formatNumber(data.totals.creators)} />
            <StatCard label="Paid subscriptions" value="0" hint="No payment provider connected" />
            <StatCard label="Live storefronts" value={formatNumber(data.totals.published)} />
            <StatCard label="Suspended" value={formatNumber(data.totals.suspended)} />
          </>
        )}
      </div>

      <Card>
        <h3 className="text-lg font-bold">Billing is not enabled</h3>
        <p className="mt-2 max-w-2xl text-sm text-text-muted">
          Pehchaan does not currently collect payments. Every creator is on the single free plan, so there
          is no revenue, invoice or subscription data to display — and none is invented here.
        </p>
        <p className="mt-4 text-sm text-text-muted">
          When a payment provider is added, plan management, invoices and revenue reporting will appear on
          this page.
        </p>
        <Link
          to="/admin/creators"
          className="mt-4 inline-block text-sm font-semibold text-accent hover:underline"
        >
          Manage creators
        </Link>
      </Card>
    </div>
  );
}
