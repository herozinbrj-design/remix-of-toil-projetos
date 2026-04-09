import { useEffect, useState } from "react";

interface RecaptchaConfig {
  enabled: boolean;
  version: string;
  siteKeyV2: string;
  siteKeyV3: string;
}

declare global {
  interface Window {
    grecaptcha: any;
  }
}

export function useRecaptcha() {
  const [config, setConfig] = useState<RecaptchaConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setConfig({
          enabled: data.google_recaptcha_enabled === "true",
          version: data.google_recaptcha_version || "v3",
          siteKeyV2: data.google_recaptcha_site_key_v2 || "",
          siteKeyV3: data.google_recaptcha_site_key_v3 || "",
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar configurações do reCAPTCHA:", err);
        setLoading(false);
      });
  }, []);

  const executeRecaptcha = async (action: string = "submit"): Promise<string | null> => {
    if (!config || !config.enabled) {
      return null;
    }

    try {
      if (config.version === "v3" && config.siteKeyV3) {
        // reCAPTCHA v3 - invisível
        return new Promise((resolve) => {
          if (window.grecaptcha && window.grecaptcha.ready) {
            window.grecaptcha.ready(() => {
              window.grecaptcha
                .execute(config.siteKeyV3, { action })
                .then((token: string) => resolve(token))
                .catch(() => resolve(null));
            });
          } else {
            resolve(null);
          }
        });
      } else if (config.version === "v2" && config.siteKeyV2) {
        // reCAPTCHA v2 - checkbox
        // O token será obtido após o usuário marcar o checkbox
        // Isso deve ser tratado no componente do formulário
        return null;
      }
    } catch (error) {
      console.error("Erro ao executar reCAPTCHA:", error);
      return null;
    }

    return null;
  };

  const renderRecaptchaV2 = (containerId: string) => {
    if (!config || !config.enabled || config.version !== "v2" || !config.siteKeyV2) {
      return;
    }

    if (window.grecaptcha && window.grecaptcha.render) {
      try {
        window.grecaptcha.render(containerId, {
          sitekey: config.siteKeyV2,
        });
      } catch (error) {
        console.error("Erro ao renderizar reCAPTCHA v2:", error);
      }
    }
  };

  const getRecaptchaV2Response = (): string | null => {
    if (!config || !config.enabled || config.version !== "v2") {
      return null;
    }

    if (window.grecaptcha && window.grecaptcha.getResponse) {
      return window.grecaptcha.getResponse();
    }

    return null;
  };

  return {
    config,
    loading,
    executeRecaptcha,
    renderRecaptchaV2,
    getRecaptchaV2Response,
  };
}
