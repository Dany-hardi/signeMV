// ============================================================
// src/utils/url.ts
// Gestion centralisée des URLs et liens de partage du site SigneMV
// ============================================================

/**
 * Calcule l'URL de base réelle du site en priorisant VITE_SITE_URL,
 * puis window.location.origin en fallback dynamique.
 */
export function getSiteBaseUrl(): string {
  const envUrl = import.meta.env.VITE_SITE_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin;
  }
  return 'https://signe-mv.vercel.app';
}

/**
 * Construit un lien de partage valide et directement ouvrable par les lecteurs.
 */
export function buildPoemShareUrl(slug: string): string {
  const baseUrl = getSiteBaseUrl();
  return `${baseUrl}/?poeme=${encodeURIComponent(slug)}`;
}
