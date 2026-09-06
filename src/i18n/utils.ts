import { ui, defaultLang, type Lang, type UiKey } from './ui';

export { languages } from './ui';
export type { Lang, UiKey } from './ui';

/** Returns a translator function `t(key)` with fallback to the default locale. */
export function useTranslations(lang: Lang) {
  return function t(key: UiKey): string {
    return (ui[lang] as Record<UiKey, string>)[key] ?? ui[defaultLang][key];
  };
}

/** Prefixes a root-relative path with the locale (default locale stays unprefixed). */
export function localizePath(path: string, lang: Lang): string {
  if (lang === defaultLang) return path;
  return `/${lang}${path === '/' ? '/' : path}`;
}

/** Maps the current URL path to its equivalent in the target locale. */
export function switchLangPath(currentPath: string, targetLang: Lang): string {
  const base = currentPath.replace(/^\/en(?=\/|$)/, '') || '/';
  return localizePath(base, targetLang);
}
