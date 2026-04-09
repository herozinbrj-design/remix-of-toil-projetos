import { Router } from "express";
import { prisma } from "../prisma.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// GET /api/portfolio (público)
router.get("/", async (req, res) => {
  const { status, category, segmentId } = req.query;
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (category) where.category = category;
  if (segmentId) where.segmentId = Number(segmentId);
  const projects = await prisma.portfolio.findMany({
    where,
    include: { client: { select: { id: true, name: true } }, segment: { select: { id: true, name: true } } },
    orderBy: { date: "desc" },
  });
  res.json(projects);
});

// GET /api/portfolio/:id
router.get("/:id", async (req, res) => {
  const project = await prisma.portfolio.findUnique({
    where: { id: Number(req.params.id) },
    include: { client: true, segment: true },
  });
  if (!project) { res.status(404).json({ error: "Projeto não encontrado" }); return; }
  res.json(project);
});

// POST /api/portfolio (protegido)
router.post("/", authMiddleware, async (req, res) => {
  const project = await prisma.portfolio.create({ data: req.body });
  res.status(201).json(project);
});

// PUT /api/portfolio/:id (protegido)
router.put("/:id", authMiddleware, async (req, res) => {
  const project = await prisma.portfolio.update({
    where: { id: Number(req.params.id) },
    data: req.body,
  });
  res.json(project);
});

// DELETE /api/portfolio/:id (protegido)
router.delete("/:id", authMiddleware, async (req, res) => {
  await prisma.portfolio.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: "Projeto removido" });
});

export default router;
