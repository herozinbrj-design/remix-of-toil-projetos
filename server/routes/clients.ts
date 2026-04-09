import { Router } from "express";
import { prisma } from "../prisma.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();
router.use(authMiddleware);

// GET /api/clients
router.get("/", async (req, res) => {
  const { search, active } = req.query;
  const where: Record<string, unknown> = {};
  if (active !== undefined) where.active = active === "true";
  if (search) {
    where.OR = [
      { name: { contains: search as string } },
      { email: { contains: search as string } },
      { company: { contains: search as string } },
    ];
  }
  const clients = await prisma.client.findMany({ where, orderBy: { createdAt: "desc" } });
  res.json(clients);
});

// GET /api/clients/:id
router.get("/:id", async (req, res) => {
  const client = await prisma.client.findUnique({
    where: { id: Number(req.params.id) },
    include: { projects: true, leads: true },
  });
  if (!client) { res.status(404).json({ error: "Cliente não encontrado" }); return; }
  res.json(client);
});

// POST /api/clients
router.post("/", async (req, res) => {
  const client = await prisma.client.create({ data: req.body });
  res.status(201).json(client);
});

// PUT /api/clients/:id
router.put("/:id", async (req, res) => {
  const client = await prisma.client.update({
    where: { id: Number(req.params.id) },
    data: req.body,
  });
  res.json(client);
});

// DELETE /api/clients/:id
router.delete("/:id", async (req, res) => {
  await prisma.client.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: "Cliente removido" });
});

export default router;
