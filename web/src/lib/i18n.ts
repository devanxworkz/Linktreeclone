/**
 * Minimal i18n. English is complete; Hindi and Kannada are scaffolded so the
 * interface is translation-ready. Every string goes through `t(key, fallback)`,
 * so a new language is a data addition, not a rewrite. Missing keys fall back
 * to English, then to the provided fallback, then to the key itself.
 */

export const LOCALES = ['en', 'hi', 'kn'] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  hi: 'हिन्दी',
  kn: 'ಕನ್ನಡ',
};

type Dict = Record<string, string>;

const en: Dict = {
  'nav.home': 'Home',
  'nav.features': 'Features',
  'nav.pricing': 'Pricing',
  'nav.login': 'Log in',
  'nav.signup': 'Start free',
  'hero.eyebrow': 'For Indian creators',
  'hero.title': 'One link for everything you create',
  'hero.subtitle':
    'Links, products, WhatsApp and UPI on one fast, mobile-first page. Built for Instagram sellers, freelancers and small businesses.',
  'hero.cta': 'Create your page — free',
  'hero.secondary': 'See a live example',
  'common.loading': 'Loading…',
  'common.save': 'Save',
  'common.saving': 'Saving…',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.copy': 'Copy',
  'common.copied': 'Copied',
  'public.contact': 'Chat on WhatsApp',
  'public.pay': 'Pay via UPI',
  'public.payNote': 'Opens your UPI app. Pehchaan does not process or confirm the payment.',
  'public.enquire': 'Enquire',
  'public.notFound': 'This page is not available',
  'public.notFoundHint': 'The creator may have unpublished it, or the link is wrong.',
};

const hi: Dict = {
  'nav.home': 'होम',
  'nav.features': 'फ़ीचर्स',
  'nav.pricing': 'कीमत',
  'nav.login': 'लॉग इन',
  'nav.signup': 'मुफ़्त शुरू करें',
  'hero.eyebrow': 'भारतीय क्रिएटर्स के लिए',
  'hero.title': 'आप जो भी बनाते हैं, उसके लिए एक लिंक',
  'hero.subtitle':
    'लिंक, प्रोडक्ट, WhatsApp और UPI — एक तेज़, मोबाइल-फ़र्स्ट पेज पर।',
  'hero.cta': 'अपना पेज बनाएँ — मुफ़्त',
  'hero.secondary': 'लाइव उदाहरण देखें',
  'public.contact': 'WhatsApp पर बात करें',
  'public.pay': 'UPI से भुगतान करें',
};

const kn: Dict = {
  'nav.home': 'ಮುಖಪುಟ',
  'nav.features': 'ವೈಶಿಷ್ಟ್ಯಗಳು',
  'nav.pricing': 'ಬೆಲೆ',
  'nav.login': 'ಲಾಗಿನ್',
  'nav.signup': 'ಉಚಿತವಾಗಿ ಪ್ರಾರಂಭಿಸಿ',
  'hero.eyebrow': 'ಭಾರತೀಯ ಸೃಷ್ಟಿಕರ್ತರಿಗಾಗಿ',
  'hero.title': 'ನೀವು ಸೃಷ್ಟಿಸುವ ಎಲ್ಲದಕ್ಕೂ ಒಂದೇ ಲಿಂಕ್',
  'public.contact': 'WhatsApp ನಲ್ಲಿ ಮಾತನಾಡಿ',
  'public.pay': 'UPI ಮೂಲಕ ಪಾವತಿಸಿ',
};

const dicts: Record<Locale, Dict> = { en, hi, kn };

export function translate(locale: Locale, key: string, fallback?: string): string {
  return dicts[locale]?.[key] ?? en[key] ?? fallback ?? key;
}

export function detectLocale(): Locale {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('pehchaan_locale') : null;
  if (stored && (LOCALES as readonly string[]).includes(stored)) return stored as Locale;
  return 'en';
}
