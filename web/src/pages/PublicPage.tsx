import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PublicView, type PublicViewData } from '../components/PublicView';
import { Button, Spinner } from '../components/ui';
import { ApiError, api } from '../lib/api';
import type { Layout, ThemeKey } from '../lib/types';

interface ServerPage {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  whatsappNumber: string | null;
  upiId: string | null;
  upiQrUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  theme: { themeKey: ThemeKey; layout: Layout; accent: string };
  appearance: unknown;
  links: { id: string; title: string; url: string; icon: string; position: number }[];
  products: {
    id: string;
    title: string;
    description: string;
    imageUrl: string | null;
    pricePaise: number | null;
    currency: string;
    destinationUrl: string;
    position: number;
  }[];
}

const viewed = new Set<string>();

export default function PublicPage() {
  const { username = '' } = useParams();
  const [page, setPage] = useState<ServerPage | null>(null);
  const [status, setStatus] = useState<'loading' | 'ok' | 'missing'>('loading');
  const requestedRef = useRef(false);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    api
      .get<{ page: ServerPage }>(`/api/public/${encodeURIComponent(username)}`)
      .then((res) => {
        if (!active) return;
        setPage(res.page);
        setStatus('ok');
      })
      .catch((err) => {
        if (!active) return;
        if (err instanceof ApiError && err.status === 404) setStatus('missing');
        else setStatus('missing');
      });
    return () => {
      active = false;
    };
  }, [username]);

  // Record a single view per page-load (StrictMode double-invoke safe).
  useEffect(() => {
    if (status !== 'ok' || requestedRef.current) return;
    requestedRef.current = true;
    const key = username.toLowerCase();
    if (viewed.has(key)) return;
    viewed.add(key);
    void api
      .post(`/api/public/${encodeURIComponent(username)}/view`, { referrer: document.referrer || undefined })
      .catch(() => undefined);
  }, [status, username]);

  useEffect(() => {
    if (page?.metaTitle) document.title = page.metaTitle;
    else if (page?.displayName) document.title = `${page.displayName} · Pehchaan`;
    return () => {
      document.title = 'Pehchaan';
    };
  }, [page]);

  function trackClick(linkId: string) {
    if (linkId === 'whatsapp') return;
    void api.post(`/api/public/${encodeURIComponent(username)}/click/${linkId}`).catch(() => undefined);
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-text-muted">
        <Spinner className="h-6 w-6" />
        <span className="sr-only">Loading page</span>
      </div>
    );
  }

  if (status === 'missing' || !page) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="text-lg font-extrabold">This page is not available</p>
        <p className="mt-2 max-w-sm text-sm text-text-muted">
          The creator may have unpublished it, or the link is wrong.
        </p>
        <Link to="/" className="mt-6">
          <Button>Go to Pehchaan</Button>
        </Link>
      </div>
    );
  }

  const data: PublicViewData = {
    displayName: page.displayName,
    bio: page.bio,
    avatarUrl: page.avatarUrl,
    whatsappNumber: page.whatsappNumber,
    upiId: page.upiId,
    upiQrUrl: page.upiQrUrl,
    theme: page.theme,
    appearance: page.appearance,
    links: page.links.map((l) => ({ id: l.id, title: l.title, url: l.url, icon: l.icon })),
    products: page.products.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      imageUrl: p.imageUrl,
      pricePaise: p.pricePaise,
      currency: p.currency,
      destinationUrl: p.destinationUrl,
    })),
  };

  return <PublicView data={data} onLinkClick={trackClick} />;
}
