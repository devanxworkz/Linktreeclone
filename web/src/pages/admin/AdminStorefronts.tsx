import { useState, type FormEvent } from 'react';
import { Avatar, Badge, Button, Card, EmptyState, Field, Input, Select, Skeleton } from '../../components/ui';
import { ErrorBanner, Pager, formatDate } from '../../components/admin/AdminBits';
import { IconExternal } from '../../components/icons';
import { api } from '../../lib/api';
import { useAsync } from '../../lib/useAsync';
import { formatNumber } from '../../lib/format';
import type { AdminStorefrontRow, Paginated } from '../../lib/types';

type PublishedFilter = '' | 'true' | 'false';

export default function AdminStorefronts() {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [published, setPublished] = useState<PublishedFilter>('');
  const [page, setPage] = useState(1);

  const qs = (() => {
    const p = new URLSearchParams();
    if (submitted) p.set('q', submitted);
    if (published) p.set('published', published);
    p.set('page', String(page));
    return p.toString();
  })();

  const { data, loading, error } = useAsync(
    () => api.get<Paginated<AdminStorefrontRow>>(`/api/admin/storefronts?${qs}`),
    [qs],
  );

  function onSearch(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    setSubmitted(query);
  }

  const rows = data?.rows ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold">Storefronts</h2>
        <p className="mt-1 text-sm text-text-muted">Every creator page on the platform, ranked by reach.</p>
      </div>

      <Card>
        <form onSubmit={onSearch} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <Field label="Search" htmlFor="storefront-search">
              <Input
                id="storefront-search"
                type="search"
                placeholder="Username or name…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </Field>
          </div>
          <Field label="State" htmlFor="storefront-state">
            <Select
              id="storefront-state"
              value={published}
              onChange={(e) => {
                setPublished(e.target.value as PublishedFilter);
                setPage(1);
              }}
            >
              <option value="">Any state</option>
              <option value="true">Live</option>
              <option value="false">Draft</option>
            </Select>
          </Field>
          <div className="flex gap-2">
            <Button type="submit">Search</Button>
            {(submitted || published) && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setQuery('');
                  setSubmitted('');
                  setPublished('');
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
            <EmptyState title="No storefronts match" hint="Try a different search term or clear the filters." />
          </div>
        ) : (
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-text-muted">
                <th scope="col" className="p-4 font-semibold">Storefront</th>
                <th scope="col" className="p-4 font-semibold">State</th>
                <th scope="col" className="p-4 font-semibold">Published</th>
                <th scope="col" className="p-4 font-semibold">Views</th>
                <th scope="col" className="p-4 font-semibold">Links</th>
                <th scope="col" className="p-4 font-semibold">Products</th>
                <th scope="col" className="p-4 font-semibold">Open</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.tenantId} className="border-b border-border/60">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={r.avatarUrl} name={r.displayName ?? r.username ?? '?'} size={32} />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{r.displayName ?? 'Untitled'}</p>
                        <p className="font-mono text-xs text-text-muted">{r.username ? `/u/${r.username}` : '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {r.isPublished ? <Badge tone="success">Live</Badge> : <Badge tone="muted">Draft</Badge>}
                  </td>
                  <td className="p-4 text-text-muted">{formatDate(r.publishedAt)}</td>
                  <td className="p-4 font-semibold">{formatNumber(r.views)}</td>
                  <td className="p-4">{formatNumber(r.links)}</td>
                  <td className="p-4">{formatNumber(r.products)}</td>
                  <td className="p-4">
                    {r.username && r.isPublished ? (
                      <a
                        href={`/u/${r.username}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open /u/${r.username}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
                      >
                        <IconExternal /> Visit
                      </a>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {data && <Pager page={data.page} pageSize={data.pageSize} total={data.total} onPage={setPage} />}
    </div>
  );
}
