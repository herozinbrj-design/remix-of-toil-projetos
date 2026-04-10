import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { prisma } from "../prisma.js";

const router = Router();

// GET /api/analytics/stats - Buscar estatísticas do Google Analytics
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    // Buscar configurações do Google Analytics
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: ["google_analytics_enabled", "google_analytics_id"],
        },
      },
    });

    const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    const analyticsEnabled = settingsMap.google_analytics_enabled === "true";
    const analyticsId = settingsMap.google_analytics_id;

    if (!analyticsEnabled || !analyticsId) {
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

    // Retornar indicação de que Analytics está configurado mas dados não estão disponíveis
    // Para obter dados reais, seria necessário configurar Google Analytics Data API
    // com Service Account e credenciais
    res.json({
      enabled: true,
      message: "Google Analytics configurado. Dados em tempo real disponíveis no Google Analytics.",
      stats: {
        visitors: 0,
        pageviews: 0,
        sessions: 0,
        bounceRate: 0,
        avgSessionDuration: 0,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar analytics:", error);
    res.status(500).json({ error: "Erro ao buscar dados do Analytics" });
  }
});

export default router;
