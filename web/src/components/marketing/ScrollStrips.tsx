import type { ReactNode } from 'react';

export function Marquee({
  children,
  reverse = false,
  className = '',
  speed = 'normal',
}: {
  children: ReactNode;
  reverse?: boolean;
  className?: string;
  speed?: 'slow' | 'normal' | 'fast';
}) {
  const duration = speed === 'fast' ? '28s' : speed === 'slow' ? '48s' : reverse ? '42s' : '38s';
  const trackClass = reverse ? 'marquee-track-reverse' : 'marquee-track';

  return (
    <div className={`marquee ${className}`}>
      <div className={trackClass} style={{ animationDuration: duration }}>
        <div className="flex items-center gap-4">
          {children}
        </div>
        <div className="flex items-center gap-4" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}

export function CreatorMarquee() {
  const items = [
    { src: '/assets/creators/creator-1.jpg', alt: 'Indian fashion creator portrait' },
    { src: '/assets/creators/creator-2.jpg', alt: 'Lifestyle creator portrait' },
    { src: '/assets/creators/creator-3.jpg', alt: 'Fashion creator on Instagram style' },
    { src: '/assets/creators/creator-4.jpg', alt: 'Content creator portrait' },
    { src: '/assets/creators/creator-1.jpg', alt: 'Indian fashion creator portrait' },
    { src: '/assets/creators/creator-2.jpg', alt: 'Lifestyle creator portrait' },
    { src: '/assets/creators/creator-3.jpg', alt: 'Fashion creator on Instagram style' },
    { src: '/assets/creators/creator-4.jpg', alt: 'Content creator portrait' },
  ];

  return (
    <Marquee className="py-8">
      {items.map((item, idx) => (
        <div
          key={`${item.src}-${idx}`}
          className="marquee-item relative h-56 w-44 overflow-hidden rounded-3xl shadow-card sm:h-72 sm:w-56"
        >
          <img
            src={item.src}
            alt={item.alt}
            loading="lazy"
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      ))}
    </Marquee>
  );
}

export function ProductMarquee() {
  const items = [
    { src: '/assets/products/prod-1.jpg', alt: 'Digital product cover' },
    { src: '/assets/products/prod-2.jpg', alt: 'Digital planner template' },
    { src: '/assets/products/prod-3.jpg', alt: 'Creator product mockup' },
    { src: '/assets/products/prod-1.jpg', alt: 'Digital product cover' },
    { src: '/assets/products/prod-2.jpg', alt: 'Digital planner template' },
    { src: '/assets/products/prod-3.jpg', alt: 'Creator product mockup' },
  ];

  return (
    <Marquee reverse className="py-6" speed="slow">
      {items.map((item, idx) => (
        <div
          key={`${item.src}-${idx}`}
          className="marquee-item relative h-40 w-72 overflow-hidden rounded-2xl shadow-card sm:h-48 sm:w-80"
        >
          <img
            src={item.src}
            alt={item.alt}
            loading="lazy"
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      ))}
    </Marquee>
  );
}

export function BrandStrip() {
  const items = ['Instagram', 'YouTube', 'WhatsApp', 'UPI', 'Link-in-bio', 'Creator Store', 'Digital Products'];
  return (
    <Marquee className="py-4" speed="fast">
      {[...items, ...items].map((item, idx) => (
        <span
          key={`${item}-${idx}`}
          className="marquee-item inline-flex items-center rounded-full border border-white/30 bg-white/10 px-5 py-2 text-sm font-semibold text-white/90 backdrop-blur"
        >
          {item}
        </span>
      ))}
    </Marquee>
  );
}