/** Indian rupee formatting from paise. ₹1,499.00 style, grouped Indian. */
export function formatINR(paise: number | null | undefined): string | null {
  if (paise === null || paise === undefined) return null;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: paise % 100 === 0 ? 0 : 2,
  }).format(paise / 100);
}

/** Digits-only WhatsApp deep link. Assumes an Indian number if no country code. */
export function whatsappLink(raw: string | null | undefined, text?: string): string | null {
  if (!raw) return null;
  const digits = raw.replace(/[^0-9]/g, '');
  if (!digits) return null;
  const withCc = digits.length === 10 ? `91${digits}` : digits;
  const query = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${withCc}${query}`;
}

/**
 * Builds a UPI intent link. This only *initiates* a payment in the user's own
 * UPI app — it never confirms one. Nothing here records a transaction.
 */
export function upiLink(upiId: string | null | undefined, payeeName: string, amountPaise?: number | null): string | null {
  if (!upiId) return null;
  const params = new URLSearchParams({ pa: upiId, pn: payeeName, cu: 'INR' });
  if (amountPaise && amountPaise > 0) params.set('am', (amountPaise / 100).toFixed(2));
  return `upi://pay?${params.toString()}`;
}

/** Locale-aware number grouping (Indian digit grouping). */
export function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '0';
  return new Intl.NumberFormat('en-IN').format(n);
}

export function hostOf(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('') || '?';
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
