import type { Lang } from './ui';

const STORAGE_KEY = 'sx-lang';

function isLang(value: string | null): value is Lang {
  return value === 'es' || value === 'en';
}

/** Returns the visitor's stored language preference, if any. */
export function getStoredLang(): Lang | null {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isLang(stored) ? stored : null;
}

/** Persists an explicit language choice so auto-detection never overrides it. */
export function setStoredLang(lang: Lang): void {
  window.localStorage.setItem(STORAGE_KEY, lang);
}

/** Best-guess language from the browser's language settings. Only 'es'/'en' are supported. */
export function browserLang(): Lang {
  return navigator.language.toLowerCase().startsWith('en') ? 'en' : 'es';
}

/**
 * Resolves which language to display for the current page, in priority order:
 * URL prefix (if already under /en), then stored preference, then browser language.
 * Used by pages that render both languages at once (e.g. the 404 page) to pick
 * which block to show. Like the language banner in Layout.astro, this never navigates.
 */
export function resolveDisplayLang(): Lang {
  if (window.location.pathname.startsWith('/en')) return 'en';
  return getStoredLang() ?? browserLang();
}
