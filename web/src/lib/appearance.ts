import type { Theme, ThemeKey } from './types';

/* -------------------------------------------------------------------------
   Templates + appearance settings for the public creator storefront.
   The shape below is mirrored by the server Zod schema in
   server/src/validation/schemas.ts (appearanceSchema) — change both together.
   ------------------------------------------------------------------------- */

export type TemplateKey =
  | 'minimal-luxe'
  | 'midnight-pro'
  | 'soft-pastel'
  | 'editorial-fashion'
  | 'vibrant-creator'
  | 'indian-boutique';

export type FontKey = 'sans' | 'serif' | 'rounded' | 'display';
export type BackgroundKind = 'solid' | 'gradient';
export type AvatarShape = 'circle' | 'rounded' | 'square';
export type AvatarAlign = 'center' | 'left';
export type ButtonShape = 'pill' | 'rounded' | 'square';
export type ButtonBorder = 'none' | 'thin' | 'strong';
export type ButtonShadow = 'none' | 'soft' | 'bold';
export type ProductLayout = 'list' | 'grid';
export type ProductAspect = 'square' | 'portrait' | 'landscape';
export type ProductCard = 'soft' | 'outlined' | 'flat';

export interface Appearance {
  template: TemplateKey;
  background: {
    kind: BackgroundKind;
    color: string;
    gradientFrom: string;
    gradientTo: string;
    gradientAngle: number;
    imageUrl: string;
  };
  avatar: { size: number; shape: AvatarShape; align: AvatarAlign };
  typography: { font: FontKey; headingColor: string; bodyColor: string; headingScale: number };
  button: {
    color: string;
    textColor: string;
    shape: ButtonShape;
    border: ButtonBorder;
    shadow: ButtonShadow;
    gap: number;
  };
  products: { layout: ProductLayout; aspect: ProductAspect; card: ProductCard; imageRadius: number };
  section: { surface: string; radius: number; padding: number; gap: number };
}

export interface TemplateDef {
  key: TemplateKey;
  label: string;
  tagline: string;
  /** Three swatches used to draw the gallery thumbnail. */
  swatch: { bg: string; panel: string; accent: string; heading: string };
  defaults: Appearance;
}

/* ---------------------------------- fonts -------------------------------- */

export const FONT_STACKS: Record<FontKey, string> = {
  sans: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  serif: "Georgia, 'Iowan Old Style', 'Times New Roman', serif",
  rounded: "'Segoe UI Rounded', 'SF Pro Rounded', ui-rounded, 'Nunito', system-ui, sans-serif",
  display: "'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif",
};

export const FONT_OPTIONS: { key: FontKey; label: string }[] = [
  { key: 'sans', label: 'Modern sans' },
  { key: 'serif', label: 'Classic serif' },
  { key: 'rounded', label: 'Friendly rounded' },
  { key: 'display', label: 'Editorial display' },
];

/* ------------------------------ colour maths ----------------------------- */

const HEX = /^#[0-9a-fA-F]{6}$/;

export function isHex(value: unknown): value is string {
  return typeof value === 'string' && HEX.test(value);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function rgbOf(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex(r: number, g: number, b: number): string {
  const c = (v: number) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

function channelLuminance(c8: number): number {
  const c = c8 / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = rgbOf(hex);
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

/** WCAG 2.1 contrast ratio between two hex colours (1 → 21). */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = rgbOf(a);
  const [r2, g2, b2] = rgbOf(b);
  return toHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}

/**
 * Nudge `fg` toward black or white until it reaches `min` contrast against
 * `bg`, so no text in a creator page falls below the WCAG AA threshold.
 */
export function ensureContrast(fg: string, bg: string, min = 4.5): string {
  if (!isHex(fg) || !isHex(bg)) return fg;
  if (contrastRatio(fg, bg) >= min) return fg;
  const target = relativeLuminance(bg) > 0.4 ? '#000000' : '#ffffff';
  let best = fg;
  for (let t = 0.1; t <= 1.0001; t += 0.1) {
    const candidate = mix(fg, target, t);
    best = candidate;
    if (contrastRatio(candidate, bg) >= min) return candidate;
  }
  return best;
}

/** Pick the better of white/black text for a given background colour. */
export function readableOn(bg: string, preferred = '#ffffff'): string {
  if (!isHex(bg)) return preferred;
  return contrastRatio(preferred, bg) >= contrastRatio('#000000', bg) ? preferred : '#000000';
}

/** `#rrggbb` + alpha → `rgba(...)` (used for overlays, dividers and tints). */
export function withAlpha(hex: string, alpha: number): string {
  if (!isHex(hex)) return hex;
  const [r, g, b] = rgbOf(hex);
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`;
}

/** Push `fg` until it clears `min` contrast against every background it sits on. */
export function ensureContrastAll(fg: string, backgrounds: string[], min = 4.5): string {
  let out = fg;
  for (const bg of backgrounds) out = ensureContrast(out, bg, min);
  return out;
}

/** Background image / link URLs must be plain http(s) — no javascript:, data: or vbscript:. */
export function isSafeHttpUrl(value: string): boolean {
  if (!value.trim()) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

/* -------------------------------- templates ------------------------------ */

function partial(p: Partial<Appearance>): Appearance {
  return p as Appearance;
}

const baseBackground = {
  kind: 'solid' as BackgroundKind,
  color: '#f7f5f2',
  gradientFrom: '#ffffff',
  gradientTo: '#f0ece5',
  gradientAngle: 145,
  imageUrl: '',
};

const baseAvatar = { size: 96, shape: 'circle' as AvatarShape, align: 'center' as AvatarAlign };
const baseProducts = {
  layout: 'list' as ProductLayout,
  aspect: 'portrait' as ProductAspect,
  card: 'soft' as ProductCard,
  imageRadius: 12,
};

export const TEMPLATES: TemplateDef[] = [
  {
    key: 'minimal-luxe',
    label: 'Minimal Luxe',
    tagline: 'Ivory, elegant type, soft shadows',
    swatch: { bg: '#faf6ef', panel: '#ffffff', accent: '#8a6f3e', heading: '#201a12' },
    defaults: partial({
      template: 'minimal-luxe',
      background: { ...baseBackground, color: '#faf6ef', gradientFrom: '#fbf8f1', gradientTo: '#f2ebdd' },
      avatar: { ...baseAvatar, size: 96, shape: 'rounded' },
      typography: { font: 'serif', headingColor: '#201a12', bodyColor: '#5b5347', headingScale: 1 },
      button: { color: '#8a6f3e', textColor: '#ffffff', shape: 'rounded', border: 'none', shadow: 'soft', gap: 12 },
      products: { ...baseProducts, card: 'soft', aspect: 'square', imageRadius: 14 },
      section: { surface: '#ffffff', radius: 20, padding: 18, gap: 12 },
    }),
  },
  {
    key: 'midnight-pro',
    label: 'Midnight Pro',
    tagline: 'Dark canvas, bright buttons, premium cards',
    swatch: { bg: '#0b1120', panel: '#151f38', accent: '#38bdf8', heading: '#f8fafc' },
    defaults: partial({
      template: 'midnight-pro',
      background: {
        ...baseBackground,
        kind: 'gradient',
        color: '#0b1120',
        gradientFrom: '#0b1120',
        gradientTo: '#141d33',
        gradientAngle: 165,
      },
      avatar: { ...baseAvatar, size: 104, shape: 'circle' },
      typography: { font: 'sans', headingColor: '#f8fafc', bodyColor: '#b7c3da', headingScale: 1.05 },
      button: { color: '#38bdf8', textColor: '#06121f', shape: 'rounded', border: 'none', shadow: 'soft', gap: 12 },
      products: { ...baseProducts, card: 'outlined', aspect: 'square', imageRadius: 14 },
      section: { surface: '#151f38', radius: 18, padding: 18, gap: 14 },
    }),
  },
  {
    key: 'soft-pastel',
    label: 'Soft Pastel',
    tagline: 'Pastel gradient, rounded cards and buttons',
    swatch: { bg: '#fde7f3', panel: '#ffffff', accent: '#9b7ede', heading: '#3f3d56' },
    defaults: partial({
      template: 'soft-pastel',
      background: {
        ...baseBackground,
        kind: 'gradient',
        color: '#fdeef7',
        gradientFrom: '#fde7f3',
        gradientTo: '#e4efff',
        gradientAngle: 140,
      },
      avatar: { ...baseAvatar, size: 100, shape: 'circle' },
      typography: { font: 'rounded', headingColor: '#3f3d56', bodyColor: '#6c6a86', headingScale: 1.02 },
      button: { color: '#a78bfa', textColor: '#241b3a', shape: 'pill', border: 'none', shadow: 'soft', gap: 14 },
      products: { ...baseProducts, card: 'soft', aspect: 'square', imageRadius: 20 },
      section: { surface: '#ffffff', radius: 26, padding: 18, gap: 14 },
    }),
  },
  {
    key: 'editorial-fashion',
    label: 'Editorial Fashion',
    tagline: 'Big photography, editorial typography',
    swatch: { bg: '#efece5', panel: '#ffffff', accent: '#141414', heading: '#141414' },
    defaults: partial({
      template: 'editorial-fashion',
      background: { ...baseBackground, color: '#f1eee7', gradientFrom: '#f4f1ea', gradientTo: '#e7e3da' },
      avatar: { ...baseAvatar, size: 88, shape: 'square' },
      typography: { font: 'display', headingColor: '#141414', bodyColor: '#4c4c4c', headingScale: 1.12 },
      button: { color: '#141414', textColor: '#ffffff', shape: 'square', border: 'none', shadow: 'none', gap: 10 },
      products: { ...baseProducts, layout: 'grid', card: 'flat', aspect: 'portrait', imageRadius: 4 },
      section: { surface: '#ffffff', radius: 6, padding: 16, gap: 18 },
    }),
  },
  {
    key: 'vibrant-creator',
    label: 'Vibrant Creator',
    tagline: 'Bold colour, strong headings, standout links',
    swatch: { bg: '#ff5f6d', panel: '#ffffff', accent: '#111827', heading: '#1a1220' },
    defaults: partial({
      template: 'vibrant-creator',
      background: {
        ...baseBackground,
        kind: 'gradient',
        color: '#ff7a6b',
        gradientFrom: '#ff5f6d',
        gradientTo: '#ffc371',
        gradientAngle: 135,
      },
      avatar: { ...baseAvatar, size: 104, shape: 'circle' },
      typography: { font: 'sans', headingColor: '#1a1220', bodyColor: '#2f2436', headingScale: 1.12 },
      button: { color: '#111827', textColor: '#ffffff', shape: 'rounded', border: 'none', shadow: 'bold', gap: 14 },
      products: { ...baseProducts, layout: 'grid', card: 'outlined', aspect: 'portrait', imageRadius: 16 },
      section: { surface: '#ffffff', radius: 22, padding: 18, gap: 14 },
    }),
  },
  {
    key: 'indian-boutique',
    label: 'Indian Boutique',
    tagline: 'Burgundy, ivory and gold for Indian shops',
    swatch: { bg: '#fdf6e9', panel: '#fffaf1', accent: '#7d1430', heading: '#6b1027' },
    defaults: partial({
      template: 'indian-boutique',
      background: {
        ...baseBackground,
        kind: 'gradient',
        color: '#fdf6e9',
        gradientFrom: '#fdf9f0',
        gradientTo: '#f6e6cd',
        gradientAngle: 155,
      },
      avatar: { ...baseAvatar, size: 100, shape: 'rounded' },
      typography: { font: 'serif', headingColor: '#6b1027', bodyColor: '#5b4636', headingScale: 1.05 },
      button: { color: '#7d1430', textColor: '#f6dfa0', shape: 'rounded', border: 'thin', shadow: 'soft', gap: 14 },
      products: { ...baseProducts, card: 'outlined', aspect: 'portrait', imageRadius: 10 },
      section: { surface: '#fffaf1', radius: 14, padding: 18, gap: 14 },
    }),
  },
];

export function templateDef(key: unknown): TemplateDef {
  const found = TEMPLATES.find((t) => t.key === key);
  return found ?? TEMPLATES[0]!;
}

/** Which template an existing creator lands on when they have no saved design. */
export function templateForThemeKey(themeKey: ThemeKey | undefined): TemplateKey {
  switch (themeKey) {
    case 'midnight':
      return 'midnight-pro';
    case 'rose':
      return 'soft-pastel';
    case 'saffron':
      return 'indian-boutique';
    case 'indigo':
      return 'minimal-luxe';
    case 'emerald':
      return 'minimal-luxe';
    default:
      return 'minimal-luxe';
  }
}

/**
 * Reverse of templateForThemeKey(). The legacy theme row is still written on
 * save so older readers (and the accent fallback) stay coherent.
 */
const THEME_KEY_BY_TEMPLATE: Record<TemplateKey, ThemeKey> = {
  'minimal-luxe': 'indigo',
  'midnight-pro': 'midnight',
  'soft-pastel': 'rose',
  'editorial-fashion': 'emerald',
  'vibrant-creator': 'saffron',
  'indian-boutique': 'saffron',
};

export function themeKeyForTemplate(key: TemplateKey): ThemeKey {
  return THEME_KEY_BY_TEMPLATE[key] ?? 'indigo';
}

/* ----------------------------- normalisation ----------------------------- */

function enumOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

function numOf(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  return Number.isFinite(n) ? clamp(n, min, max) : fallback;
}

function colourOf(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (isHex(trimmed)) return trimmed;
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`;
  }
  return fallback;
}

const TEMPLATE_KEYS = TEMPLATES.map((t) => t.key) as readonly TemplateKey[];
const FONT_KEYS = Object.keys(FONT_STACKS) as readonly FontKey[];

export interface RawAppearance {
  template?: unknown;
  background?: Record<string, unknown>;
  avatar?: Record<string, unknown>;
  typography?: Record<string, unknown>;
  button?: Record<string, unknown>;
  products?: Record<string, unknown>;
  section?: Record<string, unknown>;
}

/**
 * Coerce whatever the server (or an old profile row) gives us into a complete,
 * valid Appearance. Unknown values fall back to the chosen template's defaults,
 * so creators with no saved design still get a sensible page.
 */
export function normalizeAppearance(
  raw: unknown,
  theme?: Pick<Theme, 'themeKey' | 'accent'> | null,
): Appearance {
  const source = (raw ?? {}) as RawAppearance;
  const template =
    typeof source.template === 'string' &&
    (TEMPLATE_KEYS as readonly string[]).includes(source.template)
      ? (source.template as TemplateKey)
      : undefined;
  const def = TEMPLATES.find((t) => t.key === template)
    ?? TEMPLATES.find((t) => t.key === templateForThemeKey(theme?.themeKey))
    ?? TEMPLATES[0]!;

  const d = def.defaults;
  const bg = (source.background ?? {}) as Record<string, unknown>;
  const av = (source.avatar ?? {}) as Record<string, unknown>;
  const ty = (source.typography ?? {}) as Record<string, unknown>;
  const bt = (source.button ?? {}) as Record<string, unknown>;
  const pr = (source.products ?? {}) as Record<string, unknown>;
  const sc = (source.section ?? {}) as Record<string, unknown>;

  // A creator with no saved design keeps the accent they already picked.
  const inheritedAccent =
    template || !theme?.accent || !isHex(theme.accent) ? null : theme.accent;

  const background: Appearance['background'] = {
    kind: enumOf(bg.kind, ['solid', 'gradient'] as const, d.background.kind),
    color: colourOf(bg.color, d.background.color),
    gradientFrom: colourOf(bg.gradientFrom, d.background.gradientFrom),
    gradientTo: colourOf(bg.gradientTo, d.background.gradientTo),
    gradientAngle: numOf(bg.gradientAngle, 0, 360, d.background.gradientAngle),
    imageUrl:
      typeof bg.imageUrl === 'string' && isSafeHttpUrl(bg.imageUrl)
        ? bg.imageUrl.trim()
        : d.background.imageUrl,
  };

  const buttonColor = colourOf(bt.color, inheritedAccent ?? d.button.color);

  return {
    template: def.key,
    background,
    avatar: {
      size: numOf(av.size, 64, 160, d.avatar.size),
      shape: enumOf(av.shape, ['circle', 'rounded', 'square'] as const, d.avatar.shape),
      align: enumOf(av.align, ['center', 'left'] as const, d.avatar.align),
    },
    typography: {
      font: enumOf(ty.font, FONT_KEYS, d.typography.font),
      headingColor: colourOf(ty.headingColor, d.typography.headingColor),
      bodyColor: colourOf(ty.bodyColor, d.typography.bodyColor),
      headingScale: numOf(ty.headingScale, 0.85, 1.35, d.typography.headingScale),
    },
    button: {
      color: buttonColor,
      textColor: colourOf(bt.textColor, d.button.textColor),
      shape: enumOf(bt.shape, ['pill', 'rounded', 'square'] as const, d.button.shape),
      border: enumOf(bt.border, ['none', 'thin', 'strong'] as const, d.button.border),
      shadow: enumOf(bt.shadow, ['none', 'soft', 'bold'] as const, d.button.shadow),
      gap: numOf(bt.gap, 6, 32, d.button.gap),
    },
    products: {
      layout: enumOf(pr.layout, ['list', 'grid'] as const, d.products.layout),
      aspect: enumOf(pr.aspect, ['square', 'portrait', 'landscape'] as const, d.products.aspect),
      card: enumOf(pr.card, ['soft', 'outlined', 'flat'] as const, d.products.card),
      imageRadius: numOf(pr.imageRadius, 0, 28, d.products.imageRadius),
    },
    section: {
      surface: typeof sc.surface === 'string' && (sc.surface === '' || isHex(sc.surface))
        ? sc.surface
        : d.section.surface,
      radius: numOf(sc.radius, 0, 32, d.section.radius),
      padding: numOf(sc.padding, 8, 32, d.section.padding),
      gap: numOf(sc.gap, 6, 32, d.section.gap),
    },
  };
}

/** The gallery thumbnail picks up the current accent so it matches what you see. */
export function templateDefaults(key: TemplateKey): Appearance {
  return normalizeAppearance({ template: key });
}
