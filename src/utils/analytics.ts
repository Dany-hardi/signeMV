// ============================================================
// src/utils/analytics.ts
// Dynamic Google Analytics 4 (GA4) Tracker
// ============================================================

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Initializes Google Analytics 4 (GA4) dynamically.
 * Accepts a Measurement ID (e.g. G-XXXXXXXXXX) or reads VITE_GA_MEASUREMENT_ID from env.
 */
export function initGoogleAnalytics(measurementId?: string): void {
  const gaId = measurementId || import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!gaId || typeof window === 'undefined') return;

  // Prevent duplicate script loading
  if (document.getElementById('ga-gtag-script')) return;

  // Inject Google Tag Manager / GA4 script tag
  const script = document.createElement('script');
  script.id = 'ga-gtag-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);

  // Setup dataLayer and gtag function
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', gaId, { send_page_view: true });
}

/**
 * Tracks route or page view changes for SPA navigation.
 */
export function trackPageView(pagePath: string, pageTitle?: string): void {
  if (typeof window !== 'undefined' && window.gtag) {
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (gaId) {
      window.gtag('config', gaId, {
        page_path: pagePath,
        page_title: pageTitle || document.title,
      });
    }
  }
}

/**
 * Tracks custom user interactions (e.g., reading a poem, liking, newsletter).
 */
export function trackEvent(action: string, category: string, label?: string, value?: number): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}
