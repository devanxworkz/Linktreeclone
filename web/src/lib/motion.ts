import { useEffect, useRef, useState, type RefObject } from 'react';

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

type ScrollFn = () => void;

const scrollListeners = new Set<ScrollFn>();
let ticking = false;
let attached = false;

function flush(): void {
  ticking = false;
  scrollListeners.forEach((fn) => fn());
}

function requestFlush(): void {
  if (ticking) return;
  ticking = true;
  if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
    window.requestAnimationFrame(flush);
  } else {
    flush();
  }
}

function attach(): void {
  if (attached || typeof window === 'undefined') return;
  attached = true;
  window.addEventListener('scroll', requestFlush, { passive: true });
  window.addEventListener('resize', requestFlush, { passive: true });
}

export function subscribeScroll(fn: ScrollFn): () => void {
  scrollListeners.add(fn);
  attach();
  return () => {
    scrollListeners.delete(fn);
  };
}

export interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export function useInView<T extends HTMLElement>(options: UseInViewOptions = {}): {
  ref: RefObject<T>;
  inView: boolean;
} {
  const { threshold = 0.15, rootMargin = '0px 0px -8% 0px', once = true } = options;
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(
    () => prefersReducedMotion() || typeof IntersectionObserver === 'undefined',
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setInView(false);
          }
        });
      },
      { threshold, rootMargin },
    );
    observer.observe(el);
    const safety = window.setTimeout(() => setInView(true), 1500);
    return () => {
      observer.disconnect();
      window.clearTimeout(safety);
    };
  }, [threshold, rootMargin, once]);

  return { ref, inView };
}

export function useParallax<T extends HTMLElement>(strength = 0.12, max = 70): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let top = 0;
    let height = 0;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      top = rect.top + window.scrollY;
      height = rect.height;
    };

    const update = () => {
      const viewport = window.innerHeight || 1;
      const progress = (window.scrollY + viewport - top) / (height + viewport);
      const centered = Math.max(-1, Math.min(1, (progress - 0.5) * 2));
      const offset = -centered * max * (strength / 0.12);
      el.style.setProperty('--parallax', `${offset.toFixed(2)}px`);
    };

    measure();
    update();

    const unsubscribe = subscribeScroll(update);
    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            measure();
            update();
          })
        : null;
    resizeObserver?.observe(el);
    window.addEventListener('resize', measure, { passive: true });

    return () => {
      unsubscribe();
      resizeObserver?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [strength, max]);

  return ref;
}
