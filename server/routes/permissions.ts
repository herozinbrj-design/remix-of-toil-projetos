import { Router } from "express";
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

// GET /api/permissions - Listar todas as permissões (ou apenas as que o usuário possui)
router.get("/", authMiddleware, async (req: any, res) => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;

    // SUPER_ADMIN vê todas as permissões
    if (userRole === "SUPER_ADMIN") {
      const permissions = await prisma.$queryRaw`SELECT * FROM permissions ORDER BY category ASC, name ASC`;
      return res.json(permissions);
    }

    // Outros usuários veem apenas as permissões que possuem
    // Buscar permissões do usuário
    const userPermissions: any = await prisma.$queryRaw`
      SELECT DISTINCT p.*
      FROM permissions p
      LEFT JOIN role_permissions rp ON p.id = rp.permissionId AND rp.role = ${userRole} AND rp.granted = 1
      LEFT JOIN user_permissions up ON p.id = up.permissionId AND up.userId = ${userId}
      WHERE (rp.permissionId IS NOT NULL AND rp.granted = 1)
         OR (up.permissionId IS NOT NULL AND up.granted = 1)
      ORDER BY p.category ASC, p.name ASC
    `;

    res.json(userPermissions);
  } catch (error: any) {
    console.error("Error fetching permissions:", error);
    res.status(500).json({ error: error.message || "Erro ao buscar permissões" });
  }
});

// GET /api/roles/:role/permissions - Buscar permissões de um cargo
router.get("/:role/permissions", authMiddleware, async (req: any, res) => {
  try {
    const role = req.params.role;
    const userRole = req.user?.role;
    
    // Verificar se o usuário pode gerenciar este cargo
    const roleHierarchy: Record<string, number> = {
      SUPER_ADMIN: 3,
      ADMIN: 2,
      EDITOR: 1,
    };
    
    const canManage = roleHierarchy[userRole] > roleHierarchy[role];
    
    if (!canManage && userRole !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "Você não pode gerenciar permissões deste cargo" });
    }
    
    const rolePermissions = await prisma.$queryRaw`
      SELECT permissionId, granted 
      FROM role_permissions 
      WHERE role = ${role}
    `;
    
    res.json(rolePermissions);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Erro ao buscar permissões do cargo" });
  }
});

// PUT /api/roles/:role/permissions - Atualizar permissões de um cargo
router.put("/:role/permissions", authMiddleware, async (req: any, res) => {
  try {
    const role = req.params.role;
    const { permissions } = req.body; // { permissionId: granted, ... }
    const userRole = req.user?.role;

    // Não permitir modificar permissões de SUPER_ADMIN
    if (role === "SUPER_ADMIN") {
      return res.status(403).json({ error: "Não é possível modificar permissões de SUPER_ADMIN" });
    }

    // Verificar se o usuário pode gerenciar este cargo
    const roleHierarchy: Record<string, number> = {
      SUPER_ADMIN: 3,
      ADMIN: 2,
      EDITOR: 1,
    };
    
    const canManage = roleHierarchy[userRole] > roleHierarchy[role];
    
    if (!canManage && userRole !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "Você não pode gerenciar permissões deste cargo" });
    }

    // Deletar todas as permissões existentes do cargo
    await prisma.$executeRaw`DELETE FROM role_permissions WHERE role = ${role}`;

    // Criar novas permissões (apenas as que estão marcadas como true)
    const permissionsToCreate = Object.entries(permissions)
      .filter(([_, granted]) => granted === true)
      .map(([permissionId]) => ({
        role,
        permissionId: Number(permissionId),
        granted: true,
      }));

    if (permissionsToCreate.length > 0) {
      for (const perm of permissionsToCreate) {
        await prisma.$executeRaw`
          INSERT INTO role_permissions (role, permissionId, granted, createdAt)
          VALUES (${perm.role}, ${perm.permissionId}, ${perm.granted}, NOW())
        `;
      }
    }

    res.json({ message: "Permissões do cargo atualizadas com sucesso" });
  } catch (error: any) {
    console.error("Error updating role permissions:", error);
    res.status(500).json({ error: error.message || "Erro ao atualizar permissões do cargo" });
  }
});

export default router;
