import { useLocation } from 'react-router-dom';

interface Section {
  heading?: string;
  body: string[];
}

interface Doc {
  title: string;
  intro: string;
  sections: Section[];
}

const DOCS: Record<string, Doc> = {
  '/privacy': {
    title: 'Privacy policy',
    intro:
      'This is a demonstration product. This policy explains, plainly, what a production Pehchaan would collect and why.',
    sections: [
      { heading: 'What we collect', body: ['Account email and a securely hashed password (we never store your password in plain text).', 'The profile content you enter: name, bio, links and products.', 'Basic usage counts, such as how many times your public page was viewed and which links were clicked.'] },
      { heading: 'How we use it', body: ['To run your creator page and show your analytics to you.', 'We do not sell your personal data.'] },
      { heading: 'Cookies', body: ['A single session cookie is used to keep you logged in. It is httpOnly and SameSite.', 'A small preference value remembers your chosen language.'] },
      { heading: 'Your choices', body: ['You can edit or delete your content at any time.', 'You can ask for your account to be removed.'] },
      { heading: 'Contact', body: ['For privacy questions once deployed, use the contact page.'] },
    ],
  },
  '/terms': {
    title: 'Terms of use',
    intro: 'Plain-language terms for using this demonstration of Pehchaan.',
    sections: [
      { heading: 'Your account', body: ['You are responsible for the content you publish and for keeping your password safe.', 'Do not use the service to share unlawful, harmful or misleading content.'] },
      { heading: 'Content', body: ['You keep ownership of everything you upload.', 'You grant us only the permission needed to display your page.'] },
      { heading: 'Payments', body: ['Pehchaan does not process payments. Any UPI id you display is your own and transactions happen directly between you and your buyer.'] },
      { heading: 'Availability', body: ['This is a demonstration build offered as-is, without warranty.'] },
      { heading: 'Changes', body: ['A production version would give notice before these terms change.'] },
    ],
  },
  '/about': {
    title: 'About Pehchaan',
    intro:
      'Pehchaan (पहचान / ಗುರುತು) means “identity”. We built it as an original product so Indian creators can have one clean, fast page for their whole presence.',
    sections: [
      { heading: 'Why we built it', body: ['Creators here juggle Instagram, YouTube, WhatsApp and a shop, and share a messy list of links.', 'Pehchaan puts those in one page that loads fast on a phone and on a slow connection.'] },
      { heading: 'Made for India', body: ['Prices in rupees, WhatsApp first, UPI for payments, and a workspace in English, हिंदी and ಕನ್ನಡ.', 'Low-bandwidth friendly: small pages, no heavy scripts.'] },
      { heading: 'How this build was made', body: ['It is an independent implementation. No code, assets, copy or trademarks from any other product were copied or reused.'] },
    ],
  },
  '/contact': {
    title: 'Contact',
    intro: 'We would love to hear from you.',
    sections: [
      { heading: 'Support', body: ['For help with your page, email support@pehchaan.example (a placeholder for this build).'] },
      { heading: 'Sales', body: ['For the Pro plan and bulk plans, email sales@pehchaan.example.'] },
      { heading: 'Press & partnerships', body: ['Reach the team at hello@pehchaan.example.'] },
      { heading: 'WhatsApp', body: ['Once you have a page, the WhatsApp button on it is the fastest way for your visitors to reach you.'] },
    ],
  },
};

export default function StaticPage() {
  const { pathname } = useLocation();
  const doc = DOCS[pathname] ?? DOCS['/about'];

  return (
    <article className="container-page py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-extrabold tracking-tight">{doc.title}</h1>
        <p className="mt-4 text-lg text-text-muted">{doc.intro}</p>
        <div className="mt-10 space-y-8">
          {doc.sections.map((s, i) => (
            <section key={i}>
              {s.heading && <h2 className="text-xl font-bold">{s.heading}</h2>}
              <div className="mt-2 space-y-3 text-text-muted">
                {s.body.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
        <p className="mt-12 rounded-md border border-border bg-surface p-4 text-xs text-text-muted">
          Last updated {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}.
          This document is part of a demonstration build.
        </p>
      </div>
    </article>
  );
}
