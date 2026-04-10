import { Router } from "express";
import { prisma } from "../prisma.js";

const router = Router();

// GET /google-scripts.js/debug - Debug das configurações (apenas em desenvolvimento)
router.get("/debug", async (req, res) => {
  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: [
            "google_recaptcha_enabled",
            "google_recaptcha_version",
            "google_recaptcha_site_key_v2",
            "google_recaptcha_site_key_v3",
            "google_gtm_enabled",
            "google_gtm_id",
            "google_analytics_enabled",
            "google_analytics_id",
            "google_ads_enabled",
            "google_ads_id",
          ],
        },
      },
    });

    const config = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    
    res.json({
      message: "Configurações do Google",
      settings: settings,
      config: config,
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// GET /google-scripts.js - Retorna script dinâmico com configurações do Google
router.get("/", async (req, res) => {
  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: [
            "google_recaptcha_enabled",
            "google_recaptcha_version",
            "google_recaptcha_site_key_v2",
            "google_recaptcha_site_key_v3",
            "google_gtm_enabled",
            "google_gtm_id",
            "google_analytics_enabled",
            "google_analytics_id",
            "google_ads_enabled",
            "google_ads_id",
          ],
        },
      },
    });

    const config = Object.fromEntries(settings.map((s) => [s.key, s.value]));

    let script = `// Google Scripts - Gerado dinamicamente\nconsole.log('Google Scripts carregado');\n\n`;

    // Google Tag Manager
    if (config.google_gtm_enabled === "true" && config.google_gtm_id) {
      script += `// Google Tag Manager
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${config.google_gtm_id}');
console.log('GTM carregado: ${config.google_gtm_id}');
`;
    }

    // Google Analytics 4 (apenas se GTM não estiver ativo)
    if (
      config.google_gtm_enabled !== "true" &&
      config.google_analytics_enabled === "true" &&
      config.google_analytics_id
    ) {
      script += `
// Google Analytics 4
console.log('Carregando GA4: ${config.google_analytics_id}');
var gaScript = document.createElement('script');
gaScript.async = true;
gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=${config.google_analytics_id}';
document.head.appendChild(gaScript);

window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${config.google_analytics_id}');
console.log('GA4 configurado: ${config.google_analytics_id}');
`;
    }

    // Google Ads (apenas se GTM não estiver ativo)
    if (
      config.google_gtm_enabled !== "true" &&
      config.google_ads_enabled === "true" &&
      config.google_ads_id
    ) {
      script += `
// Google Ads
if (typeof gtag !== 'undefined') {
  gtag('config', '${config.google_ads_id}');
  console.log('Google Ads configurado: ${config.google_ads_id}');
}
`;
    }

    // Google reCAPTCHA
    if (config.google_recaptcha_enabled === "true") {
      if (config.google_recaptcha_version === "v2" && config.google_recaptcha_site_key_v2) {
        script += `
// Google reCAPTCHA v2
var recaptchaScript = document.createElement('script');
recaptchaScript.async = true;
recaptchaScript.defer = true;
recaptchaScript.src = 'https://www.google.com/recaptcha/api.js';
document.head.appendChild(recaptchaScript);
console.log('reCAPTCHA v2 carregado');
`;
      } else if (config.google_recaptcha_version === "v3" && config.google_recaptcha_site_key_v3) {
        script += `
// Google reCAPTCHA v3
var recaptchaScript = document.createElement('script');
recaptchaScript.async = true;
recaptchaScript.defer = true;
recaptchaScript.src = 'https://www.google.com/recaptcha/api.js?render=${config.google_recaptcha_site_key_v3}';
document.head.appendChild(recaptchaScript);
console.log('reCAPTCHA v3 carregado');
`;
      }
    }

    if (script === `// Google Scripts - Gerado dinamicamente\nconsole.log('Google Scripts carregado');\n\n`) {
      script += `console.log('Nenhuma integração Google configurada');`;
    }

    res.setHeader("Content-Type", "application/javascript");
    res.setHeader("Cache-Control", "public, max-age=300"); // Cache por 5 minutos
    res.send(script);
  } catch (error) {
    console.error("Erro ao gerar google-scripts.js:", error);
    res.setHeader("Content-Type", "application/javascript");
    res.send("console.error('Erro ao carregar scripts do Google');");
  }
});

export default router;
