import type { CSSProperties } from 'react';
import { Avatar } from './ui';
import { LinkIcon, socialIconFor, socialIconLabel, type SocialIconKey } from './LinkIcon';
import { IconLogo, IconWhatsapp } from './icons';
import { formatINR, hostOf, upiLink, whatsappLink } from '../lib/format';
import {
  FONT_STACKS,
  ensureContrast,
  ensureContrastAll,
  normalizeAppearance,
  readableOn,
  withAlpha,
  type Appearance,
} from '../lib/appearance';
import type { Layout, ThemeKey } from '../lib/types';

export interface PublicViewData {
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  whatsappNumber: string | null;
  upiId: string | null;
  upiQrUrl: string | null;
  theme: { themeKey: ThemeKey; layout: Layout; accent: string };
  /** Raw server jsonb; coerced by normalizeAppearance() before rendering. */
  appearance?: unknown;
  links: { id: string; title: string; url: string; icon: string }[];
  products: {
    id: string;
    title: string;
    description: string;
    imageUrl: string | null;
    pricePaise: number | null;
    currency: string;
    destinationUrl: string;
  }[];
}

interface Props {
  data: PublicViewData;
  onLinkClick?: (linkId: string) => void;
  /** Editor / preview-pub previews are boxed: same markup, smaller canvas. */
  compact?: boolean;
}

function buttonRadius(shape: Appearance['button']['shape']): number {
  if (shape === 'pill') return 999;
  if (shape === 'square') return 4;
  return 14;
}

function aspectClass(aspect: Appearance['products']['aspect']): string {
  if (aspect === 'portrait') return 'aspect-[3/4]';
  if (aspect === 'landscape') return 'aspect-[4/3]';
  return 'aspect-square';
}

function shadowFor(shadow: Appearance['button']['shadow']): string {
  if (shadow === 'soft') return '0 2px 6px rgba(0,0,0,0.16)';
  if (shadow === 'bold') return '0 10px 24px rgba(0,0,0,0.24)';
  return 'none';
}

function backgroundStyle(a: Appearance): CSSProperties {
  const bg = a.background;
  if (bg.imageUrl) {
    return {
      backgroundColor: bg.color,
      backgroundImage: `url("${bg.imageUrl}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    };
  }
  if (bg.kind === 'gradient') {
    return { background: `linear-gradient(${bg.gradientAngle}deg, ${bg.gradientFrom}, ${bg.gradientTo})` };
  }
  return { backgroundColor: bg.color };
}

export function PublicView({ data, onLinkClick, compact = false }: Props) {
  const a = normalizeAppearance(data.appearance, {
    themeKey: data.theme.themeKey,
    accent: data.theme.accent,
  });
  const wa = whatsappLink(data.whatsappNumber, `Hi ${data.displayName}, I found your Pehchaan page.`);
  const upi = upiLink(data.upiId, data.displayName);
  const layout = data.theme.layout;

  // Social-platform links become a compact row of platform icons; every other
  // link keeps the full-width titled button treatment.
  const classified = data.links.map((link) => ({ link, social: socialIconFor(link) }));
  const socialLinks = classified.filter(
    (c): c is { link: PublicViewData['links'][number]; social: SocialIconKey } => c.social !== null,
  );
  const pageLinks = classified.filter((c) => c.social === null).map((c) => c.link);

  const bg = a.background;
  const pageBackdrops = bg.imageUrl
    ? [bg.color]
    : bg.kind === 'gradient'
      ? [bg.color, bg.gradientFrom, bg.gradientTo]
      : [bg.color];

  const onSurface = a.section.surface === '' ? null : a.section.surface;
  const headingColor = ensureContrastAll(a.typography.headingColor, pageBackdrops);
  const bodyColor = ensureContrastAll(a.typography.bodyColor, pageBackdrops);
  const sectionHeading = onSurface ? ensureContrastAll(a.typography.headingColor, [onSurface]) : headingColor;
  const sectionBody = onSurface ? ensureContrastAll(a.typography.bodyColor, [onSurface]) : bodyColor;

  const buttonBg = a.button.color;
  const buttonFg = ensureContrast(a.button.textColor, buttonBg, 4.5);
  const radiusPx = buttonRadius(a.button.shape);
  const buttonBorder =
    a.button.border === 'none'
      ? 'none'
      : a.button.border === 'strong'
        ? `2px solid ${buttonFg}`
        : `1px solid ${buttonFg}`;
  const buttonShadow = shadowFor(a.button.shadow);

  // Cards: filled styles sit on the section surface (or a light/dark default),
  // outlined cards sit straight on the page background.
  const lightPage = readableOn(pageBackdrops[0]!, '#ffffff') === '#ffffff';
  const filledCardBg = onSurface ?? (lightPage ? '#ffffff' : '#161b26');
  const outlined = a.products.card === 'outlined';
  const cardBg = outlined ? 'transparent' : filledCardBg;
  const cardTitle = outlined ? headingColor : ensureContrast(headingColor, filledCardBg, 4.5);
  const cardBody = outlined ? bodyColor : ensureContrast(bodyColor, filledCardBg, 4.5);
  const cardPrice = outlined
    ? ensureContrastAll(buttonBg, pageBackdrops, 4.5)
    : ensureContrast(buttonBg, filledCardBg, 4.5);
  const divider = withAlpha(headingColor, 0.16);

  const cardStyle: CSSProperties = {
    background: cardBg,
    border: `1px solid ${divider}`,
    borderRadius: a.section.radius,
    boxShadow: a.products.card === 'soft' ? '0 2px 12px rgba(0,0,0,0.10)' : 'none',
  };

  const sectionStyle: CSSProperties = {
    background: onSurface ?? 'transparent',
    borderRadius: a.section.radius,
    padding: compact ? Math.min(a.section.padding, 16) : a.section.padding,
  };

  const waColor = ensureContrastAll(buttonBg, pageBackdrops, 4.5);
  const whatsappStyle: CSSProperties = {
    background: withAlpha(headingColor, 0.08),
    border: `1.5px solid ${waColor}`,
    color: waColor,
    borderRadius: radiusPx,
  };

  const rootStyle = {
    ...backgroundStyle(a),
    fontFamily: FONT_STACKS[a.typography.font],
    '--pub-accent': buttonBg,
    '--pub-on-accent': buttonFg,
    '--pub-heading': headingColor,
    '--pub-body': bodyColor,
  } as CSSProperties;

  const alignLeft = a.avatar.align === 'left';
  const column = compact ? 'w-full' : 'w-full max-w-xl sm:max-w-2xl';
  const gapStyle = { gap: a.section.gap };
  const listGap = { gap: a.button.gap };

  const linkButton: CSSProperties = {
    background: buttonBg,
    color: buttonFg,
    borderRadius: radiusPx,
    border: buttonBorder,
    boxShadow: buttonShadow,
    padding: compact ? '0.7rem 1rem' : '0.9rem 1.15rem',
  };

  const buyButton: CSSProperties = {
    background: buttonBg,
    color: buttonFg,
    borderRadius: radiusPx,
    border: buttonBorder,
    boxShadow: buttonShadow,
  };

  const listMode = a.products.layout === 'list';

  return (
    <div data-public-view style={rootStyle} className={compact ? 'relative overflow-hidden rounded-2xl' : 'relative min-h-screen'}>
      {bg.imageUrl && (
        <div aria-hidden="true" className="absolute inset-0" style={{ backgroundColor: withAlpha(bg.color, 0.84) }} />
      )}

      <header
        className={`relative z-10 ${compact ? 'px-5 pb-5 pt-7' : 'px-5 pb-8 pt-10 sm:pt-14'} ${
          alignLeft ? 'text-left' : 'text-center'
        }`}
      >
        <div className={`${column} ${alignLeft ? '' : 'mx-auto'}`}>
          <div className={`flex ${alignLeft ? 'justify-start' : 'justify-center'}`}>
            <Avatar
              src={data.avatarUrl}
              name={data.displayName || '?'}
              size={compact ? Math.min(a.avatar.size, 96) : a.avatar.size}
            />
          </div>

          <h1
            className="leading-tight"
            style={{
              color: headingColor,
              marginTop: a.section.gap,
              fontWeight: 800,
              fontSize: `calc(1.75rem * ${a.typography.headingScale})`,
            }}
          >
            {data.displayName || 'Your name'}
          </h1>

          {data.bio && (
            <p
              className={`mt-2 text-sm leading-relaxed ${compact ? '' : 'sm:text-base'}`}
              style={{
                color: bodyColor,
                maxWidth: '46ch',
                marginLeft: alignLeft ? undefined : 'auto',
                marginRight: alignLeft ? undefined : 'auto',
              }}
            >
              {data.bio}
            </p>
          )}

          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              onClick={() => onLinkClick?.('whatsapp')}
              data-testid="whatsapp-cta"
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold transition duration-200 hover:-translate-y-0.5"
              style={whatsappStyle}
            >
              <IconWhatsapp /> Chat on WhatsApp
            </a>
          )}

          {socialLinks.length > 0 && (
            <ul
              data-testid="social-links"
              aria-label="Social links"
              className="mt-5 flex flex-wrap items-center justify-center gap-2.5"
              style={{ '--soc': waColor } as CSSProperties}
            >
              {socialLinks.map(({ link, social }) => {
                const label = socialIconLabel(social, link.title);
                return (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      onClick={() => onLinkClick?.(link.id)}
                      data-social={social}
                      aria-label={label}
                      title={label}
                      className="public-social-icon"
                    >
                      <LinkIcon name={social} />
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </header>

      <main className={`relative z-10 ${compact ? 'px-4 pb-5' : 'px-4 pb-16'}`}>
        <div className={`${column} ${alignLeft ? '' : 'mx-auto'}`}>
          {pageLinks.length > 0 && (
            <ul className={layout === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2' : 'flex flex-col'} style={listGap}>
              {pageLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => onLinkClick?.(link.id)}
                    className="flex h-full w-full flex-col items-center justify-center gap-0.5 text-center transition duration-200 hover:-translate-y-0.5 focus-visible:-translate-y-0.5"
                    style={linkButton}
                  >
                    <span className="inline-flex items-center gap-2 text-sm font-bold">
                      <LinkIcon name={link.icon} />
                      <span>{link.title}</span>
                    </span>
                    <span className="text-[11px] font-normal opacity-75">{hostOf(link.url)}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}

          {data.products.length > 0 && (
            <section aria-label="Products" data-testid="products-section" className="mt-6" style={sectionStyle}>
              <h2
                className="text-xs font-bold uppercase tracking-[0.14em]"
                style={{ color: sectionBody, marginBottom: a.section.gap }}
              >
                Products
              </h2>

              <ul
                className={
                  listMode ? 'flex flex-col' : 'grid grid-cols-2 gap-3 sm:gap-4'
                }
                style={listMode ? gapStyle : undefined}
              >
                {data.products.map((p) => {
                  const price = formatINR(p.pricePaise);
                  const action = p.pricePaise === null ? 'View' : 'Buy';
                  const ratio = aspectClass(a.products.aspect);
                  const imageWidth = listMode ? (compact ? 'w-20' : 'w-28') : 'w-full';

                  return (
                    <li
                      key={p.id}
                      data-product-card
                      style={cardStyle}
                      className={
                        'overflow-hidden transition duration-200' +
                        (compact ? '' : ' hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(0,0,0,0.16)]')
                      }
                    >
                      <div
                        className={listMode ? 'flex items-center gap-3 p-3 sm:gap-4 sm:p-4' : 'flex flex-col'}
                        style={listMode ? undefined : gapStyle}
                      >
                        <div
                          className={`${listMode ? 'shrink-0' : 'w-full'} overflow-hidden`}
                          style={{ borderRadius: a.products.imageRadius }}
                        >
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.title}
                              loading="lazy"
                              className={`${imageWidth} ${ratio} object-cover`}
                            />
                          ) : (
                            <span
                              className={`flex ${imageWidth} ${ratio} items-center justify-center font-bold`}
                              style={{
                                background: withAlpha(buttonBg, 0.16),
                                color: cardPrice,
                                fontSize: 26,
                              }}
                              aria-hidden="true"
                            >
                              {p.title.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div
                          className={
                            listMode ? 'flex min-w-0 flex-1 items-center gap-3' : 'flex flex-1 flex-col gap-2 p-3'
                          }
                        >
                          <div className="min-w-0 flex-1">
                            <p
                              className="truncate font-bold"
                              style={{ color: cardTitle, fontSize: compact ? '0.95rem' : '1.05rem' }}
                            >
                              {p.title}
                            </p>
                            {p.description && (
                              <p
                                className="mt-1 line-clamp-2 text-xs leading-relaxed"
                                style={{ color: cardBody }}
                              >
                                {p.description}
                              </p>
                            )}
                            {price && (
                              <p
                                className="mt-1.5 font-extrabold"
                                style={{ color: cardPrice, fontSize: compact ? '0.95rem' : '1.1rem' }}
                              >
                                {price}
                              </p>
                            )}
                          </div>

                          <a
                            href={p.destinationUrl}
                            target="_blank"
                            rel="noreferrer"
                            data-testid="product-action"
                            className={`inline-flex shrink-0 items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold transition duration-200 hover:-translate-y-0.5 ${
                              listMode ? '' : 'mt-1 w-full'
                            }`}
                            style={buyButton}
                          >
                            {action}
                          </a>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {upi && (
            <section aria-label="Pay by UPI" className="mt-6 text-center" style={sectionStyle}>
              <h2 className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: sectionBody }}>
                Pay directly
              </h2>
              {data.upiQrUrl && (
                <img
                  src={data.upiQrUrl}
                  alt="UPI QR code"
                  className="mx-auto mt-3 h-40 w-40 rounded-md bg-white object-contain p-1"
                />
              )}
              <p className="mt-3 font-mono text-sm" style={{ color: sectionHeading }}>
                {data.upiId}
              </p>
              <a
                href={upi}
                className="mt-3 inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold transition duration-200 hover:-translate-y-0.5"
                style={buyButton}
              >
                Pay via UPI
              </a>
              <p className="mt-2 text-[11px] leading-relaxed" style={{ color: sectionBody }}>
                Opens your own UPI app. Pehchaan does not process or confirm the payment.
              </p>
            </section>
          )}

          <footer className="mt-10 flex justify-center">
            <a
              href="/register"
              className="inline-flex items-center gap-1.5 text-xs font-semibold transition duration-200 hover:opacity-80"
              style={{ color: bodyColor, opacity: 0.75 }}
            >
              <IconLogo /> Made with Pehchaan
            </a>
          </footer>
        </div>
      </main>
    </div>
  );
}
