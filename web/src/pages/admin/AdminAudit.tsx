import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, EmptyState, Field, Input, Select, Skeleton } from '../../components/ui';
import { ErrorBanner, Pager, formatDateTime, humanAction, timeAgo } from '../../components/admin/AdminBits';
import { api } from '../../lib/api';
import { useAsync } from '../../lib/useAsync';
import { formatNumber } from '../../lib/format';
import type { AdminAuditEntry, AdminUserRow, Paginated } from '../../lib/types';

export default function AdminAudit() {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);

  const actions = useAsync(() => api.get<{ actions: string[] }>('/api/admin/audit/actions'));
  const admins = useAsync(() => api.get<Paginated<AdminUserRow>>('/api/admin/users?role=admin&page=1'));

  const qs = (() => {
    const p = new URLSearchParams();
    if (submitted) p.set('q', submitted);
    if (action) p.set('action', action);
    p.set('page', String(page));
    return p.toString();
  })();

  const { data, loading, error } = useAsync(
    () => api.get<Paginated<AdminAuditEntry>>(`/api/admin/audit?${qs}`),
    [qs],
  );

  function onSearch(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    setSubmitted(query);
  }

  const rows = data?.rows ?? [];
  const adminRows = admins.data?.rows ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold">Admin Roles &amp; Audit Logs</h2>
        <p className="mt-1 text-sm text-text-muted">
          Who has access, and every sensitive action they have taken. This log is append-only.
        </p>
      </div>

      <Card className="overflow-x-auto p-0">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="text-base font-bold">Administrators</h3>
          <Link to="/admin/creators?q=" className="text-sm font-semibold text-accent hover:underline">
            Manage on Creators &amp; Users
          </Link>
        </div>
        {admins.loading || !admins.data ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
          </div>
        ) : adminRows.length === 0 ? (
          <p className="p-6 text-center text-sm text-text-muted">No administrators.</p>
        ) : (
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-text-muted">
                <th scope="col" className="p-4 font-semibold">Email</th>
                <th scope="col" className="p-4 font-semibold">Status</th>
                <th scope="col" className="p-4 font-semibold">Last sign-in</th>
                <th scope="col" className="p-4 font-semibold">Registered</th>
              </tr>
            </thead>
            <tbody>
              {adminRows.map((a) => (
                <tr key={a.id} className="border-b border-border/60">
                  <td className="p-4 font-medium">{a.email}</td>
                  <td className="p-4">
                    {a.status === 'active' ? (
                      <Badge tone="success">Active</Badge>
                    ) : (
                      <Badge tone="danger">Suspended</Badge>
                    )}
                  </td>
                  <td className="p-4 text-text-muted">{timeAgo(a.lastLoginAt)}</td>
                  <td className="p-4 text-text-muted">{formatDateTime(a.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card>
        <form onSubmit={onSearch} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <Field label="Search" htmlFor="audit-search">
              <Input
                id="audit-search"
                type="search"
                placeholder="Actor email or target…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </Field>
          </div>
          <Field label="Action" htmlFor="audit-action">
            <Select
              id="audit-action"
              value={action}
              onChange={(e) => {
                setAction(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All actions</option>
              {(actions.data?.actions ?? []).map((a) => (
                <option key={a} value={a}>
                  {humanAction(a)}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex gap-2">
            <Button type="submit">Search</Button>
            {(submitted || action) && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setQuery('');
                  setSubmitted('');
                  setAction('');
                  setPage(1);
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </form>
      </Card>

      {error && <ErrorBanner message={error} />}

      <Card className="overflow-x-auto p-0">
        {loading || !data ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
          </div>
        ) : rows.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No audit entries"
              hint="Administrative actions such as suspending an account are recorded here."
            />
          </div>
        ) : (
          <table className="w-full min-w-[820px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-text-muted">
                <th scope="col" className="p-4 font-semibold">When</th>
                <th scope="col" className="p-4 font-semibold">Action</th>
                <th scope="col" className="p-4 font-semibold">Actor</th>
                <th scope="col" className="p-4 font-semibold">Target</th>
                <th scope="col" className="p-4 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border/60 align-top">
                  <td className="whitespace-nowrap p-4 text-text-muted">{formatDateTime(r.createdAt)}</td>
                  <td className="p-4">
                    <Badge tone="info">{humanAction(r.action)}</Badge>
                  </td>
                  <td className="p-4">{r.actorEmail}</td>
                  <td className="p-4">
                    {r.targetLabel ?? '—'}
                    {r.targetType && <span className="ml-1 text-xs text-text-muted">({r.targetType})</span>}
                  </td>
                  <td className="p-4 text-text-muted">
                    {r.metadata && typeof r.metadata.reason === 'string' ? String(r.metadata.reason) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {data && <Pager page={data.page} pageSize={data.pageSize} total={data.total} onPage={setPage} />}

      <p className="text-xs text-text-muted">{data ? `${formatNumber(data.total)} entries` : ' '}</p>
    </div>
  );
}

