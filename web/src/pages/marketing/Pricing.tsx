import { Link } from 'react-router-dom';
import { IconCheck } from '../../components/icons';
import { FAQ as LandingFAQ } from '../../components/marketing/FAQ';

interface Plan {
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  cta: string;
  to: string;
  highlight?: boolean;
  features: string[];
}

const PLANS: Plan[] = [
  {
    name: 'Free',
    price: '₹0',
    cadence: 'forever',
    blurb: 'For creators just getting started.',
    cta: 'Create your page',
    to: '/register',
    features: [
      'Up to 10 links',
      'Up to 3 products',
      'All themes & layouts',
      'WhatsApp button',
      'UPI id & QR',
      '7-day analytics',
    ],
  },
  {
    name: 'Pro',
    price: '₹299',
    cadence: 'per month',
    blurb: 'For creators who are growing and selling.',
    cta: 'Start with Pro',
    to: '/register?plan=pro',
    highlight: true,
    features: [
      'Unlimited links',
      'Unlimited products',
      'Custom accent colour',
      '90-day analytics',
      'Remove Pehchaan badge',
      'Priority email support',
    ],
  },
];

const COMPARISON = [
  { feature: 'Links', free: 'Up to 10', pro: 'Unlimited' },
  { feature: 'Products', free: 'Up to 3', pro: 'Unlimited' },
  { feature: 'Themes & layouts', free: 'All', pro: 'All' },
  { feature: 'Custom accent colour', free: '—', pro: 'Yes' },
  { feature: 'WhatsApp & UPI', free: 'Yes', pro: 'Yes' },
  { feature: 'Analytics window', free: '7 days', pro: '90 days' },
  { feature: 'Remove Pehchaan badge', free: '—', pro: 'Yes' },
  { feature: 'Priority email support', free: '—', pro: 'Yes' },
];

export default function Pricing() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-gradient-to-br from-[#ff3cac]/25 to-[#784ba0]/20 blur-3xl" aria-hidden="true" />
        <div className="absolute -right-24 top-20 h-80 w-80 rounded-full bg-gradient-to-br from-[#22d3ee]/25 to-[#7c3aed]/20 blur-3xl" aria-hidden="true" />
        <div className="container-page relative py-16 text-center lg:py-20">
          <span className="inline-flex items-center rounded-full border border-[#ff3cac]/40 bg-gradient-to-r from-[#ff3cac]/10 to-[#784ba0]/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#7c3aed]">
            Pricing
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="sr-only">Simple pricing</span>
            <span aria-hidden="true">Choose the plan that grows with you.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
            Start building your creator brand today. Upgrade when you're ready for more. Prices in Indian rupees.
          </p>
        </div>
      </section>

      <section className="container-page pb-14">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col overflow-hidden rounded-[2rem] border p-8 shadow-card transition hover:-translate-y-1 ${
                plan.highlight
                  ? 'border-[#ff3cac]/60 bg-gradient-to-b from-white to-[#fff7fb]'
                  : 'border-border bg-white'
              }`}
            >
              {plan.highlight && (
                <div className="absolute right-6 top-6 rounded-full bg-gradient-to-r from-[#ff3cac] to-[#784ba0] px-3 py-1 text-xs font-bold text-white shadow-sm">
                  Most popular
                </div>
              )}
              <div>
                <h2 className="text-xl font-extrabold">{plan.name}</h2>
                <p className="mt-1 text-sm text-text-muted">{plan.blurb}</p>
                <p className="mt-6 flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold">{plan.price}</span>
                  <span className="text-sm text-text-muted">/ {plan.cadence}</span>
                </p>
              </div>
              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <IconCheck />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to={plan.to}
                className={`mt-8 inline-flex items-center justify-center rounded-full px-6 py-3 text-center text-base font-bold transition ${
                  plan.highlight
                    ? 'bg-gradient-to-r from-[#ff3cac] to-[#784ba0] text-white shadow-pop hover:-translate-y-0.5'
                    : 'border border-border bg-white text-text hover:-translate-y-0.5 hover:bg-surface'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-border bg-white shadow-card">
          <div className="border-b border-border px-6 py-5">
            <h2 className="text-xl font-extrabold">Feature comparison</h2>
            <p className="mt-1 text-sm text-text-muted">See exactly what you get on Free vs Pro.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead className="bg-surface">
                <tr>
                  <th scope="col" className="p-5 font-bold">Feature</th>
                  <th scope="col" className="p-5 font-bold">Free</th>
                  <th scope="col" className="p-5 font-bold text-[#7c3aed]">Pro</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.feature} className="border-t border-border">
                    <th scope="row" className="p-5 font-medium">{row.feature}</th>
                    <td className="p-5 text-text-muted">{row.free}</td>
                    <td className="p-5 font-semibold">
                      <span className="inline-flex items-center gap-2">
                        {row.pro === 'Yes' && <span className="text-emerald-600"><IconCheck /></span>}
                        {row.pro}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold sm:text-3xl">Creator-focused FAQ</h2>
            <p className="mt-2 text-text-muted">Quick answers before you get started.</p>
          </div>
          <div className="mt-8">
            <LandingFAQ />
          </div>
        </div>
      </section>

      <section className="container-page pb-20">
        <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-r from-[#ff3cac] via-[#784ba0] to-[#2b86c5] p-10 text-center text-white shadow-pop sm:p-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.25),transparent_60%)]" />
          <div className="relative">
            <h2 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl">Ready to grow your creator brand?</h2>
            <p className="mt-3 text-lg text-white/90">
              Create your free Pehchaan page and share it in minutes.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link to="/register" className="rounded-full bg-white px-8 py-3 text-base font-bold text-[#2b0f3a] shadow-pop transition hover:-translate-y-1">
                Create your page — free
              </Link>
              <Link to="/features" className="rounded-full border border-white/40 px-8 py-3 text-base font-semibold text-white transition hover:-translate-y-1 hover:bg-white/10">
                See all features
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}