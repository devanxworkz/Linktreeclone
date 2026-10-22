import type { CSSProperties, ReactNode } from 'react';
import { useInView } from '../../lib/motion';

const VARIANTS = {
  up: 'reveal-up',
  down: 'reveal-down',
  left: 'reveal-left',
  right: 'reveal-right',
  scale: 'reveal-scale',
  fade: 'reveal-fade',
  blur: 'reveal-blur',
} as const;

export type RevealVariant = keyof typeof VARIANTS;

interface RevealProps {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  threshold?: number;
}

export function Reveal({
  children,
  variant = 'up',
  delay = 0,
  duration,
  className = '',
  once = true,
  threshold,
}: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ once, threshold });
  const style: CSSProperties = {};
  if (delay) style.transitionDelay = `${delay}ms`;
  if (duration) style.transitionDuration = `${duration}ms`;

  return (
    <div
      ref={ref}
      className={`reveal ${VARIANTS[variant]} ${inView ? 'is-in' : ''} ${className}`.trim()}
      style={style}
    >
      {children}
    </div>
  );
}
