import { Router } from "express";
import { prisma } from "../prisma.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// GET /api/segments (público)
router.get("/", async (req, res) => {
  const { active } = req.query;
  const where: Record<string, unknown> = {};
  if (active !== undefined) where.active = active === "true";
  const segments = await prisma.segment.findMany({ where, orderBy: { order: "asc" } });
  res.json(segments);
});

// POST /api/segments (protegido)
router.post("/", authMiddleware, async (req, res) => {
  const segment = await prisma.segment.create({ data: req.body });
  res.status(201).json(segment);
});

// PUT /api/segments/:id (protegido)
router.put("/:id", authMiddleware, async (req, res) => {
  const segment = await prisma.segment.update({
    where: { id: Number(req.params.id) },
    data: req.body,
  });
  res.json(segment);
});

// DELETE /api/segments/:id (protegido)
router.delete("/:id", authMiddleware, async (req, res) => {
  await prisma.segment.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: "Segmento removido" });
});

export default router;
