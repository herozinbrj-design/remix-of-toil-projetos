import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma.js";
import { AuthRequest } from "./auth.js";

// Verificar se o usuário tem uma permissão específica
export async function checkPermission(userId: number, userRole: string, permissionKey: string): Promise<boolean> {
  // SUPER_ADMIN tem todas as permissões
  if (userRole === "SUPER_ADMIN") {
    return true;
  }

  // Buscar a permissão
  const permission: any = await prisma.$queryRaw`
    SELECT * FROM permissions WHERE \`key\` = ${permissionKey} LIMIT 1
  `;

  if (!permission || permission.length === 0) {
    return false;
  }

  const permissionId = permission[0].id;

  // Verificar permissão específica do usuário (sobrescreve a do cargo)
  const userPermission: any = await prisma.$queryRaw`
    SELECT * FROM user_permissions 
    WHERE userId = ${userId} AND permissionId = ${permissionId}
    LIMIT 1
  `;

  if (userPermission && userPermission.length > 0) {
    return userPermission[0].granted === 1;
  }

  // Verificar permissão do cargo
  const rolePermission: any = await prisma.$queryRaw`
    SELECT * FROM role_permissions 
    WHERE role = ${userRole} AND permissionId = ${permissionId}
    LIMIT 1
  `;

  return rolePermission && rolePermission.length > 0 && rolePermission[0].granted === 1;
}

// Middleware para verificar permissão
export function requirePermission(permissionKey: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userId || !req.userRole) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const hasPermission = await checkPermission(req.userId, req.userRole, permissionKey);

    if (!hasPermission) {
      return res.status(403).json({ error: "Você não tem permissão para realizar esta ação" });
    }

    next();
  };
}

// Buscar todas as permissões de um usuário
export async function getUserPermissions(userId: number, userRole: string): Promise<string[]> {
  // SUPER_ADMIN tem todas as permissões
  if (userRole === "SUPER_ADMIN") {
    const allPermissions: any = await prisma.$queryRaw`SELECT \`key\` FROM permissions`;
    return allPermissions.map((p: any) => p.key);
  }

  // Buscar permissões do cargo
  const rolePermissions: any = await prisma.$queryRaw`
    SELECT p.key 
    FROM role_permissions rp
    JOIN permissions p ON rp.permissionId = p.id
    WHERE rp.role = ${userRole} AND rp.granted = 1
  `;

  const rolePerms = new Set(rolePermissions.map((rp: any) => rp.key));

  // Buscar permissões específicas do usuário
  const userPermissions: any = await prisma.$queryRaw`
    SELECT p.key, up.granted
    FROM user_permissions up
    JOIN permissions p ON up.permissionId = p.id
    WHERE up.userId = ${userId}
  `;

  // Aplicar permissões específicas do usuário (sobrescreve as do cargo)
  userPermissions.forEach((up: any) => {
    if (up.granted === 1) {
      rolePerms.add(up.key);
    } else {
      rolePerms.delete(up.key);
    }
  });

  return Array.from(rolePerms);
}
