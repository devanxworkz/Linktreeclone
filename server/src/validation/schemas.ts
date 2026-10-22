import { z } from 'zod';

const httpUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((v) => /^https?:\/\//i.test(v), 'Must start with http:// or https://');

const optionalHttpUrl = z
  .union([httpUrl, z.literal('')])
  .optional()
  .transform((v) => (v === '' ? null : v ?? null));

const RESERVED_USERNAMES = new Set([
  'admin', 'administrator', 'api', 'login', 'register', 'dashboard', 'u',
  'support', 'help', 'about', 'pricing', 'features', 'terms', 'privacy',
  'forgot', 'settings', 'root', 'www', 'null', 'undefined',
]);

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, 'Username must be at least 3 characters.')
  .max(30, 'Username must be at most 30 characters.')
  .regex(
    /^[a-z0-9](?:[a-z0-9_-]{1,28}[a-z0-9])$/,
    'Use 3–30 letters, numbers, dashes or underscores; start and end with a letter or number.',
  )
  .refine((v) => !RESERVED_USERNAMES.has(v), 'That username is reserved.');

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.').max(254),
  password: z.string().min(8, 'Password must be at least 8 characters.').max(200),
  displayName: z.string().trim().min(1, 'Enter your name.').max(80),
  username: usernameSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1, 'Enter your password.').max(200),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(8, 'New password must be at least 8 characters.').max(200),
});

export const profileUpdateSchema = z.object({
  displayName: z.string().trim().min(1, 'Enter a display name.').max(80),
  bio: z.string().trim().max(500).default(''),
  avatarUrl: optionalHttpUrl,
  whatsappNumber: z
    .union([z.string().trim().max(20), z.literal('')])
    .optional()
    .transform((v) => (v ? v : null))
    .refine(
      (v) => v === null || /^[0-9+\-\s()]{7,20}$/.test(v),
      'Enter a valid phone number, digits only with an optional country code.',
    ),
  upiId: z
    .union([z.string().trim().max(80), z.literal('')])
    .optional()
    .transform((v) => (v ? v : null))
    .refine(
      (v) => v === null || /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/.test(v),
      'Enter a valid UPI id, for example name@bank.',
    ),
  upiQrUrl: optionalHttpUrl,
  metaTitle: z
    .union([z.string().trim().max(70), z.literal('')])
    .optional()
    .transform((v) => (v ? v : null)),
  metaDescription: z
    .union([z.string().trim().max(160), z.literal('')])
    .optional()
    .transform((v) => (v ? v : null)),
});

export const usernameUpdateSchema = z.object({ username: usernameSchema });

export const THEME_KEYS = ['saffron', 'indigo', 'emerald', 'midnight', 'rose'] as const;
export const LAYOUTS = ['classic', 'grid', 'feature'] as const;

export const themeSchema = z.object({
  themeKey: z.enum(THEME_KEYS).default('saffron'),
  layout: z.enum(LAYOUTS).default('classic'),
  accent: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Pick a colour as a 6-digit hex value.')
    .default('#c2410c'),
});

export const publishSchema = z.object({ isPublished: z.boolean() });

/* -------------------------------------------------------------------------- */
/* Public storefront design settings (profiles.appearance jsonb).             */
/* Mirrors web/src/lib/appearance.ts — change both together.                  */
/* -------------------------------------------------------------------------- */

const hexColor = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Pick a colour as a 6-digit hex value.');

const hexColorOrEmpty = z.union([hexColor, z.literal('')]);
const inRange = (min: number, max: number) => z.number().min(min).max(max);

export const APPEARANCE_TEMPLATES = [
  'minimal-luxe',
  'midnight-pro',
  'soft-pastel',
  'editorial-fashion',
  'vibrant-creator',
  'indian-boutique',
] as const;
export const APPEARANCE_FONTS = ['sans', 'serif', 'rounded', 'display'] as const;
export const APPEARANCE_AVATAR_SHAPES = ['circle', 'rounded', 'square'] as const;
export const APPEARANCE_AVATAR_ALIGNS = ['center', 'left'] as const;
export const APPEARANCE_BUTTON_SHAPES = ['pill', 'rounded', 'square'] as const;
export const APPEARANCE_BUTTON_BORDERS = ['none', 'thin', 'strong'] as const;
export const APPEARANCE_BUTTON_SHADOWS = ['none', 'soft', 'bold'] as const;
export const APPEARANCE_PRODUCT_LAYOUTS = ['list', 'grid'] as const;
export const APPEARANCE_PRODUCT_ASPECTS = ['square', 'portrait', 'landscape'] as const;
export const APPEARANCE_PRODUCT_CARDS = ['soft', 'outlined', 'flat'] as const;

export const appearanceSchema = z.object({
  template: z.enum(APPEARANCE_TEMPLATES),
  background: z.object({
    kind: z.enum(['solid', 'gradient']),
    color: hexColor,
    gradientFrom: hexColor,
    gradientTo: hexColor,
    gradientAngle: inRange(0, 360),
    imageUrl: z.union([httpUrl, z.literal('')]),
  }),
  avatar: z.object({
    size: inRange(64, 160),
    shape: z.enum(APPEARANCE_AVATAR_SHAPES),
    align: z.enum(APPEARANCE_AVATAR_ALIGNS),
  }),
  typography: z.object({
    font: z.enum(APPEARANCE_FONTS),
    headingColor: hexColor,
    bodyColor: hexColor,
    headingScale: inRange(0.85, 1.35),
  }),
  button: z.object({
    color: hexColor,
    textColor: hexColor,
    shape: z.enum(APPEARANCE_BUTTON_SHAPES),
    border: z.enum(APPEARANCE_BUTTON_BORDERS),
    shadow: z.enum(APPEARANCE_BUTTON_SHADOWS),
    gap: inRange(6, 32),
  }),
  products: z.object({
    layout: z.enum(APPEARANCE_PRODUCT_LAYOUTS),
    aspect: z.enum(APPEARANCE_PRODUCT_ASPECTS),
    card: z.enum(APPEARANCE_PRODUCT_CARDS),
    imageRadius: inRange(0, 28),
  }),
  section: z.object({
    surface: hexColorOrEmpty,
    radius: inRange(0, 32),
    padding: inRange(8, 32),
    gap: inRange(6, 32),
  }),
});

export const linkCreateSchema = z.object({
  title: z.string().trim().min(1, 'Give the link a title.').max(80),
  url: httpUrl,
  icon: z.string().trim().max(40).default('link'),
  isActive: z.boolean().default(true),
});

export const linkUpdateSchema = linkCreateSchema.partial();

export const productCreateSchema = z.object({
  title: z.string().trim().min(1, 'Give the product a title.').max(120),
  description: z.string().trim().max(1000).default(''),
  imageUrl: optionalHttpUrl,
  pricePaise: z
    .union([z.number().int().min(0).max(100_000_000), z.null()])
    .optional()
    .transform((v) => v ?? null),
  destinationUrl: httpUrl,
  isActive: z.boolean().default(true),
});

export const productUpdateSchema = productCreateSchema.partial();

export const reorderSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(200),
});

export const adminStatusSchema = z.object({
  status: z.enum(['active', 'suspended']),
  reason: z
    .union([z.string().trim().max(300), z.literal('')])
    .optional()
    .transform((v) => (v ? v : undefined)),
});

export const adminUserQuerySchema = z.object({
  q: z.string().trim().max(80).optional(),
  status: z.enum(['active', 'suspended']).optional(),
  role: z.enum(['creator', 'admin']).optional(),
  published: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().min(1).max(1000).default(1),
});

export const adminAuditQuerySchema = z.object({
  q: z.string().trim().max(80).optional(),
  action: z.string().trim().max(60).optional(),
  page: z.coerce.number().int().min(1).max(1000).default(1),
});

export const adminStorefrontQuerySchema = z.object({
  q: z.string().trim().max(80).optional(),
  published: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().min(1).max(1000).default(1),
});

export const viewSchema = z.object({
  referrer: z.string().trim().max(500).optional(),
});

export const listQuerySchema = z.object({
  q: z.string().trim().max(80).optional(),
  page: z.coerce.number().int().min(1).max(1000).default(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ThemeInput = z.infer<typeof themeSchema>;
export type AppearanceInput = z.infer<typeof appearanceSchema>;
export type LinkInput = z.infer<typeof linkCreateSchema>;
export type ProductInput = z.infer<typeof productCreateSchema>;
