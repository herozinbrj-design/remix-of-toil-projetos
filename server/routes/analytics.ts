import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

const router = Router();

// GET /api/analytics/stats - Buscar estatísticas do Google Analytics
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    // Buscar configurações do Google Analytics
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: ["google_analytics_enabled", "google_analytics_property_id"],
        },
      },
    });

    const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    const analyticsEnabled = settingsMap.google_analytics_enabled === "true";
    const propertyId = settingsMap.google_analytics_property_id;

    if (!analyticsEnabled || !propertyId) {
      return res.json({
        enabled: false,
        message: "Google Analytics não configurado",
        stats: {
          visitors: 0,
          pageviews: 0,
          sessions: 0,
          bounceRate: 0,
          avgSessionDuration: 0,
        },
      });
    }

    // Verificar se há credenciais configuradas
    const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    
    if (!credentialsJson) {
      return res.json({
        enabled: true,
        message: "Credenciais do Google Analytics não configuradas. Adicione GOOGLE_APPLICATION_CREDENTIALS_JSON nas variáveis de ambiente.",
        stats: {
          visitors: 0,
          pageviews: 0,
          sessions: 0,
          bounceRate: 0,
          avgSessionDuration: 0,
        },
      });
    }

    // Criar cliente do Google Analytics
    const credentials = JSON.parse(credentialsJson);
    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials,
    });

    // Buscar dados dos últimos 30 dias
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: "30daysAgo",
          endDate: "today",
        },
      ],
      metrics: [
        { name: "activeUsers" },
        { name: "screenPageViews" },
        { name: "sessions" },
        { name: "bounceRate" },
        { name: "averageSessionDuration" },
      ],
    });

    const row = response.rows?.[0];
    
    if (!row || !row.metricValues) {
      return res.json({
        enabled: true,
        message: "Dados do Google Analytics ainda não disponíveis",
        stats: {
          visitors: 0,
          pageviews: 0,
          sessions: 0,
          bounceRate: 0,
          avgSessionDuration: 0,
        },
      });
    }

    const stats = {
      visitors: parseInt(row.metricValues[0]?.value || "0"),
      pageviews: parseInt(row.metricValues[1]?.value || "0"),
      sessions: parseInt(row.metricValues[2]?.value || "0"),
      bounceRate: Math.round(parseFloat(row.metricValues[3]?.value || "0") * 100),
      avgSessionDuration: Math.round(parseFloat(row.metricValues[4]?.value || "0")),
    };

    res.json({
      enabled: true,
      message: "Dados do Google Analytics carregados com sucesso",
      stats,
    });
  } catch (error: any) {
    console.error("Erro ao buscar analytics:", error);
    res.json({
      enabled: false,
      message: `Erro ao buscar dados: ${error.message}`,
      stats: {
        visitors: 0,
        pageviews: 0,
        sessions: 0,
        bounceRate: 0,
        avgSessionDuration: 0,
      },
    });
  }
});

export default router;
