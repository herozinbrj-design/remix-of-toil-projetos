import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding role permissions...");

  // Buscar todas as permissões
  const permissions = await prisma.permission.findMany();
  const permMap: Record<string, number> = {};
  permissions.forEach((p) => {
    permMap[p.key] = p.id;
  });

  // Definir permissões por cargo
  const rolePermissions = {
    SUPER_ADMIN: [
      // Todas as permissões
      ...Object.keys(permMap),
    ],
    ADMIN: [
      "view_dashboard",
      "view_portfolio",
      "create_portfolio",
      "edit_portfolio",
      "delete_portfolio",
      "view_segments",
      "edit_segments",
      "view_leads",
      "edit_leads",
      "delete_leads",
      "view_settings",
      "edit_settings_general",
      "edit_settings_seo",
      "edit_settings_banners",
      "edit_settings_footer",
    ],
    EDITOR: [
      "view_dashboard",
      "view_portfolio",
      "create_portfolio",
      "edit_portfolio",
      "view_segments",
      "view_leads",
    ],
  };

  // Limpar permissões de cargos existentes
  await prisma.rolePermission.deleteMany({});

  // Criar permissões para cada cargo
  for (const [role, perms] of Object.entries(rolePermissions)) {
    for (const permKey of perms) {
      const permId = permMap[permKey];
      if (permId) {
        await prisma.rolePermission.create({
          data: {
            role: role as any,
            permissionId: permId,
            granted: true,
          },
        });
      }
    }
    console.log(`  -> ${perms.length} permissões criadas para ${role}`);
  }

  console.log("Role permissions seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
