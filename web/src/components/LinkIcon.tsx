import type { ReactNode } from 'react';
import {
  IconBag,
  IconChart,
  IconFacebook,
  IconGlobe,
  IconInstagram,
  IconLink,
  IconLinkedin,
  IconTiktok,
  IconUser,
  IconWhatsapp,
  IconX,
  IconYoutube,
} from './icons';

export const ICON_KEYS = [
  'link',
  'instagram',
  'linkedin',
  'facebook',
  'tiktok',
  'youtube',
  'x',
  'whatsapp',
  'globe',
  'bag',
  'chart',
  'user',
] as const;

export type IconKey = (typeof ICON_KEYS)[number];

const MAP: Record<IconKey, ReactNode> = {
  link: <IconLink />,
  instagram: <IconInstagram />,
  linkedin: <IconLinkedin />,
  facebook: <IconFacebook />,
  tiktok: <IconTiktok />,
  youtube: <IconYoutube />,
  x: <IconX />,
  whatsapp: <IconWhatsapp />,
  globe: <IconGlobe />,
  bag: <IconBag />,
  chart: <IconChart />,
  user: <IconUser />,
};

export function LinkIcon({ name }: { name: string }) {
  const icon = MAP[(name as IconKey) in MAP ? (name as IconKey) : 'link'];
  return <span style={{ fontSize: 18 }}>{icon}</span>;
}

/* ------------------------------ social links ------------------------------ */

/**
 * Icons that identify a platform rather than a generic link. On the public page
 * these render as a compact centred row of round icon buttons instead of the
 * full-width titled link buttons used for everything else.
 */
export const SOCIAL_ICON_KEYS = [
  'instagram',
  'linkedin',
  'facebook',
  'tiktok',
  'youtube',
  'x',
  'whatsapp',
  'globe',
] as const;

export type SocialIconKey = (typeof SOCIAL_ICON_KEYS)[number];

const SOCIAL_KEYS_SET = new Set<string>(SOCIAL_ICON_KEYS);

export const SOCIAL_ICON_LABELS: Record<SocialIconKey, string> = {
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  x: 'X (Twitter)',
  whatsapp: 'WhatsApp',
  globe: 'Website',
};

// Match a destination host to a platform, so a link saved before the platform
// icons existed (or saved with the generic "link" icon) is still recognised.
const HOST_RULES: { key: SocialIconKey; hosts: string[] }[] = [
  { key: 'instagram', hosts: ['instagram.com'] },
  { key: 'linkedin', hosts: ['linkedin.com', 'lnkd.in'] },
  { key: 'facebook', hosts: ['facebook.com', 'fb.com', 'fb.me', 'm.facebook.com'] },
  { key: 'tiktok', hosts: ['tiktok.com'] },
  { key: 'youtube', hosts: ['youtube.com', 'youtu.be'] },
  { key: 'x', hosts: ['x.com', 'twitter.com'] },
  { key: 'whatsapp', hosts: ['wa.me', 'whatsapp.com', 'api.whatsapp.com'] },
];

/**
 * Resolve the platform icon for a link, or `null` when it is a normal link.
 * The explicit icon wins; otherwise the destination host decides.
 */
export function socialIconFor(link: { icon: string; url: string }): SocialIconKey | null {
  if (SOCIAL_KEYS_SET.has(link.icon)) return link.icon as SocialIconKey;

  let host: string;
  try {
    host = new URL(link.url).host.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
  for (const rule of HOST_RULES) {
    if (rule.hosts.some((h) => host === h || host.endsWith(`.${h}`))) return rule.key;
  }
  return null;
}

/** Accessible name for a social icon: platform first, creator's title if useful. */
export function socialIconLabel(key: SocialIconKey, title: string): string {
  const platform = SOCIAL_ICON_LABELS[key];
  const trimmed = title.trim();
  if (!trimmed || trimmed.toLowerCase() === platform.toLowerCase()) return platform;
  return `${platform}: ${trimmed}`;
}
