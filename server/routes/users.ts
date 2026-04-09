import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();
router.use(authMiddleware);

// Middleware para verificar se é SUPER_ADMIN
const requireSuperAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "Acesso negado. Apenas SUPER_ADMIN pode realizar esta ação." });
  }
  next();
};

// GET /api/users - Listar todos os usuários
router.get("/", async (_req, res) => {
  const users = await prisma.user.findMany({
    select: { 
      id: true, 
      name: true, 
      email: true, 
      role: true, 
      avatar: true, 
      active: true, 
      lastLogin: true, 
      createdAt: true,
      updatedAt: true 
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(users);
});

// GET /api/users/:id - Buscar usuário específico
router.get("/:id", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(req.params.id) },
    select: { 
      id: true, 
      name: true, 
      email: true, 
      role: true, 
      avatar: true, 
      active: true, 
      lastLogin: true, 
      createdAt: true,
      updatedAt: true 
    },
  });
  if (!user) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }
  res.json(user);
});

// POST /api/users - Criar novo usuário (apenas SUPER_ADMIN)
router.post("/", requireSuperAdmin, async (req, res) => {
  try {
    const { name, email, password, role, active } = req.body;
    
    // Validações
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Nome, email e senha são obrigatórios" });
    }

    // Não permitir criar SUPER_ADMIN pela API
    if (role === "SUPER_ADMIN") {
      return res.status(403).json({ error: "Não é possível criar SUPER_ADMIN pela interface. Use o banco de dados diretamente." });
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { 
        name, 
        email, 
        password: hash, 
        role: role || "EDITOR",
        active: active !== undefined ? active : true
      },
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    });
    res.status(201).json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Erro ao criar usuário" });
  }
});

// PUT /api/users/:id - Atualizar usuário
router.put("/:id", async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { name, email, password, role, active } = req.body;
    const currentUser = req.user;

    // Buscar usuário a ser editado
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Apenas SUPER_ADMIN pode alterar roles e editar outros SUPER_ADMINs
    if (targetUser.role === "SUPER_ADMIN" && currentUser?.role !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "Apenas SUPER_ADMIN pode editar outro SUPER_ADMIN" });
    }

    // Não permitir alterar para SUPER_ADMIN pela API
    if (role === "SUPER_ADMIN" && targetUser.role !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "Não é possível promover usuário para SUPER_ADMIN pela interface" });
    }

    // Apenas SUPER_ADMIN pode alterar roles
    if (role !== undefined && role !== targetUser.role && currentUser?.role !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "Apenas SUPER_ADMIN pode alterar permissões" });
    }

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (role !== undefined && role !== "SUPER_ADMIN") data.role = role;
    if (active !== undefined) data.active = active;
    if (password) data.password = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true, role: true, active: true, updatedAt: true },
    });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Erro ao atualizar usuário" });
  }
});

// PUT /api/users/:id/password - Alterar senha
router.put("/:id/password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = Number(req.params.id);
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(400).json({ error: "Senha atual incorreta" });
    }
    
    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hash } });
    res.json({ message: "Senha alterada com sucesso" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Erro ao alterar senha" });
  }
});

// DELETE /api/users/:id - Deletar usuário (apenas SUPER_ADMIN, não pode deletar SUPER_ADMIN)
router.delete("/:id", requireSuperAdmin, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Não permitir deletar SUPER_ADMIN
    if (user.role === "SUPER_ADMIN") {
      return res.status(403).json({ error: "Não é possível excluir um SUPER_ADMIN" });
    }

    await prisma.user.delete({ where: { id: userId } });
    res.json({ message: "Usuário removido com sucesso" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Erro ao remover usuário" });
  }
});

// GET /api/users/:id/permissions - Buscar permissões de um usuário
router.get("/:id/permissions", requireSuperAdmin, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    
    const userPermissions: any = await prisma.$queryRaw`
      SELECT permissionId, granted 
      FROM user_permissions 
      WHERE userId = ${userId}
    `;
    
    res.json(userPermissions);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Erro ao buscar permissões do usuário" });
  }
});

// PUT /api/users/:id/permissions - Atualizar permissões de um usuário
router.put("/:id/permissions", requireSuperAdmin, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { permissions } = req.body; // { permissionId: granted, ... }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Não permitir modificar permissões de SUPER_ADMIN
    if (user.role === "SUPER_ADMIN") {
      return res.status(403).json({ error: "Não é possível modificar permissões de SUPER_ADMIN" });
    }

    // Deletar todas as permissões existentes do usuário
    await prisma.$executeRaw`DELETE FROM user_permissions WHERE userId = ${userId}`;

    // Criar novas permissões (salvar TODAS as permissões, não apenas as true)
    const permissionsToCreate = Object.entries(permissions).map(([permissionId, granted]) => ({
      userId,
      permissionId: Number(permissionId),
      granted: Boolean(granted),
    }));

    if (permissionsToCreate.length > 0) {
      for (const perm of permissionsToCreate) {
        await prisma.$executeRaw`
          INSERT INTO user_permissions (userId, permissionId, granted, createdAt)
          VALUES (${perm.userId}, ${perm.permissionId}, ${perm.granted ? 1 : 0}, NOW())
        `;
      }
    }

    res.json({ message: "Permissões atualizadas com sucesso" });
  } catch (error: any) {
    console.error("Error updating user permissions:", error);
    res.status(500).json({ error: error.message || "Erro ao atualizar permissões" });
  }
});

export default router;
