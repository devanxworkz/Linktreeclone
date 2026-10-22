import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useI18n } from './I18nProvider';
import { IconClose, IconLogo, IconMenu } from './icons';
import { LOCALES, LOCALE_LABELS, type Locale } from '../lib/i18n';

export function MarketingLayout({ children }: { children: ReactNode }) {
  const { t, locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: t('nav.home', 'Home') },
    { to: '/features', label: t('nav.features', 'Features') },
    { to: '/pricing', label: t('nav.pricing', 'Pricing') },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-lg font-extrabold text-text" aria-label="Pehchaan home">
            <span className="text-accent" style={{ fontSize: 22 }}><IconLogo /></span>
            Pehchaan
          </Link>

          <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `text-sm font-medium ${isActive ? 'text-accent' : 'text-text-muted hover:text-text'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <label className="sr-only" htmlFor="locale">Language</label>
            <select
              id="locale"
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              className="rounded-md border border-border bg-elevated px-2 py-1.5 text-xs text-text"
            >
              {LOCALES.map((l) => (
                <option key={l} value={l}>{LOCALE_LABELS[l]}</option>
              ))}
            </select>
            <Link to="/login" className="text-sm font-semibold text-text hover:text-accent">
              {t('nav.login', 'Log in')}
            </Link>
            <Link
              to="/register"
              className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-on-accent hover:opacity-90"
            >
              {t('nav.signup', 'Start free')}
            </Link>
          </div>

          <button
            type="button"
            className="md:hidden rounded-md border border-border p-2 text-text"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            <span style={{ fontSize: 20 }}>{open ? <IconClose /> : <IconMenu />}</span>
          </button>
        </div>

        {open && (
          <div id="mobile-menu" className="border-t border-border bg-bg md:hidden">
            <nav className="container-page flex flex-col gap-1 py-3" aria-label="Mobile">
              {navLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-accent-soft text-accent' : 'text-text'}`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              <div className="mt-2 flex items-center gap-2">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-md border border-border px-3 py-2 text-center text-sm font-semibold"
                >
                  {t('nav.login', 'Log in')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-md bg-accent px-3 py-2 text-center text-sm font-semibold text-on-accent"
                >
                  {t('nav.signup', 'Start free')}
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-surface">
        <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="flex items-center gap-2 text-base font-extrabold text-text">
              <span className="text-accent" style={{ fontSize: 20 }}><IconLogo /></span> Pehchaan
            </p>
            <p className="mt-2 max-w-xs text-sm text-text-muted">
              One link for everything an Indian creator makes. Built in India, for India.
            </p>
          </div>
          <FooterCol
            title="Product"
            links={[
              { to: '/features', label: 'Features' },
              { to: '/pricing', label: 'Pricing' },
              { to: '/register', label: 'Create a page' },
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              { to: '/about', label: 'About' },
              { to: '/contact', label: 'Contact' },
            ]}
          />
          <FooterCol
            title="Legal"
            links={[
              { to: '/privacy', label: 'Privacy policy' },
              { to: '/terms', label: 'Terms of use' },
            ]}
          />
        </div>
        <div className="border-t border-border">
          <div className="container-page flex flex-col items-center justify-between gap-2 py-4 text-xs text-text-muted sm:flex-row">
            <p>© {new Date().getFullYear()} Pehchaan. A demo product built as an original work.</p>
            <p>Made for creators in India. Not affiliated with any other platform.</p>
          </div>
        </div>
      </footer>
      {/* Reset scroll on navigation. */}
      <ScrollToTop pathname={location.pathname} />
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <p className="text-sm font-bold text-text">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="text-sm text-text-muted hover:text-accent">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScrollToTop({ pathname }: { pathname: string }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
