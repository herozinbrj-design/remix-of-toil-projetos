import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma.js";
import { generateToken, authMiddleware, AuthRequest } from "../middleware/auth.js";
import { getUserPermissions } from "../middleware/permissions.js";

const router = Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active) {
    res.status(401).json({ error: "Credenciais inválidas" });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ error: "Credenciais inválidas" });
    return;
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

  const token = generateToken(user.id, user.role);
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
  });
});

// GET /api/auth/me
router.get("/me", authMiddleware, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, name: true, email: true, role: true, avatar: true },
  });
  if (!user) {
    res.status(404).json({ error: "Usuário não encontrado" });
    return;
  }
  
  // Buscar permissões do usuário
  const permissions = await getUserPermissions(user.id, user.role);
  
  res.json({ ...user, permissions });
});

export default router;
