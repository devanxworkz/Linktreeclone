import { Link } from 'react-router-dom';
import { Reveal } from '../../components/marketing/Reveal';
import { CreatorMarquee, ProductMarquee, BrandStrip } from '../../components/marketing/ScrollStrips';
import { CreatorPagePreviews } from '../../components/marketing/CreatorPagePreviews';
import { DigitalProductShowcase } from '../../components/marketing/DigitalProductShowcase';
import { FAQ } from '../../components/marketing/FAQ';
import { useParallax } from '../../lib/motion';
import {
  IconChart,
  IconCheck,
  IconExternal,
  IconPalette,
  IconWhatsapp,
} from '../../components/icons';

const SAMPLES = [
  { name: 'Aarti', handle: 'aarti', tagline: 'Food creator · Bengaluru', color: '#c2410c' },
  { name: 'Cafe Mocha', handle: 'cafe-mocha', tagline: 'Café · Pune', color: '#15803d' },
  { name: 'DevStudio', handle: 'devstudio', tagline: 'Freelance web dev · remote', color: '#4f46e5' },
];

export default function Landing() {
  const heroParallax = useParallax<HTMLDivElement>(0.14, 60);

  return (
    <div className="motion-root overflow-x-hidden">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fff7f2] via-[#fff] to-[#fff]">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-gradient-to-br from-[#ff6b3e]/30 to-[#ff3cac]/20 blur-3xl" aria-hidden="true" />
        <div className="absolute -right-24 top-20 h-80 w-80 rounded-full bg-gradient-to-br from-[#7c3aed]/25 to-[#22d3ee]/20 blur-3xl" aria-hidden="true" />
        <div className="absolute left-1/3 bottom-0 h-64 w-64 rounded-full bg-gradient-to-br from-[#22c55e]/20 to-[#f59e0b]/15 blur-3xl" aria-hidden="true" />

        <div className="container-page relative grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <Reveal variant="fade">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#ff6b3e]/40 bg-gradient-to-r from-[#ff6b3e]/10 to-[#ff3cac]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#c2410c]">
                <IconPalette /> Built in India, for Indian creators
              </span>
            </Reveal>
            <Reveal variant="up" delay={70}>
              <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
                <span className="sr-only">One link for everything you create.</span>
                <span aria-hidden="true">
                  Turn your Instagram into a{' '}
                  <span className="bg-gradient-to-r from-[#ff3cac] via-[#784ba0] to-[#2b86c5] bg-clip-text text-transparent">
                    colorful creator store
                  </span>
                </span>
              </h1>
            </Reveal>
            <Reveal variant="up" delay={150}>
              <p className="mt-6 max-w-xl text-lg text-text-muted sm:text-xl">
                Pehchaan gives Instagram creators, fashion sellers, home chefs, and digital makers a beautiful home for links, products, WhatsApp orders, and UPI payments.
              </p>
            </Reveal>
            <Reveal variant="up" delay={230}>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  to="/register"
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff3cac] to-[#784ba0] px-8 py-4 text-base font-bold text-white shadow-pop transition hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(124,58,237,0.9)]"
                >
                  <span>Create your page — free</span>
                </Link>
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-8 py-4 text-base font-semibold text-text shadow-card transition hover:-translate-y-1 hover:bg-white"
                >
                  See pricing
                </Link>
              </div>
            </Reveal>
            <Reveal variant="up" delay={310}>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-text-muted">
                {['Free forever plan', 'No app to install', 'Your own /u/ page'].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <IconCheck />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <div className="relative">
            <div ref={heroParallax} className="parallax pointer-events-none absolute inset-0" aria-hidden="true">
              <span className="absolute -left-10 top-6 h-56 w-56 rounded-full bg-gradient-to-br from-[#ff6b3e]/40 to-[#ff3cac]/30 blur-3xl" />
              <span className="absolute -right-8 bottom-0 h-64 w-64 rounded-full bg-gradient-to-br from-[#22d3ee]/35 to-[#7c3aed]/25 blur-3xl" />
              <span className="absolute left-1/4 top-1/2 h-44 w-44 rounded-full bg-gradient-to-br from-[#22c55e]/25 to-[#f59e0b]/20 blur-3xl" />
            </div>

            <div className="relative z-10 grid grid-cols-12 gap-4">
              <div className="col-span-7 float-med">
                <div className="relative overflow-hidden rounded-[2rem] shadow-pop">
                  <img
                    src="/assets/creators/creator-1.jpg"
                    alt="Indian fashion creator posing with sarees"
                    className="h-[420px] w-full object-cover sm:h-[520px]"
                    loading="eager"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6 text-white">
                    <p className="text-lg font-bold">Meera Sarees</p>
                    <p className="text-sm text-white/80">Handloom · Bengaluru</p>
                  </div>
                </div>
              </div>
              <div className="col-span-5 space-y-4">
                <div className="float-slow overflow-hidden rounded-[1.75rem] shadow-pop">
                  <img
                    src="/assets/creators/creator-2.jpg"
                    alt="Lifestyle creator portrait"
                    className="h-[200px] w-full object-cover sm:h-[250px]"
                    loading="lazy"
                  />
                </div>
                <div className="float-med overflow-hidden rounded-[1.75rem] shadow-pop">
                  <img
                    src="/assets/creators/creator-3.jpg"
                    alt="Fashion creator content"
                    className="h-[180px] w-full object-cover sm:h-[230px]"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="col-span-12 float-fast">
                <div className="relative overflow-hidden rounded-[2rem] shadow-pop">
                  <img
                    src="/assets/products/prod-1.jpg"
                    alt="Digital product cover for creator template"
                    className="h-[200px] w-full object-cover sm:h-[240px]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-center justify-between px-6">
                    <div className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-text shadow-card backdrop-blur">
                      Digital Products · Templates · Presets
                    </div>
                    <div className="rounded-full bg-gradient-to-r from-[#ff3cac] to-[#784ba0] px-4 py-2 text-sm font-semibold text-white shadow-card">
                      Sell in minutes
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="animate-floaty absolute -right-4 top-10 z-20 hidden lg:block" aria-hidden="true">
              <div className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/90 px-4 py-3 shadow-pop backdrop-blur">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366]">
                  <IconWhatsapp />
                </span>
                <div>
                  <p className="text-xs font-bold text-text">New order on WhatsApp</p>
                  <p className="text-[11px] text-text-muted">Kanjeevaram silk · ₹8,400</p>
                </div>
              </div>
            </div>

            <div className="animate-floaty-slow absolute -left-6 bottom-12 z-20 hidden lg:block" aria-hidden="true">
              <div className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/90 px-4 py-3 shadow-pop backdrop-blur">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#ff3cac]/20 to-[#784ba0]/20 text-[#7c3aed]">
                  <IconChart />
                </span>
                <div>
                  <p className="text-xs font-bold text-text">+1,840 clicks</p>
                  <p className="text-[11px] text-text-muted">this week</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#1f1147] via-[#2b0f3a] to-[#120b2e] py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,60,172,0.25),transparent_60%)]" />
        <div className="relative">
          <div className="container-page mb-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Creators building with Pehchaan</p>
          </div>
          <CreatorMarquee />
          <ProductMarquee />
          <div className="mt-6">
            <BrandStrip />
          </div>
        </div>
      </section>

      {/* CREATOR EXAMPLES */}
      <section className="container-page py-20 lg:py-28">
        <Reveal variant="up">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-[#ff3cac]/40 bg-gradient-to-r from-[#ff3cac]/10 to-[#784ba0]/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#7c3aed]">
              Creator pages that pop
            </span>
            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl lg:text-5xl">
              Every creator deserves a page that looks as good as their content
            </h2>
            <p className="mt-4 text-lg text-text-muted">
              Pick a vibe, showcase your products, and send followers straight to WhatsApp or your shop.
            </p>
          </div>
        </Reveal>
        <div className="mt-12">
          <CreatorPagePreviews />
        </div>
        <Reveal variant="up" delay={120}>
          <div className="mt-10 text-center">
            <Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff3cac] to-[#784ba0] px-8 py-3 text-base font-bold text-white shadow-pop transition hover:-translate-y-1">
              Create your page — free
              <span>→</span>
            </Link>
          </div>
        </Reveal>
      </section>

      {/* FEATURES */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fff] to-[#f8f7ff] py-20 lg:py-28">
        <div className="absolute -right-32 top-20 h-80 w-80 rounded-full bg-gradient-to-br from-[#7c3aed]/15 to-[#22d3ee]/15 blur-3xl" aria-hidden="true" />
        <div className="container-page relative">
          <Reveal variant="up">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center rounded-full border border-[#7c3aed]/40 bg-[#7c3aed]/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#6d28d9]">
                Everything in one place
              </span>
              <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl lg:text-5xl">
                Built to help Indian creators grow and get paid
              </h2>
              <p className="mt-4 text-lg text-text-muted">
                No clutter. Just the tools that actually move the needle on Instagram.
              </p>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-6 lg:grid-cols-12">
            <Reveal variant="up" delay={60} className="lg:col-span-7">
              <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-gradient-to-br from-[#ff3cac] via-[#784ba0] to-[#2b86c5] p-8 text-white shadow-pop sm:p-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.25),transparent_60%)]" />
                <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
                  <div>
                    <h3 className="text-2xl font-extrabold sm:text-3xl">One link for everything</h3>
                    <p className="mt-3 text-base text-white/90 sm:text-lg">
                      Bring Instagram, YouTube, your shop, and WhatsApp together on one beautiful page.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      {['Instagram', 'YouTube', 'Shop', 'WhatsApp'].map((item) => (
                        <span key={item} className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold backdrop-blur">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <div className="float-med rounded-[2rem] bg-white/95 p-6 text-text shadow-pop">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#ff3cac] to-[#784ba0] text-lg font-bold text-white">
                          M
                        </span>
                        <div>
                          <p className="font-bold">Meera Sarees</p>
                          <p className="text-sm text-text-muted">Handloom sarees · Bengaluru</p>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        {['Shop the collection', 'New arrivals', 'Instagram', 'WhatsApp'].map((l) => (
                          <div key={l} className="flex items-center justify-between rounded-xl border border-border px-4 py-2.5">
                            <span className="text-sm font-semibold">{l}</span>
                            <span className="text-text-muted">→</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
            <Reveal variant="up" delay={120} className="lg:col-span-5">
              <div className="group relative h-full overflow-hidden rounded-[2.5rem] border border-white/60 bg-gradient-to-br from-[#22c55e] to-[#0ea5e9] p-8 text-white shadow-pop sm:p-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.25),transparent_60%)]" />
                <div className="relative flex h-full flex-col">
                  <div>
                    <h3 className="text-2xl font-extrabold sm:text-3xl">Sell without a website</h3>
                    <p className="mt-3 text-base text-white/90 sm:text-lg">
                      Showcase physical and digital products with prices in ₹ and turn clicks into orders.
                    </p>
                  </div>
                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    {[{ name: 'Kanjeevaram silk', price: '₹8,400' }, { name: 'Vitamin C serum', price: '₹899' }].map((p) => (
                      <div key={p.name} className="rounded-2xl bg-white/95 p-4 text-text shadow-card">
                        <div className="aspect-[4/5] w-full rounded-xl bg-gradient-to-br from-[#c2410c] to-[#f59e0b]" />
                        <p className="mt-2 text-sm font-semibold">{p.name}</p>
                        <p className="mt-1 text-base font-bold text-accent">{p.price}</p>
                        <button className="mt-3 w-full rounded-lg bg-accent py-2 text-xs font-semibold text-on-accent">
                          Buy now
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
            <Reveal variant="up" delay={180} className="lg:col-span-6">
              <div className="group relative h-full overflow-hidden rounded-[2.5rem] border border-white/60 bg-gradient-to-br from-[#25D366] to-[#128C7E] p-8 text-white shadow-pop sm:p-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_60%)]" />
                <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
                  <div>
                    <h3 className="text-2xl font-extrabold sm:text-3xl">Chat on WhatsApp</h3>
                    <p className="mt-3 text-base text-white/90 sm:text-lg">
                      Let customers ask questions and order directly through WhatsApp.
                    </p>
                  </div>
                  <div className="rounded-[2rem] bg-white/95 p-5 text-text shadow-pop">
                    <div className="flex items-center gap-3 border-b border-border/70 pb-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white">
                        <IconWhatsapp />
                      </span>
                      <div>
                        <p className="text-sm font-bold">Aarti Nair</p>
                        <p className="text-xs text-text-muted">Online</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="inline-block rounded-2xl rounded-bl-sm bg-[#f1f5f9] px-4 py-2 text-sm">
                        Hi! I’d love to know more about this product.
                      </div>
                      <div className="ml-auto inline-block rounded-2xl rounded-br-sm bg-[#DCF8C6] px-4 py-2 text-sm">
                        Sure! Want to see more colours?
                      </div>
                    </div>
                    <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-2.5 text-sm font-semibold text-white">
                      <IconWhatsapp /> Chat on WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
            <Reveal variant="up" delay={240} className="lg:col-span-6">
              <div className="group relative h-full overflow-hidden rounded-[2.5rem] border border-white/60 bg-gradient-to-br from-[#7c3aed] to-[#ec4899] p-8 text-white shadow-pop sm:p-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_60%)]" />
                <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
                  <div>
                    <h3 className="text-2xl font-extrabold sm:text-3xl">UPI to get paid</h3>
                    <p className="mt-3 text-base text-white/90 sm:text-lg">
                      Share your UPI ID or QR so Indian buyers can pay you directly.
                    </p>
                  </div>
                  <div className="rounded-[2rem] bg-white/95 p-6 text-center text-text shadow-pop">
                    <p className="text-sm font-semibold">Scan to pay</p>
                    <div className="relative mx-auto mt-4 grid h-40 w-40 place-items-center rounded-2xl border border-border bg-[#f8fafc] p-3">
                      <div className="grid h-28 w-28 grid-cols-5 gap-1">
                        {Array.from({ length: 25 }).map((_, i) => (
                          <span key={i} className={`h-full w-full rounded-[2px] ${i % 3 === 0 ? 'bg-text' : 'bg-white'}`} />
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 rounded-xl border border-border px-4 py-2">
                      <p className="text-xs uppercase tracking-wide text-text-muted">UPI ID</p>
                      <p className="mt-1 font-mono text-sm font-semibold">creator@example</p>
                    </div>
                    <p className="mt-2 text-xs text-text-muted">Demo QR • for illustration only</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* DIGITAL PRODUCTS */}
      <section className="container-page py-20 lg:py-28">
        <Reveal variant="up">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-[#ec4899]/40 bg-[#ec4899]/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#be185d]">
              Monetize with digital products
            </span>
            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl lg:text-5xl">
              E-books, templates, presets and more
            </h2>
            <p className="mt-4 text-lg text-text-muted">
              Turn your knowledge into income with beautiful digital product showcases.
            </p>
          </div>
        </Reveal>
        <div className="mt-12">
          <DigitalProductShowcase />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f8f7ff] to-[#fff] py-20 lg:py-28">
        <div className="container-page">
          <Reveal variant="up">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center rounded-full border border-[#22d3ee]/40 bg-[#22d3ee]/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#0369a1]">
                How it works
              </span>
              <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl lg:text-5xl">
                From profile to paid in three steps
              </h2>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { step: '01', title: 'Create your page', body: 'Sign up and pick a template that fits your brand.', color: 'from-[#ff3cac] to-[#784ba0]' },
              { step: '02', title: 'Add links & products', body: 'Add your social links, showcase products, or add digital items.', color: 'from-[#22d3ee] to-[#7c3aed]' },
              { step: '03', title: 'Share & earn', body: 'Share your /u/ page on Instagram and start getting orders.', color: 'from-[#22c55e] to-[#0ea5e9]' },
            ].map((s) => (
              <Reveal key={s.step} variant="up" delay={Number(s.step) * 40}>
                <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white p-8 shadow-card transition hover:-translate-y-1">
                  <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${s.color} opacity-20 blur-2xl`} />
                  <div className="relative">
                    <span className={`inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${s.color} text-lg font-bold text-white shadow-card`}>
                      {s.step}
                    </span>
                    <h3 className="mt-4 text-xl font-bold">{s.title}</h3>
                    <p className="mt-2 text-text-muted">{s.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="container-page py-20 lg:py-28">
        <Reveal variant="up">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#b45309]">
              Built for every kind of creator
            </span>
            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl lg:text-5xl">
              Fashion, beauty, food, digital and more
            </h2>
            <p className="mt-4 text-lg text-text-muted">
              Join creators across India building beautiful pages with Pehchaan.
            </p>
          </div>
        </Reveal>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {['Sarees & fashion', 'Beauty & skincare', 'Jewellery & handmade', 'Food & home chefs', 'Digital products', 'Coaches & freelancers'].map((c) => (
            <span key={c} className="rounded-full border border-border bg-white px-5 py-2 text-sm font-semibold text-text shadow-sm">
              {c}
            </span>
          ))}
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="group overflow-hidden rounded-3xl shadow-card transition hover:-translate-y-1">
              <img
                src={`/assets/creators/creator-${i}.jpg`}
                alt={`Creator portrait ${i}`}
                className="h-72 w-full object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* PRICING TEASER */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#1f1147] via-[#2b0f3a] to-[#120b2e] py-16 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,60,172,0.3),transparent_60%)]" />
        <div className="container-page relative flex flex-col items-center gap-6 text-center">
          <Reveal variant="up">
            <h2 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl">Start free. Upgrade when you need more.</h2>
            <p className="mt-3 text-lg text-white/80">
              Simple pricing that grows with you. See full details on the pricing page.
            </p>
          </Reveal>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/register" className="rounded-full bg-white px-8 py-3 text-base font-bold text-[#2b0f3a] shadow-pop transition hover:-translate-y-1">
              Create your page — free
            </Link>
            <Link to="/pricing" className="rounded-full border border-white/40 px-8 py-3 text-base font-semibold text-white transition hover:-translate-y-1 hover:bg-white/10">
              View pricing
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-page py-20 lg:py-28">
        <Reveal variant="up">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-border px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-text-muted">
              FAQs
            </span>
            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl lg:text-5xl">
              Questions? We’ve got answers
            </h2>
          </div>
        </Reveal>
        <div className="mt-10">
          <FAQ />
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden">
        <div className="container-page pb-20">
          <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-r from-[#ff3cac] via-[#784ba0] to-[#2b86c5] p-10 text-white shadow-pop sm:p-14 lg:p-16">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.25),transparent_60%)]" />
            <div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl">
                  Your audience is waiting. Give them a beautiful place to land.
                </h2>
                <p className="mt-4 text-lg text-white/90">
                  Create your free Pehchaan page and start sharing your links, products, and WhatsApp in minutes.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link to="/register" className="rounded-full bg-white px-8 py-3 text-base font-bold text-[#2b0f3a] shadow-pop transition hover:-translate-y-1">
                    Create your page — free
                  </Link>
            <Link to="/pricing" className="rounded-full border border-white/40 px-8 py-3 text-base font-semibold text-white transition hover:-translate-y-1 hover:bg-white/10" aria-label="View pricing">
              See pricing
            </Link>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/80">
                  <span className="flex items-center gap-2">
                    <IconCheck /> Free forever
                  </span>
                  <span className="flex items-center gap-2">
                    <IconCheck /> No app to install
                  </span>
                  <span className="flex items-center gap-2">
                    <IconCheck /> Your own /u/ page
                  </span>
                </div>
              </div>
              <div className="relative hidden lg:block">
                <div className="float-slow overflow-hidden rounded-[2.5rem] shadow-pop">
                  <img
                    src="/assets/creators/creator-4.jpg"
                    alt="Creator showcasing products"
                    className="h-[420px] w-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SAMPLES */}
      <section className="container-page pb-20">
        <Reveal variant="up">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-text-muted">Try a sample page</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              {SAMPLES.map((s) => (
                <Link
                  key={s.handle}
                  to={`/u/${s.handle}`}
                  className="inline-flex items-center gap-3 rounded-full border border-border bg-white px-5 py-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-card"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: s.color }}>
                    {s.name[0]}
                  </span>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-text">{s.name}</p>
                    <p className="text-xs text-text-muted">{s.tagline}</p>
                  </div>
                  <IconExternal />
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}