import type { Layout, ThemeKey } from './types';

export interface ThemePreset {
  key: ThemeKey;
  label: string;
  accent: string;
  soft: string;
  on: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  { key: 'saffron', label: 'Saffron', accent: '#c2410c', soft: '#fff1e7', on: '#ffffff' },
  { key: 'indigo', label: 'Indigo', accent: '#4f46e5', soft: '#eef2ff', on: '#ffffff' },
  { key: 'emerald', label: 'Emerald', accent: '#15803d', soft: '#ecfdf5', on: '#ffffff' },
  { key: 'midnight', label: 'Midnight', accent: '#1e293b', soft: '#e2e8f0', on: '#ffffff' },
  { key: 'rose', label: 'Rose', accent: '#be123c', soft: '#fff1f2', on: '#ffffff' },
];

export const LAYOUT_LABELS: Record<Layout, string> = {
  classic: 'Classic — centred stack',
  grid: 'Grid — two columns',
  feature: 'Feature — large header',
};

export function presetFor(key: ThemeKey): ThemePreset {
  return THEME_PRESETS.find((t) => t.key === key) ?? THEME_PRESETS[0]!;
}
