import { config } from '../config.js';
import {
  createAccount,
  findProfileByTenant,
  findTenantByOwner,
  findUserByEmail,
} from '../services/account.js';
import { createLink } from '../services/links.js';
import { createProduct } from '../services/products.js';
import { setPublished, updateProfile, updateTheme } from '../services/profile.js';

/** A demo creator, seeded for local development only. Clearly labelled. */
interface DemoCreator {
  email: string;
  password: string;
  username: string;
  displayName: string;
  bio: string;
  whatsappNumber: string;
  upiId: string;
  theme: { themeKey: 'saffron' | 'indigo' | 'emerald' | 'midnight' | 'rose'; layout: 'classic' | 'grid' | 'feature'; accent: string };
  links: { title: string; url: string; icon: string }[];
  products: { title: string; description: string; pricePaise: number | null; destinationUrl: string }[];
}

const DEMOS: DemoCreator[] = [
  {
    email: 'aarti@demo.pehchaan.local',
    password: 'Demo@12345',
    username: 'aarti',
    displayName: 'Aarti Nair',
    bio: 'Illustrator from Kochi. I paint the coast and sell prints. (Demo account)',
    whatsappNumber: '919876543210',
    upiId: 'aarti@okhdfcbank',
    theme: { themeKey: 'saffron', layout: 'classic', accent: '#c2410c' },
    links: [
      { title: 'Instagram', url: 'https://instagram.com/', icon: 'instagram' },
      { title: 'YouTube — studio vlogs', url: 'https://youtube.com/', icon: 'youtube' },
      { title: 'Latest print drop', url: 'https://example.com/shop', icon: 'shopping-bag' },
    ],
    products: [
      {
        title: 'Coastal Print — A3',
        description: 'Signed giclée print of a Malabar coast study. Ships in 5 days.',
        pricePaise: 149900,
        destinationUrl: 'https://example.com/coastal-print',
      },
      {
        title: '1:1 Art Mentoring',
        description: '60-minute online session on building a daily practice.',
        pricePaise: 250000,
        destinationUrl: 'https://example.com/mentoring',
      },
    ],
  },
  {
    email: 'mocha@demo.pehchaan.local',
    password: 'Demo@12345',
    username: 'cafe-mocha',
    displayName: 'Cafe Mocha',
    bio: 'Indiranagar, Bengaluru. Small-batch roasts and weekend workshops. (Demo account)',
    whatsappNumber: '919812345678',
    upiId: 'cafemocha@okaxis',
    theme: { themeKey: 'emerald', layout: 'grid', accent: '#15803d' },
    links: [
      { title: 'Order beans', url: 'https://example.com/beans', icon: 'coffee' },
      { title: 'Weekend workshop', url: 'https://example.com/workshop', icon: 'calendar' },
    ],
    products: [
      {
        title: 'Chikmagalur Filter Roast — 250g',
        description: 'Floral, medium body. Ground or whole bean.',
        pricePaise: 45000,
        destinationUrl: 'https://example.com/filter-roast',
      },
    ],
  },
];

export async function seed(): Promise<void> {
  // Admin: only created when credentials are provided. Never a default password.
  if (config.adminEmail && config.adminPassword) {
    const existing = await findUserByEmail(config.adminEmail);
    if (!existing) {
      const { user } = await createAccount({
        email: config.adminEmail,
        password: config.adminPassword,
        displayName: 'Platform Admin',
        username: 'platform-admin',
      });
      // Promote to admin and leave the auto-created page unpublished.
      const { getDb } = await import('./index.js');
      const db = await getDb();
      await db.query("update users set role = 'admin' where id = $1", [user.id]);
      console.log(`[seed] created admin ${config.adminEmail}`);
    } else {
      console.log('[seed] admin already exists');
    }
  } else {
    console.log('[seed] ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin creation');
  }

  for (const demo of DEMOS) {
    const existing = await findUserByEmail(demo.email);
    if (existing) {
      console.log(`[seed] demo creator ${demo.username} already exists`);
      continue;
    }
    const { user } = await createAccount({
      email: demo.email,
      password: demo.password,
      displayName: demo.displayName,
      username: demo.username,
    });
    const tenant = await findTenantByOwner(user.id);
    if (!tenant) continue;
    await updateProfile(tenant.id, {
      displayName: demo.displayName,
      bio: demo.bio,
      avatarUrl: null,
      whatsappNumber: demo.whatsappNumber,
      upiId: demo.upiId,
      upiQrUrl: null,
      metaTitle: `${demo.displayName} — links, work and shop`,
      metaDescription: demo.bio.slice(0, 155),
    });
    await updateTheme(tenant.id, demo.theme);
    for (const l of demo.links) {
      await createLink(tenant.id, { title: l.title, url: l.url, icon: l.icon, isActive: true });
    }
    for (const p of demo.products) {
      await createProduct(tenant.id, {
        title: p.title,
        description: p.description,
        imageUrl: null,
        pricePaise: p.pricePaise,
        destinationUrl: p.destinationUrl,
        isActive: true,
      });
    }
    await setPublished(tenant.id, true);
    const profile = await findProfileByTenant(tenant.id);
    console.log(`[seed] created demo creator /u/${profile?.username}`);
  }
}
