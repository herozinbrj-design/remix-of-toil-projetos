import { Router } from "express";
import { prisma } from "../prisma.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// GET /api/services (público)
router.get("/", async (req, res) => {
  const { active, showOnHome } = req.query;
  const where: Record<string, unknown> = {};
  if (active !== undefined) where.active = active === "true";
  if (showOnHome !== undefined) where.showOnHome = showOnHome === "true";
  const services = await prisma.service.findMany({ where, orderBy: { order: "asc" } });
  res.json(services);
});

// GET /api/services/:id
router.get("/:id", async (req, res) => {
  const service = await prisma.service.findUnique({ where: { id: Number(req.params.id) } });
  if (!service) { res.status(404).json({ error: "Serviço não encontrado" }); return; }
  res.json(service);
});

// POST /api/services (protegido)
router.post("/", authMiddleware, async (req, res) => {
  const service = await prisma.service.create({ data: req.body });
  res.status(201).json(service);
});

// PUT /api/services/:id (protegido)
router.put("/:id", authMiddleware, async (req, res) => {
  const service = await prisma.service.update({
    where: { id: Number(req.params.id) },
    data: req.body,
  });
  res.json(service);
});

// DELETE /api/services/:id (protegido)
router.delete("/:id", authMiddleware, async (req, res) => {
  await prisma.service.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: "Serviço removido" });
});

export default router;
