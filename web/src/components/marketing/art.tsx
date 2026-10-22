import type { CSSProperties, ReactNode } from 'react';

export type MotifKey =
  | 'saree'
  | 'beauty'
  | 'jewellery'
  | 'food'
  | 'digital'
  | 'print'
  | 'coffee'
  | 'music'
  | 'art';

function Shape({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-full w-full"
    >
      {children}
    </svg>
  );
}

export function Motif({ name }: { name: MotifKey }) {
  switch (name) {
    case 'saree':
      return (
        <Shape>
          <path d="M14 10c6 6 6 14 0 20s-6 14 0 20" />
          <path d="M26 10c7 7 7 15 0 22s-7 15 0 22" />
          <path d="M40 12c5 6 5 13 0 19s-5 13 0 21" />
          <path d="M50 14c3 5 3 11 0 16" />
          <circle cx="50" cy="46" r="3" />
        </Shape>
      );
    case 'beauty':
      return (
        <Shape>
          <rect x="24" y="22" width="16" height="30" rx="5" />
          <path d="M28 22v-6h8v6" />
          <path d="M32 10v4" />
          <path d="M27 34h10" />
          <path d="M21 44c-2 3-2 7 1 9" />
        </Shape>
      );
    case 'jewellery':
      return (
        <Shape>
          <path d="M16 14c0 12 7 20 16 20s16-8 16-20" />
          <circle cx="20" cy="16" r="2" />
          <circle cx="32" cy="20" r="2" />
          <circle cx="44" cy="16" r="2" />
          <path d="M32 34v6" />
          <path d="M32 46l4-6h-8l4 6Z" />
        </Shape>
      );
    case 'food':
      return (
        <Shape>
          <path d="M12 34h40c0 10-9 16-20 16s-20-6-20-16Z" />
          <path d="M20 34c0-6 5-10 12-10s12 4 12 10" />
          <path d="M26 12c-2 3-2 6 0 9" />
          <path d="M34 10c-2 3-2 7 0 10" />
        </Shape>
      );
    case 'digital':
      return (
        <Shape>
          <rect x="12" y="14" width="40" height="30" rx="4" />
          <path d="M12 22h40" />
          <circle cx="17" cy="18" r="1" fill="currentColor" />
          <path d="M20 40l6-8 5 6 4-5 6 7" />
          <path d="M48 50l2-4 2 4 4 2-4 2-2 4-2-4-4-2 4-2Z" />
        </Shape>
      );
    case 'print':
      return (
        <Shape>
          <rect x="12" y="12" width="40" height="40" rx="4" />
          <circle cx="24" cy="24" r="4" />
          <path d="M14 44l12-14 9 10 6-6 9 10" />
        </Shape>
      );
    case 'coffee':
      return (
        <Shape>
          <path d="M16 22h26v14a8 8 0 0 1-8 8h-10a8 8 0 0 1-8-8V22Z" />
          <path d="M42 26h4a5 5 0 0 1 0 10h-4" />
          <path d="M22 14c-2 2-2 5 0 7" />
          <path d="M30 12c-2 2-2 5 0 7" />
          <path d="M16 50h30" />
        </Shape>
      );
    case 'music':
      return (
        <Shape>
          <path d="M24 44V18l22-5v26" />
          <circle cx="19" cy="45" r="5" />
          <circle cx="41" cy="40" r="5" />
        </Shape>
      );
    case 'art':
    default:
      return (
        <Shape>
          <path d="M32 12a20 20 0 1 0 0 40h3a6 6 0 0 0 0-12h-3a4 4 0 0 1 0-8h9a8 8 0 0 0 8-8 20 20 0 0 0-17-12Z" />
          <circle cx="24" cy="26" r="2" />
          <circle cx="24" cy="38" r="2" />
        </Shape>
      );
  }
}

export interface ArtPanelProps {
  motif: MotifKey;
  from: string;
  to: string;
  angle?: number;
  label?: string;
  className?: string;
  children?: ReactNode;
  motifClassName?: string;
}

export function ArtPanel({
  motif,
  from,
  to,
  angle = 135,
  label,
  className = '',
  children,
  motifClassName = '',
}: ArtPanelProps) {
  const style: CSSProperties = { background: `linear-gradient(${angle}deg, ${from}, ${to})` };
  return (
    <div className={`art-panel grain ${className}`} style={style}>
      <span aria-hidden="true" className={`art-panel-motif ${motifClassName}`}>
        <Motif name={motif} />
      </span>
      {label && (
        <span className="art-panel-label absolute left-4 top-4 z-10 rounded-full bg-black/25 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {label}
        </span>
      )}
      {children}
    </div>
  );
}

export interface TemplatePreset {
  page: string;
  ink: string;
  muted: string;
  accent: string;
  buttonBg: string;
  buttonInk: string;
  radius: number;
  surface: string;
  surfaceInk: string;
  ring: string;
}

export const TEMPLATES: Record<string, TemplatePreset> = {
  saffron: {
    page: 'linear-gradient(180deg,#fff8f1 0%,#ffe9d5 100%)',
    ink: '#3a2416',
    muted: '#8a6a4f',
    accent: '#c2410c',
    buttonBg: '#c2410c',
    buttonInk: '#ffffff',
    radius: 14,
    surface: '#ffffff',
    surfaceInk: '#3a2416',
    ring: 'rgba(194,65,12,0.18)',
  },
  midnight: {
    page: 'linear-gradient(180deg,#171c2e 0%,#0b0e18 100%)',
    ink: '#f2f5ff',
    muted: '#9aa4c6',
    accent: '#93a4ff',
    buttonBg: '#232a44',
    buttonInk: '#eef1ff',
    radius: 16,
    surface: 'rgba(255,255,255,0.07)',
    surfaceInk: '#eef1ff',
    ring: 'rgba(147,164,255,0.25)',
  },
  rose: {
    page: 'linear-gradient(180deg,#fff5f7 0%,#ffe1e8 100%)',
    ink: '#4a1f2b',
    muted: '#9c6474',
    accent: '#be185d',
    buttonBg: '#be185d',
    buttonInk: '#ffffff',
    radius: 999,
    surface: '#ffffff',
    surfaceInk: '#4a1f2b',
    ring: 'rgba(190,24,93,0.18)',
  },
  emerald: {
    page: 'linear-gradient(180deg,#f2fbf5 0%,#d7f2e2 100%)',
    ink: '#133a26',
    muted: '#5c8a70',
    accent: '#15803d',
    buttonBg: '#15803d',
    buttonInk: '#ffffff',
    radius: 14,
    surface: '#ffffff',
    surfaceInk: '#133a26',
    ring: 'rgba(21,128,61,0.18)',
  },
  indigo: {
    page: 'linear-gradient(180deg,#f4f5ff 0%,#e2e5ff 100%)',
    ink: '#232a56',
    muted: '#6f76a8',
    accent: '#4338ca',
    buttonBg: '#4338ca',
    buttonInk: '#ffffff',
    radius: 18,
    surface: '#ffffff',
    surfaceInk: '#232a56',
    ring: 'rgba(67,56,202,0.2)',
  },
  sand: {
    page: 'linear-gradient(180deg,#fbf8f3 0%,#efe6d6 100%)',
    ink: '#3b3324',
    muted: '#857a63',
    accent: '#9a6b1f',
    buttonBg: '#1f1b14',
    buttonInk: '#f7f1e6',
    radius: 8,
    surface: '#ffffff',
    surfaceInk: '#3b3324',
    ring: 'rgba(31,27,20,0.16)',
  },
};

export type TemplateKey = keyof typeof TEMPLATES;
