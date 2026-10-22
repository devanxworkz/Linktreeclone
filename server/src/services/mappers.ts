import type { LinkRow, ProductRow, ProfileRow } from './types.js';

export function toProfileDto(p: ProfileRow) {
  return {
    id: p.id,
    username: p.username,
    displayName: p.display_name,
    bio: p.bio,
    avatarUrl: p.avatar_url,
    whatsappNumber: p.whatsapp_number,
    upiId: p.upi_id,
    upiQrUrl: p.upi_qr_url,
    metaTitle: p.meta_title,
    metaDescription: p.meta_description,
    theme: p.theme,
    appearance: p.appearance ?? null,
    isPublished: p.is_published,
    publishedAt: p.published_at,
    updatedAt: p.updated_at,
  };
}

export function toLinkDto(l: LinkRow) {
  return {
    id: l.id,
    title: l.title,
    url: l.url,
    icon: l.icon,
    position: l.position,
    isActive: l.is_active,
    clickCount: Number(l.click_count ?? 0),
  };
}

export function toProductDto(p: ProductRow) {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    imageUrl: p.image_url,
    pricePaise: p.price_paise === null ? null : Number(p.price_paise),
    currency: p.currency,
    destinationUrl: p.destination_url,
    position: p.position,
    isActive: p.is_active,
  };
}
