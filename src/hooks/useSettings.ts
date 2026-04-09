import { useState, useEffect } from "react";

export interface SiteSettings {
  // Geral
  site_name: string;
  site_phone: string;
  site_email: string;
  site_address: string;
  site_whatsapp: string;
  // SEO básico
  site_meta_title: string;
  site_meta_description: string;
  site_canonical_url: string;
  seo_keywords: string;
  // Open Graph
  seo_og_image: string;
  seo_og_locale: string;
  // Twitter/X
  seo_twitter_card: string;
  seo_twitter_handle: string;
  // Schema.org
  seo_schema_enabled: string;
  seo_schema_type: string;
  seo_schema_lat: string;
  seo_schema_lng: string;
  seo_schema_zip: string;
  seo_schema_opening_hours: string;
  seo_schema_price_range: string;
  // Verificação buscadores
  seo_google_verification: string;
  seo_bing_verification: string;
  // Robots
  seo_robots_index: string;
  seo_robots_follow: string;
  // Sitemap
  seo_sitemap_enabled: string;
  // AI
  seo_ai_allowed: string;
  seo_ai_summary: string;
  // Outros (indexação livre)
  [key: string]: string;
}

let cachedSettings: SiteSettings | null = null;
let cacheTime = 0;
const CACHE_TTL = 60_000; // 1 minuto

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(cachedSettings);
  const [loading, setLoading] = useState(!cachedSettings);

  useEffect(() => {
    const now = Date.now();
    if (cachedSettings && now - cacheTime < CACHE_TTL) {
      setSettings(cachedSettings);
      setLoading(false);
      return;
    }
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        cachedSettings = data;
        cacheTime = Date.now();
        setSettings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { settings, loading };
}
