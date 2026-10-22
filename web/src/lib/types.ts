export type Role = 'creator' | 'admin';
export type ThemeKey = 'saffron' | 'indigo' | 'emerald' | 'midnight' | 'rose';
export type Layout = 'classic' | 'grid' | 'feature';

export interface SessionUser {
  id: string;
  email: string;
  role: Role;
  status: 'active' | 'suspended';
}

export interface Theme {
  themeKey: ThemeKey;
  layout: Layout;
  accent: string;
}

export interface Profile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  whatsappNumber: string | null;
  upiId: string | null;
  upiQrUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  theme: Theme;
  appearance: unknown;
  isPublished: boolean;
  publishedAt: string | null;
  updatedAt: string;
  publicUrl: string;
}

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: string;
  position: number;
  isActive: boolean;
  clickCount: number;
}

export interface ProductItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  pricePaise: number | null;
  currency: string;
  destinationUrl: string;
  position: number;
  isActive: boolean;
}

export interface PublicPage {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  whatsappNumber: string | null;
  upiId: string | null;
  upiQrUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  theme: Theme;
  appearance: unknown;
  links: Pick<LinkItem, 'id' | 'title' | 'url' | 'icon' | 'position'>[];
  products: Pick<ProductItem, 'id' | 'title' | 'description' | 'imageUrl' | 'pricePaise' | 'currency' | 'destinationUrl' | 'position'>[];
}

export interface OwnerStats {
  views: number;
  views_7d: number;
  clicks: number;
  links: number;
  products: number;
  series: { day: string; count: number }[];
}

export interface AdminUserRow {
  id: string;
  email: string;
  role: Role;
  status: 'active' | 'suspended';
  createdAt: string;
  lastLoginAt: string | null;
  tenantId: string | null;
  username: string | null;
  displayName: string | null;
  isPublished: boolean | null;
  views: number;
  links: number;
  products: number;
}

export interface AdminAuditEntry {
  id: string;
  action: string;
  actorEmail: string;
  targetType: string | null;
  targetLabel: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface AdminTotals {
  users: number;
  creators: number;
  admins: number;
  suspended: number;
  tenants: number;
  published: number;
  drafts: number;
  links: number;
  products: number;
}

export interface AdminOverviewData {
  totals: AdminTotals;
  activity: { views: number; views7d: number; newUsers7d: number; newUsers30d: number };
  series: { day: string; count: number }[];
  recentUsers: {
    id: string;
    email: string;
    role: Role;
    status: 'active' | 'suspended';
    createdAt: string;
    username: string | null;
    displayName: string | null;
  }[];
  recentAudit: AdminAuditEntry[];
}

export interface AdminUserDetail {
  id: string;
  email: string;
  role: Role;
  status: 'active' | 'suspended';
  createdAt: string;
  lastLoginAt: string | null;
  tenant: { id: string; name: string | null; createdAt: string | null } | null;
  profile: {
    username: string;
    displayName: string | null;
    bio: string | null;
    avatarUrl: string | null;
    isPublished: boolean | null;
    publishedAt: string | null;
  } | null;
  counts: { views: number; clicks: number; links: number; products: number; sessions: number };
}

export interface AdminStorefrontRow {
  tenantId: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  isPublished: boolean | null;
  publishedAt: string | null;
  views: number;
  links: number;
  products: number;
}

export interface AdminAnalyticsData {
  totals: {
    views: number;
    views_7d: number;
    views_30d: number;
    clicks: number;
    links: number;
    products: number;
    published: number;
  };
  series: { day: string; count: number }[];
  topCreators: {
    tenantId: string;
    username: string | null;
    displayName: string | null;
    isPublished: boolean | null;
    views: number;
    links: number;
    products: number;
    clicks: number;
  }[];
}

export interface Paginated<T> {
  total: number;
  page: number;
  pageSize: number;
  rows: T[];
}
