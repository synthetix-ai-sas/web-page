import { ui, defaultLang, type Lang, type UiKey } from './ui';
import { slugMap, reverseSlugMap } from './routes';

export { languages } from './ui';
export type { Lang, UiKey } from './ui';

/** Returns a translator function `t(key)` with fallback to the default locale. */
export function useTranslations(lang: Lang) {
  return function t(key: UiKey): string {
    return (ui[lang] as Record<UiKey, string>)[key] ?? ui[defaultLang][key];
  };
}

/**
 * Ensures a root-relative path (optionally with a #fragment) ends in a
 * trailing slash before the fragment, matching astro.config.mjs's
 * `trailingSlash: 'always'` (and the trailing-slash URLs that canonical,
 * hreflang, and the sitemap already emit).
 */
function withTrailingSlash(path: string): string {
  const hashIndex = path.indexOf('#');
  const base = hashIndex === -1 ? path : path.slice(0, hashIndex);
  const hash = hashIndex === -1 ? '' : path.slice(hashIndex);
  const slashedBase = base.endsWith('/') ? base : `${base}/`;
  return `${slashedBase}${hash}`;
}

/**
 * Translates the leading path segment through `map` (e.g. ES slug -> EN
 * slug), leaving any `#fragment` suffix untouched. A segment with no entry
 * in `map` (including the empty segment for `/`) passes through unchanged.
 */
function translateSlug(path: string, map: Record<string, string>): string {
  const hashIndex = path.indexOf('#');
  const base = hashIndex === -1 ? path : path.slice(0, hashIndex);
  const hash = hashIndex === -1 ? '' : path.slice(hashIndex);
  const segments = base.split('/');
  if (segments[1] && map[segments[1]]) {
    segments[1] = map[segments[1]];
  }
  return `${segments.join('/')}${hash}`;
}

/**
 * Prefixes a root-relative Spanish path with the locale, translating the
 * route slug via `slugMap` for `en` (default locale stays unprefixed and
 * untranslated — Spanish slugs are canonical).
 */
export function localizePath(path: string, lang: Lang): string {
  if (lang === defaultLang) return withTrailingSlash(path);
  const translated = translateSlug(path, slugMap);
  const prefixed = `/${lang}${translated === '/' ? '' : translated}`;
  return withTrailingSlash(prefixed);
}

/** Maps the current URL path to its equivalent in the target locale. */
export function switchLangPath(currentPath: string, targetLang: Lang): string {
  const withoutPrefix = currentPath.replace(/^\/en(?=\/|$)/, '') || '/';
  const base = withoutPrefix === '/' ? '/' : translateSlug(withoutPrefix, reverseSlugMap);
  return localizePath(base, targetLang);
}
