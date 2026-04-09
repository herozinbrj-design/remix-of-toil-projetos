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

    // Por enquanto, retornar dados mockados
    // TODO: Implementar integração real com Google Analytics Data API
    // Requer configuração de Service Account e credenciais
    res.json({
      enabled: true,
      message: "Dados simulados - Configure Service Account para dados reais",
      stats: {
        visitors: Math.floor(Math.random() * 5000) + 3000,
        pageviews: Math.floor(Math.random() * 15000) + 10000,
        sessions: Math.floor(Math.random() * 6000) + 4000,
        bounceRate: Math.floor(Math.random() * 30) + 40,
        avgSessionDuration: Math.floor(Math.random() * 180) + 120,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar analytics:", error);
    res.status(500).json({ error: "Erro ao buscar dados do Analytics" });
  }
});

export default router;
