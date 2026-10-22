import { ArtPanel, type MotifKey } from './art';
import { Reveal } from './Reveal';
import { IconInstagram, IconWhatsapp, IconCheck } from '../icons';

interface Category {
  label: string;
  name: string;
  handle: string;
  tagline: string;
  motif: MotifKey;
  from: string;
  to: string;
  product: string;
  price: string;
}

const CATEGORIES: Category[] = [
  {
    label: 'Sarees & fashion',
    name: 'Meera Sarees',
    handle: 'meera-sarees',
    tagline: 'Handloom sarees straight from weavers in Bengaluru.',
    motif: 'saree',
    from: '#7c2d12',
    to: '#c2410c',
    product: 'Kanjeevaram silk',
    price: 'Rs 8,400',
  },
  {
    label: 'Beauty & skincare',
    name: 'Glow by Ananya',
    handle: 'glowbyananya',
    tagline: 'Small-batch clean skincare, made in Mumbai.',
    motif: 'beauty',
    from: '#831843',
    to: '#db2777',
    product: 'Vitamin C serum',
    price: 'Rs 899',
  },
  {
    label: 'Jewellery & handmade',
    name: 'Tara Handmade',
    handle: 'tara-handmade',
    tagline: 'Silver and resin pieces, each one unique.',
    motif: 'jewellery',
    from: '#78350f',
    to: '#d97706',
    product: 'Resin pendant set',
    price: 'Rs 1,450',
  },
  {
    label: 'Food & lifestyle',
    name: 'Kitchen Katha',
    handle: 'kitchen-katha',
    tagline: 'Home chef sharing recipes and tiffin boxes.',
    motif: 'food',
    from: '#166534',
    to: '#16a34a',
    product: 'Weekend tiffin',
    price: 'Rs 320',
  },
  {
    label: 'Digital products & creator resources',
    name: 'Creator Shelf',
    handle: 'creator-shelf',
    tagline: 'Notion systems, presets and guides for creators.',
    motif: 'digital',
    from: '#312e81',
    to: '#4f46e5',
    product: 'Content OS template',
    price: 'Rs 749',
  },
];

function CategoryMeta({ c, tone = 'light' }: { c: Category; tone?: 'light' | 'dark' }) {
  const muted = tone === 'light' ? 'text-text-muted' : 'text-white/75';
  const title = tone === 'light' ? 'text-text' : 'text-white';
  return (
    <div className="flex items-center gap-3">
      <span
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-extrabold text-white"
        style={{ background: `linear-gradient(140deg, ${c.from}, ${c.to})` }}
        aria-hidden="true"
      >
        {c.name.charAt(0)}
      </span>
      <div className="min-w-0">
        <p className={`truncate text-sm font-bold ${title}`}>{c.name}</p>
        <p className={`truncate text-xs ${muted}`}>/u/{c.handle}</p>
      </div>
    </div>
  );
}

function MiniProduct({ c }: { c: Category }) {
  return (
    <div className="w-40 overflow-hidden rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm">
      <ArtPanel motif={c.motif} from={c.from} to={c.to} className="h-20 w-full rounded-none" motifClassName="h-8 w-8 text-white/75" />
      <div className="p-2.5">
        <p className="truncate text-xs font-bold text-white">{c.product}</p>
        <p className="text-xs font-extrabold text-white/90">{c.price}</p>
      </div>
    </div>
  );
}

export function CreatorShowcase() {
  const [saree, beauty, jewellery, food, digital] = CATEGORIES;

  return (
    <div className="space-y-16 lg:space-y-24">
      <Reveal variant="right" className="lg:grid lg:grid-cols-12 lg:items-center lg:gap-12">
        <div className="lg:col-span-7">
          <ArtPanel
            motif={saree!.motif}
            from="#3f1d0f"
            to="#b45309"
            angle={120}
            className="aspect-[5/4] w-full overflow-hidden rounded-2xl shadow-pop"
            motifClassName="h-40 w-40 text-white/25"
          >
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
              <div className="rounded-xl bg-black/25 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Storefront</p>
                <p className="text-lg font-extrabold text-white">{saree!.name}</p>
              </div>
              <MiniProduct c={saree!} />
            </div>
          </ArtPanel>
        </div>
        <div className="mt-6 lg:col-span-5 lg:mt-0">
          <span className="eyebrow">{saree!.label}</span>
          <h3 className="mt-4 text-2xl font-extrabold sm:text-3xl">A boutique that sells on Instagram and WhatsApp.</h3>
          <p className="mt-3 text-base text-text-muted">
            List the collection, show each price in rupees, and let buyers order over WhatsApp or pay by UPI. No website to build.
          </p>
          <div className="mt-5">
            <CategoryMeta c={saree!} />
          </div>
        </div>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-2">
        {[beauty, jewellery].map((c, i) => (
          <Reveal key={c!.handle} variant={i === 0 ? 'up' : 'scale'} delay={i * 90} className="h-full">
            <article className="lift group h-full overflow-hidden rounded-2xl border border-border bg-elevated shadow-card">
              <ArtPanel
                motif={c!.motif}
                from={c!.from}
                to={c!.to}
                className="aspect-[16/10] w-full overflow-hidden"
                motifClassName="h-28 w-28 text-white/25"
              >
                <span className="art-panel-label absolute right-4 top-4 rounded-full bg-black/25 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  {c!.label}
                </span>
              </ArtPanel>
              <div className="p-5">
                <h3 className="text-lg font-bold">{c!.name}</h3>
                <p className="mt-1 text-sm text-text-muted">{c!.tagline}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                  <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1">
                    <IconInstagram /> Instagram
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1">
                    <IconWhatsapp /> WhatsApp
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 font-semibold text-accent">
                    {c!.product} · {c!.price}
                  </span>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal variant="left" className="lg:grid lg:grid-cols-12 lg:items-center lg:gap-12">
        <div className="lg:order-2 lg:col-span-7">
          <ArtPanel
            motif={food!.motif}
            from="#14532d"
            to="#22c55e"
            angle={210}
            className="aspect-[5/4] w-full overflow-hidden rounded-2xl shadow-pop"
            motifClassName="h-40 w-40 text-white/20"
          >
            <div className="absolute bottom-4 left-4 rounded-xl bg-black/25 px-4 py-3 backdrop-blur-sm">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-white/80">
                <IconCheck /> Order confirmed on WhatsApp
              </p>
              <p className="mt-1 text-lg font-extrabold text-white">{food!.name}</p>
            </div>
          </ArtPanel>
        </div>
        <div className="mt-6 lg:order-1 lg:col-span-5 lg:mt-0">
          <span className="eyebrow">{food!.label}</span>
          <h3 className="mt-4 text-2xl font-extrabold sm:text-3xl">Turn followers into regulars.</h3>
          <p className="mt-3 text-base text-text-muted">
            Share your menu, take orders on WhatsApp, and collect UPI payments directly. Your customers stay in the apps they already use.
          </p>
          <div className="mt-5">
            <CategoryMeta c={food!} />
          </div>
        </div>
      </Reveal>

      <Reveal variant="up">
        <article className="overflow-hidden rounded-2xl border border-border bg-elevated shadow-card lg:grid lg:grid-cols-2 lg:items-center">
          <div className="p-7 sm:p-10">
            <span className="eyebrow">{digital!.label}</span>
            <h3 className="mt-4 text-2xl font-extrabold sm:text-3xl">Sell digital products while you sleep.</h3>
            <p className="mt-3 text-base text-text-muted">
              Templates, presets, e-books and courses. Show a clean product card with a price, then send buyers to checkout or a download link.
            </p>
            <div className="mt-5">
              <CategoryMeta c={digital!} />
            </div>
          </div>
          <ArtPanel
            motif={digital!.motif}
            from="#1e1b4b"
            to="#6366f1"
            angle={135}
            className="aspect-[16/11] w-full overflow-hidden lg:aspect-auto lg:h-full"
            motifClassName="h-32 w-32 text-white/25"
          >
            <div className="absolute inset-x-6 bottom-6 rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
              <div className="mb-2 flex gap-1.5" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-white/50" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
              </div>
              <p className="text-xs font-bold text-white">Content OS — Notion template</p>
              <p className="text-xs font-extrabold text-white/90">Rs 749 · Instant download</p>
            </div>
          </ArtPanel>
        </article>
      </Reveal>
    </div>
  );
}
