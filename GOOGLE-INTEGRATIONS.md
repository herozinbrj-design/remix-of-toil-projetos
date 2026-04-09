# Integrações Google - Guia de Uso

Este documento explica como usar as integrações do Google implementadas no projeto.

## 📦 O que foi implementado

### 1. Google Tag Manager (GTM)
- **Não requer biblioteca npm**
- Script injetado automaticamente no `<head>` quando ativado
- Gerencia todas as outras tags (Analytics, Ads, etc.)

### 2. Google Analytics 4 (GA4)
- **Não requer biblioteca npm**
- Script injetado automaticamente quando ativado
- Se GTM estiver ativo, configure o Analytics através dele (recomendado)

### 3. Google reCAPTCHA (v2 e v3)
- **Não requer biblioteca npm**
- Scripts carregados automaticamente quando ativado
- Hook `useRecaptcha()` disponível para uso nos formulários

### 4. Google Ads (Conversões)
- **Não requer biblioteca npm**
- Script injetado automaticamente quando ativado
- Se GTM estiver ativo, configure as conversões através dele (recomendado)

## 🚀 Como Configurar

### 1. Acesse o Painel Admin
```
/admin/configuracoes?secao=google
```

### 2. Configure cada serviço:

#### Google Tag Manager
1. Ative o GTM
2. Cole o Container ID (formato: GTM-XXXXXXX)
3. Salve

#### Google Analytics
1. Ative o Analytics
2. Cole o Measurement ID (formato: G-XXXXXXXXXX)
3. Salve

#### Google reCAPTCHA
1. Ative o reCAPTCHA
2. Escolha a versão (v2 ou v3)
3. Cole as chaves (Site Key e Secret Key)
4. Salve

#### Google Ads
1. Ative o Google Ads
2. Cole o Conversion ID (formato: AW-XXXXXXXXXX)
3. Salve

## 💻 Como Usar no Código

### Google Analytics - Rastrear Eventos

```typescript
import { useGoogleAnalytics } from "@/hooks/useGoogleAnalytics";

function MyComponent() {
  const { trackEvent, trackFormSubmit, trackButtonClick } = useGoogleAnalytics();

  const handleClick = () => {
    trackButtonClick("cta_button", "homepage");
  };

  const handleSubmit = () => {
    trackFormSubmit("contact_form");
  };

  return (
    <button onClick={handleClick}>Clique aqui</button>
  );
}
```

### reCAPTCHA v3 (Invisível)

```typescript
import { useRecaptcha } from "@/hooks/useRecaptcha";

function ContactForm() {
  const { executeRecaptcha } = useRecaptcha();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Executar reCAPTCHA v3
    const token = await executeRecaptcha("contact_form");

    // Enviar token junto com o formulário
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        recaptchaToken: token,
      }),
    });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### reCAPTCHA v2 (Checkbox)

```typescript
import { useRecaptcha } from "@/hooks/useRecaptcha";
import { useEffect, useRef } from "react";

function ContactForm() {
  const { renderRecaptchaV2, getRecaptchaV2Response } = useRecaptcha();
  const recaptchaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (recaptchaRef.current) {
      renderRecaptchaV2("recaptcha-container");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Obter resposta do reCAPTCHA v2
    const token = getRecaptchaV2Response();

    if (!token) {
      alert("Por favor, complete o reCAPTCHA");
      return;
    }

    // Enviar token junto com o formulário
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        recaptchaToken: token,
      }),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Seus campos do formulário */}
      
      {/* Container do reCAPTCHA v2 */}
      <div id="recaptcha-container" ref={recaptchaRef}></div>
      
      <button type="submit">Enviar</button>
    </form>
  );
}
```

### Rastrear Conversões do Google Ads

```typescript
import { useGoogleAnalytics } from "@/hooks/useGoogleAnalytics";

function ThankYouPage() {
  const { trackConversion } = useGoogleAnalytics();

  useEffect(() => {
    // Rastrear conversão quando a página carregar
    trackConversion("AW-XXXXXXXXXX", "conversion_label", 100);
  }, []);

  return <div>Obrigado pela sua compra!</div>;
}
```

## 🔒 Validação no Backend (reCAPTCHA)

Para validar o token do reCAPTCHA no backend:

```typescript
// server/routes/leads.ts
import fetch from "node-fetch";

router.post("/", async (req, res) => {
  const { recaptchaToken, ...leadData } = req.body;

  // Buscar configuração do reCAPTCHA
  const settings = await prisma.setting.findMany({
    where: {
      key: {
        in: ["google_recaptcha_enabled", "google_recaptcha_version", 
             "google_recaptcha_secret_key_v2", "google_recaptcha_secret_key_v3"],
      },
    },
  });

  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  
  if (settingsMap.google_recaptcha_enabled === "true" && recaptchaToken) {
    const secretKey = settingsMap.google_recaptcha_version === "v3"
      ? settingsMap.google_recaptcha_secret_key_v3
      : settingsMap.google_recaptcha_secret_key_v2;

    // Validar token com Google
    const verifyResponse = await fetch(
      `https://www.google.com/recaptcha/api/siteverify`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${secretKey}&response=${recaptchaToken}`,
      }
    );

    const verifyData = await verifyResponse.json();

    if (!verifyData.success) {
      return res.status(400).json({ error: "Falha na verificação do reCAPTCHA" });
    }

    // Para v3, verificar o score (0.0 a 1.0)
    if (settingsMap.google_recaptcha_version === "v3" && verifyData.score < 0.5) {
      return res.status(400).json({ error: "Score do reCAPTCHA muito baixo" });
    }
  }

  // Continuar com o processamento do lead...
  const lead = await prisma.lead.create({ data: leadData });
  res.status(201).json(lead);
});
```

## 📊 Dashboard - Dados do Google Analytics

O dashboard já está configurado para buscar dados do Google Analytics:

- Visitantes (mês)
- Visualizações de Página
- Sessões
- Taxa de Rejeição
- Duração Média da Sessão
- Páginas por Sessão

Os dados são buscados automaticamente da rota `/api/analytics/stats`.

## ⚠️ Notas Importantes

1. **GTM é recomendado**: Se você usar GTM, configure Analytics e Ads através dele, não diretamente
2. **reCAPTCHA v3 vs v2**: 
   - v3 é invisível e funciona em segundo plano
   - v2 exibe um checkbox que o usuário precisa marcar
3. **Validação Backend**: Sempre valide o token do reCAPTCHA no backend para segurança
4. **GDPR/LGPD**: Adicione um banner de cookies se necessário para compliance

## 🔗 Links Úteis

- [Google Tag Manager](https://tagmanager.google.com)
- [Google Analytics](https://analytics.google.com)
- [Google reCAPTCHA](https://www.google.com/recaptcha/admin)
- [Google Ads](https://ads.google.com)
