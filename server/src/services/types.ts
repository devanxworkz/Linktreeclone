import type { AppearanceInput } from '../validation/schemas.js';

export type Role = 'creator' | 'admin';
export type UserStatus = 'active' | 'suspended';
export type ThemeKey = 'saffron' | 'indigo' | 'emerald' | 'midnight' | 'rose';
export type Layout = 'classic' | 'grid' | 'feature';

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  role: Role;
  status: UserStatus;
  created_at: Date | string;
}

export interface TenantRow {
  id: string;
  owner_user_id: string;
  name: string;
}

export interface ProfileRow {
  id: string;
  tenant_id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  whatsapp_number: string | null;
  upi_id: string | null;
  upi_qr_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  theme: { themeKey: ThemeKey; layout: Layout; accent: string };
  /** Storefront design settings; null until the creator saves a design. */
  appearance: AppearanceInput | null;
  is_published: boolean;
  published_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface LinkRow {
  id: string;
  tenant_id: string;
  title: string;
  url: string;
  icon: string;
  position: number;
  is_active: boolean;
  click_count: number;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface ProductRow {
  id: string;
  tenant_id: string;
  title: string;
  description: string;
  image_url: string | null;
  price_paise: number | null;
  currency: string;
  destination_url: string;
  position: number;
  is_active: boolean;
  created_at: Date | string;
  updated_at: Date | string;
}
