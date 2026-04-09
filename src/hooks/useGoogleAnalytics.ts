import { useEffect } from "react";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export function useGoogleAnalytics() {
  useEffect(() => {
    // Inicializar dataLayer se não existir
    if (!window.dataLayer) {
      window.dataLayer = [];
    }
  }, []);

  const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
    if (window.gtag) {
      window.gtag("event", eventName, eventParams);
    } else if (window.dataLayer) {
      window.dataLayer.push({
        event: eventName,
        ...eventParams,
      });
    }
  };

  const trackPageView = (path: string, title?: string) => {
    if (window.gtag) {
      window.gtag("config", "GA_MEASUREMENT_ID", {
        page_path: path,
        page_title: title,
      });
    } else if (window.dataLayer) {
      window.dataLayer.push({
        event: "pageview",
        page_path: path,
        page_title: title,
      });
    }
  };

  const trackConversion = (conversionId: string, conversionLabel?: string, value?: number) => {
    if (window.gtag) {
      window.gtag("event", "conversion", {
        send_to: `${conversionId}/${conversionLabel}`,
        value: value,
        currency: "BRL",
      });
    } else if (window.dataLayer) {
      window.dataLayer.push({
        event: "conversion",
        conversion_id: conversionId,
        conversion_label: conversionLabel,
        value: value,
        currency: "BRL",
      });
    }
  };

  const trackFormSubmit = (formName: string) => {
    trackEvent("form_submit", {
      form_name: formName,
    });
  };

  const trackButtonClick = (buttonName: string, buttonLocation?: string) => {
    trackEvent("button_click", {
      button_name: buttonName,
      button_location: buttonLocation,
    });
  };

  return {
    trackEvent,
    trackPageView,
    trackConversion,
    trackFormSubmit,
    trackButtonClick,
  };
}
