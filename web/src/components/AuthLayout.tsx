import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { IconLogo } from './icons';

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="border-b border-border bg-bg">
        <div className="container-page flex h-16 items-center">
          <Link to="/" className="flex items-center gap-2 text-lg font-extrabold" aria-label="Pehchaan home">
            <span className="text-accent" style={{ fontSize: 22 }}><IconLogo /></span>
            Pehchaan
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-border bg-bg p-6 shadow-card sm:p-8">
            <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-text-muted">{subtitle}</p>}
            <div className="mt-6">{children}</div>
          </div>
          {footer && <div className="mt-6 text-center text-sm text-text-muted">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
