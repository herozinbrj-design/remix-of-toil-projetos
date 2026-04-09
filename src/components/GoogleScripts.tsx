import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";

interface GoogleConfig {
  recaptchaEnabled: boolean;
  recaptchaVersion: string;
  recaptchaSiteKeyV2: string;
  recaptchaSiteKeyV3: string;
  gtmEnabled: boolean;
  gtmId: string;
  analyticsEnabled: boolean;
  analyticsId: string;
  adsEnabled: boolean;
  adsId: string;
}

export default function GoogleScripts() {
  const [config, setConfig] = useState<GoogleConfig | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setConfig({
          recaptchaEnabled: data.google_recaptcha_enabled === "true",
          recaptchaVersion: data.google_recaptcha_version || "v3",
          recaptchaSiteKeyV2: data.google_recaptcha_site_key_v2 || "",
          recaptchaSiteKeyV3: data.google_recaptcha_site_key_v3 || "",
          gtmEnabled: data.google_gtm_enabled === "true",
          gtmId: data.google_gtm_id || "",
          analyticsEnabled: data.google_analytics_enabled === "true",
          analyticsId: data.google_analytics_id || "",
          adsEnabled: data.google_ads_enabled === "true",
          adsId: data.google_ads_id || "",
        });
      })
      .catch((err) => console.error("Erro ao carregar configurações do Google:", err));
  }, []);

  if (!config) return null;

  return (
    <Helmet>
      {/* Google Tag Manager */}
      {config.gtmEnabled && config.gtmId && (
        <>
          <script>
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${config.gtmId}');
            `}
          </script>
          <noscript>
            {`<iframe src="https://www.googletagmanager.com/ns.html?id=${config.gtmId}"
              height="0" width="0" style="display:none;visibility:hidden"></iframe>`}
          </noscript>
        </>
      )}

      {/* Google Analytics 4 (apenas se GTM não estiver ativo) */}
      {!config.gtmEnabled && config.analyticsEnabled && config.analyticsId && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${config.analyticsId}`} />
          <script>
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${config.analyticsId}');
            `}
          </script>
        </>
      )}

      {/* Google Ads (apenas se GTM não estiver ativo) */}
      {!config.gtmEnabled && config.adsEnabled && config.adsId && (
        <script>
          {`
            gtag('config', '${config.adsId}');
          `}
        </script>
      )}

      {/* Google reCAPTCHA v2 */}
      {config.recaptchaEnabled && config.recaptchaVersion === "v2" && config.recaptchaSiteKeyV2 && (
        <script src="https://www.google.com/recaptcha/api.js" async defer />
      )}

      {/* Google reCAPTCHA v3 */}
      {config.recaptchaEnabled && config.recaptchaVersion === "v3" && config.recaptchaSiteKeyV3 && (
        <script src={`https://www.google.com/recaptcha/api.js?render=${config.recaptchaSiteKeyV3}`} async defer />
      )}
    </Helmet>
  );
}
