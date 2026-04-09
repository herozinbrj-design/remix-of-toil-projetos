import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding permissions...");

  const permissions = [
    // Dashboard
    { key: "view_dashboard", name: "Ver Dashboard", category: "dashboard", description: "Acesso à página principal do painel" },
    
    // Portfólio
    { key: "view_portfolio", name: "Ver Portfólio", category: "portfolio", description: "Visualizar projetos do portfólio" },
    { key: "create_portfolio", name: "Criar Portfólio", category: "portfolio", description: "Adicionar novos projetos" },
    { key: "edit_portfolio", name: "Editar Portfólio", category: "portfolio", description: "Modificar projetos existentes" },
    { key: "delete_portfolio", name: "Excluir Portfólio", category: "portfolio", description: "Remover projetos" },
    
    // Segmentos
    { key: "view_segments", name: "Ver Segmentos", category: "segments", description: "Visualizar segmentos" },
    { key: "edit_segments", name: "Editar Segmentos", category: "segments", description: "Modificar segmentos" },
    
    // Leads
    { key: "view_leads", name: "Ver Leads", category: "leads", description: "Visualizar leads e orçamentos" },
    { key: "edit_leads", name: "Editar Leads", category: "leads", description: "Modificar status e informações de leads" },
    { key: "delete_leads", name: "Excluir Leads", category: "leads", description: "Remover leads" },
    
    // Configurações - Geral
    { key: "view_settings", name: "Ver Configurações", category: "settings", description: "Acessar página de configurações" },
    { key: "edit_settings_general", name: "Editar Configurações Gerais", category: "settings", description: "Modificar informações gerais do site" },
    { key: "edit_settings_seo", name: "Editar SEO", category: "settings", description: "Modificar configurações de SEO" },
    
    // Configurações - Seções
    { key: "edit_settings_banners", name: "Editar Banners", category: "settings", description: "Gerenciar banners do site" },
    { key: "edit_settings_carousel", name: "Editar Carrossel", category: "settings", description: "Gerenciar carrossel da home" },
    { key: "edit_settings_clients", name: "Editar Clientes", category: "settings", description: "Gerenciar logos de clientes" },
    { key: "edit_settings_footer", name: "Editar Rodapé", category: "settings", description: "Modificar rodapé do site" },
    { key: "edit_settings_about", name: "Editar Página Sobre", category: "settings", description: "Modificar página sobre" },
    { key: "edit_settings_contact", name: "Editar Página Contato", category: "settings", description: "Modificar página de contato" },
    
    // Configurações - Aparência
    { key: "edit_settings_colors", name: "Editar Cores", category: "settings", description: "Modificar cores e botões" },
    { key: "edit_settings_logos", name: "Editar Logos", category: "settings", description: "Modificar logomarcas" },
    { key: "edit_settings_fonts", name: "Editar Fontes", category: "settings", description: "Modificar tipografia" },
    { key: "edit_settings_animations", name: "Editar Animações", category: "settings", description: "Modificar animações" },
    
    // Configurações - Integrações
    { key: "edit_settings_smtp", name: "Editar SMTP", category: "settings", description: "Configurar e-mail SMTP" },
    
    // Usuários
    { key: "view_users", name: "Ver Usuários", category: "users", description: "Visualizar lista de usuários" },
    { key: "create_users", name: "Criar Usuários", category: "users", description: "Adicionar novos usuários" },
    { key: "edit_users", name: "Editar Usuários", category: "users", description: "Modificar usuários" },
    { key: "delete_users", name: "Excluir Usuários", category: "users", description: "Remover usuários" },
    
    // Permissões
    { key: "manage_permissions", name: "Gerenciar Permissões", category: "permissions", description: "Modificar permissões de usuários" },
  ];

  for (const perm of permissions) {
    // Check if permission exists
    const existing: any = await prisma.$queryRaw`
      SELECT id FROM permissions WHERE \`key\` = ${perm.key} LIMIT 1
    `;
    
    if (existing.length === 0) {
      // Insert new permission
      await prisma.$executeRaw`
        INSERT INTO permissions (\`key\`, name, description, category, createdAt)
        VALUES (${perm.key}, ${perm.name}, ${perm.description}, ${perm.category}, NOW())
      `;
      console.log(`  -> Created: ${perm.name}`);
    } else {
      // Update existing permission
      await prisma.$executeRaw`
        UPDATE permissions 
        SET name = ${perm.name}, description = ${perm.description}, category = ${perm.category}
        WHERE \`key\` = ${perm.key}
      `;
      console.log(`  -> Updated: ${perm.name}`);
    }
  }

  console.log(`Permissions seed completed!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
