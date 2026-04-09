import { Router } from "express";
import { prisma } from "../prisma.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// GET /api/settings (público)
router.get("/", async (_req, res) => {
  const settings = await prisma.setting.findMany();
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  res.json(map);
});

// PUT /api/settings (protegido - atualiza múltiplas configs)
router.put("/", authMiddleware, async (req, res) => {
  const entries = Object.entries(req.body) as [string, string][];
  await Promise.all(
    entries.map(([key, value]) =>
      prisma.setting.upsert({ where: { key }, create: { key, value }, update: { value } })
    )
  );
  res.json({ message: "Configurações atualizadas" });
});

export default router;
