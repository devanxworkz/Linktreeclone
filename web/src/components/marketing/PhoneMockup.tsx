import type { ReactNode } from 'react';
import { ArtPanel, TEMPLATES, type MotifKey, type TemplateKey } from './art';
import { IconWhatsapp } from '../icons';

export interface MockLink {
  label: string;
  icon: ReactNode;
  social?: boolean;
}

export interface MockProduct {
  title: string;
  price: string;
  motif: MotifKey;
  from: string;
  to: string;
}

export interface PhoneMockupProps {
  template?: TemplateKey;
  name: string;
  handle?: string;
  tagline?: string;
  avatarFrom?: string;
  avatarTo?: string;
  links?: MockLink[];
  products?: MockProduct[];
  socials?: ReactNode;
  showWhatsapp?: boolean;
  upi?: string;
  width?: number;
  className?: string;
}

export function PhoneMockup({
  template = 'saffron',
  name,
  handle,
  tagline,
  avatarFrom = '#c2410c',
  avatarTo = '#f59e0b',
  links = [],
  products = [],
  socials,
  showWhatsapp = true,
  upi,
  width = 250,
  className = '',
}: PhoneMockupProps) {
  const t = TEMPLATES[template]!;
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const pageLinks = links.filter((l) => !l.social);
  const socialLinks = links.filter((l) => l.social);

  return (
    <div className={`phone ${className}`.trim()} style={{ width }}>
      <div className="phone-screen" style={{ background: t.page, color: t.ink }}>
        <div className="phone-notch" aria-hidden="true" />
        <div className="max-h-[30rem] overflow-hidden px-3.5 pb-6 pt-4">
          <div className="text-center">
            <span
              className="phone-avatar"
              style={{ background: `linear-gradient(140deg, ${avatarFrom}, ${avatarTo})` }}
              aria-hidden="true"
            >
              {initial}
            </span>
            <p className="mt-2.5 text-base font-extrabold leading-tight" style={{ color: t.ink }}>
              {name}
            </p>
            {tagline && (
              <p className="mt-0.5 text-[11px] leading-tight" style={{ color: t.muted }}>
                {tagline}
              </p>
            )}
            {handle && (
              <p className="mt-1 text-[10px] font-semibold" style={{ color: t.accent }}>
                /u/{handle}
              </p>
            )}
          </div>

          {(showWhatsapp || socials || socialLinks.length > 0) && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
              {showWhatsapp && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold"
                  style={{ background: 'rgba(37,211,102,0.16)', color: '#128c4a' }}
                >
                  <IconWhatsapp /> WhatsApp
                </span>
              )}
              {socials}
              {socialLinks.map((l) => (
                <span key={l.label} className="mock-social" style={{ color: t.accent, borderColor: t.ring }}>
                  {l.icon}
                </span>
              ))}
            </div>
          )}

          {pageLinks.length > 0 && (
            <div className="mt-3 flex flex-col gap-2">
              {pageLinks.map((l) => (
                <span
                  key={l.label}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-bold"
                  style={{
                    background: t.buttonBg,
                    color: t.buttonInk,
                    borderRadius: Math.min(t.radius, 14),
                  }}
                >
                  <span className="opacity-90">{l.icon}</span>
                  {l.label}
                </span>
              ))}
            </div>
          )}

          {products.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {products.map((p) => (
                <div
                  key={p.title}
                  className="overflow-hidden"
                  style={{ background: t.surface, borderRadius: Math.min(t.radius, 14) }}
                >
                  <ArtPanel
                    motif={p.motif}
                    from={p.from}
                    to={p.to}
                    className="h-16 w-full rounded-none"
                    motifClassName="h-7 w-7 text-white/70"
                  />
                  <div className="p-1.5">
                    <p className="truncate text-[10px] font-bold" style={{ color: t.surfaceInk }}>
                      {p.title}
                    </p>
                    <p className="text-[10px] font-extrabold" style={{ color: t.accent }}>
                      {p.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {upi && (
            <div
              className="mt-3 flex items-center justify-between gap-2 px-3 py-2"
              style={{ background: t.surface, borderRadius: Math.min(t.radius, 14) }}
            >
              <span className="text-[10px] font-bold" style={{ color: t.surfaceInk }}>
                Pay by UPI
              </span>
              <span className="font-mono text-[10px]" style={{ color: t.muted }}>
                {upi}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
