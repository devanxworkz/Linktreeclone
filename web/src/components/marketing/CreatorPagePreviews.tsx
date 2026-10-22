import { Link } from 'react-router-dom';

export function CreatorPagePreviews() {
  const pages = [
    {
      name: 'Meera Sarees',
      handle: 'meera-sarees',
      tagline: 'Handloom sarees · Bengaluru',
      from: '#c2410c',
      to: '#f59e0b',
      links: ['Shop the collection', 'New arrivals', 'Instagram', 'WhatsApp'],
      product: 'Kanjeevaram silk',
      price: '₹8,400',
    },
    {
      name: 'Glow by Ananya',
      handle: 'glowbyananya',
      tagline: 'Clean skincare · Mumbai',
      from: '#be185d',
      to: '#fb7185',
      links: ['Shop skincare', 'Read the blog', 'Instagram'],
      product: 'Vitamin C serum',
      price: '₹899',
    },
    {
      name: 'Kitchen Katha',
      handle: 'kitchen-katha',
      tagline: 'Home chef · Kochi',
      from: '#15803d',
      to: '#4ade80',
      links: ["Today's menu", 'Order on WhatsApp', 'YouTube'],
      product: 'Weekend tiffin',
      price: '₹320',
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {pages.map((p) => (
        <div
          key={p.handle}
          className="group relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br shadow-pop transition hover:-translate-y-1"
          style={{ backgroundImage: `linear-gradient(135deg, ${p.from}, ${p.to})` }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.25),transparent_70%)]" />
          <div className="relative p-6 text-white">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-lg font-bold backdrop-blur">
                {p.name[0]}
              </span>
              <div>
                <p className="text-lg font-bold">{p.name}</p>
                <p className="text-sm text-white/80">{p.tagline}</p>
              </div>
            </div>
            <div className="mt-5 space-y-2">
              {p.links.map((l) => (
                <div
                  key={l}
                  className="flex items-center justify-between rounded-xl bg-white/95 px-4 py-2.5 text-sm font-semibold text-text shadow-card"
                >
                  <span>{l}</span>
                  <span className="text-text-muted">→</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between rounded-xl bg-white/95 px-4 py-3 text-text shadow-card">
              <div>
                <p className="text-sm font-semibold">{p.product}</p>
                <p className="mt-0.5 text-base font-bold text-accent">{p.price}</p>
              </div>
              <span className="inline-flex items-center rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-on-accent">
                Buy now
              </span>
            </div>
            <div className="mt-5 flex items-center justify-between">
              <Link to={`/u/${p.handle}`} className="text-sm font-semibold text-white hover:underline">
                View page
              </Link>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
                Live preview
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}