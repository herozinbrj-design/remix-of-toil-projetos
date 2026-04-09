import { Router } from "express";
import { prisma } from "../prisma.js";
import { authMiddleware } from "../middleware/auth.js";
import { requirePermission } from "../middleware/permissions.js";
import { sendLeadNotification } from "../lib/mailer.js";

const router = Router();

// POST /api/leads (público - formulário de contato)
router.post("/", async (req, res) => {
  try {
    console.log("Recebendo lead:", req.body);
    const lead = await prisma.lead.create({ 
      data: {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        service: req.body.service,
        message: req.body.message,
        source: req.body.source || "site",
        status: "NOVO",
      }
    });
    console.log("Lead criado com sucesso:", lead.id);
    
    // Enviar e-mail de notificação (não bloqueia a resposta)
    sendLeadNotification({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      service: req.body.service,
      message: req.body.message,
    }).catch((err) => console.error("Erro ao enviar e-mail:", err));
    
    res.status(201).json(lead);
  } catch (error) {
    console.error("Erro ao criar lead:", error);
    res.status(500).json({ error: "Erro ao processar solicitação" });
  }
});

// GET /api/leads (protegido)
router.get("/", authMiddleware, requirePermission("view_leads"), async (req, res) => {
  const { status } = req.query;
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  const leads = await prisma.lead.findMany({
    where,
    include: { client: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(leads);
});

// GET /api/leads/:id (protegido)
router.get("/:id", authMiddleware, requirePermission("view_leads"), async (req, res) => {
  const lead = await prisma.lead.findUnique({
    where: { id: Number(req.params.id) },
    include: { client: true },
  });
  if (!lead) { res.status(404).json({ error: "Lead não encontrado" }); return; }
  res.json(lead);
});

// PUT /api/leads/:id (protegido)
router.put("/:id", authMiddleware, requirePermission("edit_leads"), async (req, res) => {
  const lead = await prisma.lead.update({
    where: { id: Number(req.params.id) },
    data: req.body,
  });
  res.json(lead);
});

// DELETE /api/leads/:id (protegido)
router.delete("/:id", authMiddleware, requirePermission("delete_leads"), async (req, res) => {
  await prisma.lead.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: "Lead removido" });
});

export default router;
