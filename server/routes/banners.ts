import { Router } from "express";
import { prisma } from "../prisma.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// GET /api/banners (público)
router.get("/", async (req, res) => {
  const { active } = req.query;
  const where: Record<string, unknown> = {};
  if (active !== undefined) where.active = active === "true";
  const banners = await prisma.banner.findMany({ where, orderBy: { order: "asc" } });
  res.json(banners);
});

// POST /api/banners (protegido)
router.post("/", authMiddleware, async (req, res) => {
  const banner = await prisma.banner.create({ data: req.body });
  res.status(201).json(banner);
});

// PUT /api/banners/:id (protegido)
router.put("/:id", authMiddleware, async (req, res) => {
  const banner = await prisma.banner.update({
    where: { id: Number(req.params.id) },
    data: req.body,
  });
  res.json(banner);
});

// DELETE /api/banners/:id (protegido)
router.delete("/:id", authMiddleware, async (req, res) => {
  await prisma.banner.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: "Banner removido" });
});

export default router;
