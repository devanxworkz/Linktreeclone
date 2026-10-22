import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { Reveal } from './Reveal';
import { subscribeScroll } from '../../lib/motion';

export interface GalleryItem {
  id: string;
  title: string;
  subtitle: string;
  node: ReactNode;
}

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      {dir === 'left' ? <path d="m15 6-6 6 6 6" /> : <path d="m9 6 6 6-6 6" />}
    </svg>
  );
}

export function StorefrontGallery({ items }: { items: GalleryItem[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft >= max - 4);
  }, []);

  useEffect(() => {
    updateEdges();
    const unsubscribe = subscribeScroll(updateEdges);
    const el = trackRef.current;
    el?.addEventListener('scroll', updateEdges, { passive: true });
    window.addEventListener('resize', updateEdges, { passive: true });
    return () => {
      unsubscribe();
      el?.removeEventListener('scroll', updateEdges);
      window.removeEventListener('resize', updateEdges);
    };
  }, [updateEdges, items.length]);

  const scrollByCard = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-gallery-card]');
    const amount = card ? card.offsetWidth + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  const drag = useRef<{ active: boolean; startX: number; startLeft: number; moved: boolean }>({
    active: false,
    startX: 0,
    startLeft: 0,
    moved: false,
  });

  const onPointerDown = (e: PointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== 'mouse') return;
    const el = trackRef.current;
    if (!el) return;
    drag.current = { active: true, startX: e.clientX, startLeft: el.scrollLeft, moved: false };
  };

  const onPointerMove = (e: PointerEvent<HTMLUListElement>) => {
    const el = trackRef.current;
    if (!el || !drag.current.active) return;
    const delta = e.clientX - drag.current.startX;
    if (Math.abs(delta) > 3) {
      drag.current.moved = true;
      el.classList.add('is-dragging');
    }
    el.scrollLeft = drag.current.startLeft - delta;
  };

  const endDrag = () => {
    drag.current.active = false;
    trackRef.current?.classList.remove('is-dragging');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollByCard(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollByCard(-1);
    }
  };

  return (
    <div className="relative">
      <div className="mb-4 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          disabled={atStart}
          aria-label="Previous storefronts"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-elevated text-text shadow-card transition hover:-translate-y-0.5 hover:text-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
        >
          <Chevron dir="left" />
        </button>
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          disabled={atEnd}
          aria-label="Next storefronts"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-elevated text-text shadow-card transition hover:-translate-y-0.5 hover:text-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
        >
          <Chevron dir="right" />
        </button>
      </div>

      <div className="gallery-perspective">
        <ul
          ref={trackRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          aria-label="Storefront template gallery"
          className="gallery-track hide-scrollbar"
        >
          {items.map((item, i) => (
            <li key={item.id} data-gallery-card className="gallery-card">
              <Reveal variant={i % 2 === 0 ? 'scale' : 'fade'} delay={(i % 3) * 70} once>
                <div className="flex flex-col items-center gap-3">
                  <div className="gallery-node">{item.node}</div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-text">{item.title}</p>
                    <p className="text-xs text-text-muted">{item.subtitle}</p>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
