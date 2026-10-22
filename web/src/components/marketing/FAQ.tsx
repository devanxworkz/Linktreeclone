export function FAQ() {
  const faqs = [
    {
      q: 'Is Pehchaan free to use?',
      a: 'Yes. You can create your page for free. Check the pricing page for details on plans.',
    },
    {
      q: 'Can I sell products on Pehchaan?',
      a: 'You can showcase products on your page. For payments, you can share your UPI details or direct customers to WhatsApp depending on your setup.',
    },
    {
      q: 'Do I need a website?',
      a: 'No. Pehchaan gives you a beautiful link-in-bio page you can share in your Instagram bio.',
    },
    {
      q: 'Will this work on mobile?',
      a: 'Yes. Your page is mobile-first and looks great on any device.',
    },
  ];

  return (
    <div className="mx-auto max-w-3xl divide-y divide-border rounded-3xl border border-border bg-white shadow-card">
      {faqs.map((f) => (
        <details key={f.q} className="group p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-text">
            {f.q}
            <span className="text-text-muted transition group-open:rotate-45">+</span>
          </summary>
          <p className="mt-3 text-base text-text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}