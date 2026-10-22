import { Link } from 'react-router-dom';

export function DigitalProductGrid() {
  const items = [
    { title: 'Creator Content OS', price: '₹1,499', label: 'Notion Template', color: 'from-[#7c3aed] to-[#a78bfa]' },
    { title: 'Saree Caption Pack', price: '₹299', label: 'E-book', color: 'from-[#c2410c] to-[#fb923c]' },
    { title: 'Lightroom Presets', price: '₹699', label: 'Presets', color: 'from-[#0f766e] to-[#22d3ee]' },
    { title: 'Digital Planner 2026', price: '₹499', label: 'Planner', color: 'from-[#be185d] to-[#f472b6]' },
    { title: 'Brand Kit for Creators', price: '₹899', label: 'Toolkit', color: 'from-[#1e40af] to-[#60a5fa]' },
    { title: 'Reels Script Bank', price: '₹399', label: 'Guide', color: 'from-[#166534] to-[#4ade80]' },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.title}
          className="group relative overflow-hidden rounded-3xl border border-white/20 shadow-card transition hover:-translate-y-1"
        >
          <div className={`relative aspect-[16/10] w-full bg-gradient-to-br ${item.color}`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.28),transparent_70%)]" />
            <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-text shadow-sm">
              {item.label}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 bg-white p-5">
            <div>
              <p className="text-base font-bold text-text">{item.title}</p>
              <p className="mt-1 text-lg font-bold text-accent">{item.price}</p>
            </div>
            <Link to="/register" className="inline-flex items-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-on-accent shadow-sm transition hover:opacity-90">
              Sell this
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}