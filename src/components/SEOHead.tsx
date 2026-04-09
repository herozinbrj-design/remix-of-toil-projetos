import { Helmet } from "react-helmet-async";
import { useSettings } from "@/hooks/useSettings";

interface SEOHeadProps {
  /** Título específico da página (será concatenado com o nome do site) */
  title?: string;
  /** Descrição específica da página */
  description?: string;
  /** URL canônica completa desta página */
  canonical?: string;
  /** Imagem OG específica desta página */
  ogImage?: string;
  /** Tipo OG: website | article | product */
  ogType?: string;
  /** Não indexar esta página */
  noIndex?: boolean;
}

export default function SEOHead({
  title,
  description,
  canonical,
  ogImage,
  ogType = "website",
  noIndex = false,
}: SEOHeadProps) {
  const { settings: s } = useSettings();
  if (!s) return null;

  const siteName = s.site_name || "Toil Projetos";
  const siteCanonical = (s.site_canonical_url || "").replace(/\/$/, "");

  const resolvedTitle = title
    ? `${title} | ${siteName}`
    : s.site_meta_title || siteName;

  const resolvedDescription = description || s.site_meta_description || "";
  const resolvedCanonical = canonical || siteCanonical || undefined;
  const resolvedOgImage =
    ogImage ||
    s.seo_og_image ||
    "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/8af853ab-25e7-4ff0-b001-1760364cd283/id-preview-0a76e6fa--0c873096-1dc1-437e-8e74-cfba3c04d553.lovable.app-1773758158124.png";

  const locale = s.seo_og_locale || "pt_BR";
  const twitterCard = s.seo_twitter_card || "summary_large_image";
  const twitterHandle = s.seo_twitter_handle || "";

  // Robots
  const globalIndex = s.seo_robots_index !== "false";
  const globalFollow = s.seo_robots_follow !== "false";
  const robotsContent = noIndex
    ? "noindex, nofollow"
    : `${globalIndex ? "index" : "noindex"}, ${globalFollow ? "follow" : "nofollow"}`;

  // Schema.org LocalBusiness JSON-LD
  const schemaEnabled = s.seo_schema_enabled !== "false";
  let jsonLd: object | null = null;

  if (schemaEnabled && siteCanonical) {
    const schemaType = s.seo_schema_type || "LocalBusiness";
    const openingHours = s.seo_schema_opening_hours
      ? s.seo_schema_opening_hours.split(",").map((h) => h.trim())
      : undefined;

    jsonLd = {
      "@context": "https://schema.org",
      "@type": schemaType,
      name: siteName,
      description: resolvedDescription,
      url: siteCanonical,
      telephone: s.site_phone || undefined,
      email: s.site_email || undefined,
      ...(s.seo_schema_price_range && { priceRange: s.seo_schema_price_range }),
      ...(openingHours && { openingHours }),
      address: {
        "@type": "PostalAddress",
        streetAddress: s.site_address || undefined,
        addressLocality: "São Paulo",
        addressRegion: "SP",
        postalCode: s.seo_schema_zip || undefined,
        addressCountry: "BR",
      },
      ...(s.seo_schema_lat &&
        s.seo_schema_lng && {
          geo: {
            "@type": "GeoCoordinates",
            latitude: parseFloat(s.seo_schema_lat),
            longitude: parseFloat(s.seo_schema_lng),
          },
        }),
      sameAs: [
        s.site_instagram,
        s.site_facebook,
        s.site_linkedin,
      ].filter(Boolean),
      image: resolvedOgImage,
    };
  }

  return (
    <Helmet>
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDescription} />
      {s.seo_keywords && <meta name="keywords" content={s.seo_keywords} />}
      <meta name="robots" content={robotsContent} />
      {resolvedCanonical && <link rel="canonical" href={resolvedCanonical} />}

      {/* Google Search Console */}
      {s.seo_google_verification && (
        <meta name="google-site-verification" content={s.seo_google_verification} />
      )}
      {/* Bing Webmaster */}
      {s.seo_bing_verification && (
        <meta name="msvalidate.01" content={s.seo_bing_verification} />
      )}

      {/* Open Graph */}
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:locale" content={locale} />
      <meta property="og:site_name" content={siteName} />
      {resolvedCanonical && <meta property="og:url" content={resolvedCanonical} />}
      <meta property="og:image" content={resolvedOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter / X */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      <meta name="twitter:image" content={resolvedOgImage} />
      {twitterHandle && <meta name="twitter:site" content={twitterHandle} />}

      {/* JSON-LD Schema.org */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd, null, 2)}
        </script>
      )}
    </Helmet>
  );
}
