import { Router } from "express";
import { prisma } from "../prisma.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// GET /api/seo-segments (público)
router.get("/", async (req, res) => {
  const { active } = req.query;
  const where: Record<string, unknown> = {};
  if (active !== undefined) where.active = active === "true";
  const segments = await prisma.seoSegment.findMany({ where, orderBy: { order: "asc" } });
  res.json(segments);
});

// GET /api/seo-segments/:idOrSlug (público)
router.get("/:idOrSlug", async (req, res) => {
  const { idOrSlug } = req.params;
  const isNumeric = /^\d+$/.test(idOrSlug);
  
  try {
    const segment = await prisma.seoSegment.findFirst({
      where: isNumeric ? { id: Number(idOrSlug) } : { slug: idOrSlug },
    });
    
    if (!segment) {
      return res.status(404).json({ error: "Segmento não encontrado" });
    }
    
    res.json(segment);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar segmento" });
  }
});

// POST /api/seo-segments (protegido)
router.post("/", authMiddleware, async (req, res) => {
  const segment = await prisma.seoSegment.create({ data: req.body });
  res.status(201).json(segment);
});

// PUT /api/seo-segments/:id (protegido)
router.put("/:id", authMiddleware, async (req, res) => {
  const segment = await prisma.seoSegment.update({
    where: { id: Number(req.params.id) },
    data: req.body,
  });
  res.json(segment);
});

// DELETE /api/seo-segments/:id (protegido)
router.delete("/:id", authMiddleware, async (req, res) => {
  await prisma.seoSegment.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: "Segmento removido" });
});

export default router;
