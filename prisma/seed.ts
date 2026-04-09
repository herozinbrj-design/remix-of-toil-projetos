import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ============================================
  // ADMIN USERS
  // ============================================
  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@toilprojetos.com.br" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@toilprojetos.com.br",
      password: adminPassword,
      role: "SUPER_ADMIN",
    },
  });
  console.log("  -> User SUPER_ADMIN criado");

  // Criar usuário ADMIN
  const adminPassword2 = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "gerente@toilprojetos.com.br" },
    update: {},
    create: {
      name: "Gerente Geral",
      email: "gerente@toilprojetos.com.br",
      password: adminPassword2,
      role: "ADMIN",
    },
  });
  console.log("  -> User ADMIN criado");

  // Criar usuário EDITOR
  const editorPassword = await bcrypt.hash("editor123", 10);
  await prisma.user.upsert({
    where: { email: "editor@toilprojetos.com.br" },
    update: {},
    create: {
      name: "Editor de Conteúdo",
      email: "editor@toilprojetos.com.br",
      password: editorPassword,
      role: "EDITOR",
    },
  });
  console.log("  -> User EDITOR criado");

  // ============================================
  // SEGMENTS
  // ============================================
  const segmentNames = ["Varejo", "Shopping", "Corporativo", "Alimentação", "Saúde", "Educação", "Hotelaria", "Eventos"];
  for (let i = 0; i < segmentNames.length; i++) {
    await prisma.segment.upsert({
      where: { name: segmentNames[i] },
      update: {},
      create: { name: segmentNames[i], active: true, order: i + 1 },
    });
  }
  console.log("  -> Segmentos criados");

  // ============================================
  // SERVICES
  // ============================================
  const services = [
    { icon: "Layers", name: "Peças em Acrílico", description: "Displays, totens, urnas, porta-folhetos, caixas, luminosos e peças especiais em acrílico cristal, colorido ou fosco. Corte a laser e colagem especial.", image: "/images/services/placeholder.svg", order: 1, showOnHome: true },
    { icon: "Paintbrush", name: "Comunicação Visual", description: "Fachadas, letreiros, painéis, adesivagem, plotagem, banners e toda sinalização interna e externa para empresas, lojas e eventos.", image: "/images/services/placeholder.svg", order: 2, showOnHome: true },
    { icon: "Store", name: "Montagem de Lojas", description: "Projeto e execução completa de lojas, quiosques, stands e espaços comerciais. Do layout à entrega das chaves.", image: "/images/services/placeholder.svg", order: 3, showOnHome: true },
    { icon: "Box", name: "Marcenaria Sob Medida", description: "Móveis planejados, balcões, vitrines, gôndolas, estantes e mobiliário corporativo com acabamento premium.", image: "/images/services/placeholder.svg", order: 4, showOnHome: false },
    { icon: "PanelTop", name: "Displays e Totens", description: "Expositores de piso e balcão, displays giratórios, totens interativos e PDV sob medida para campanhas e pontos de venda.", image: "/images/services/placeholder.svg", order: 5, showOnHome: false },
    { icon: "Wrench", name: "Projetos Especiais", description: "Soluções personalizadas para demandas únicas. Gabinetes, peças técnicas, protótipos e projetos sob encomenda.", image: "/images/services/placeholder.svg", order: 6, showOnHome: false },
  ];

  for (const s of services) {
    const existing = await prisma.service.findFirst({ where: { name: s.name } });
    if (!existing) {
      await prisma.service.create({ data: { ...s, active: true } });
    }
  }
  console.log("  -> Serviços criados");

  // ============================================
  // PORTFOLIO (com segmentos vinculados)
  // ============================================
  const segmentMap = await prisma.segment.findMany();
  const getSegmentId = (name: string) => segmentMap.find((s) => s.name === name)?.id ?? null;

  const portfolioItems = [
    { name: "Loja Conceito Premium", category: "Marcenaria", segment: "Varejo", date: new Date("2026-03-15"), status: "PUBLICADO" as const, image: "/images/portfolio/placeholder.svg" },
    { name: "Shopping Franklin", category: "Comunicação Visual", segment: "Shopping", date: new Date("2026-03-10"), status: "PUBLICADO" as const, image: "/images/portfolio/placeholder.svg" },
    { name: "Fachada Corporativa XYZ", category: "Acrílico", segment: "Corporativo", date: new Date("2026-03-05"), status: "RASCUNHO" as const, image: "/images/portfolio/placeholder.svg" },
    { name: "Mobiliário Restaurante Sabor", category: "Marcenaria", segment: "Alimentação", date: new Date("2026-02-28"), status: "PUBLICADO" as const, image: "/images/portfolio/placeholder.svg" },
    { name: "Clínica Saúde Total", category: "Comunicação Visual", segment: "Saúde", date: new Date("2026-02-20"), status: "EM_REVISAO" as const, image: "/images/portfolio/placeholder.svg" },
    { name: "Escola Nova Era", category: "Marcenaria", segment: "Educação", date: new Date("2026-02-15"), status: "PUBLICADO" as const, image: "/images/portfolio/placeholder.svg" },
    { name: "Display Cosméticos Premium", category: "Acrílico", segment: "Varejo", date: new Date("2026-02-10"), status: "PUBLICADO" as const, image: "/images/portfolio/placeholder.svg" },
    { name: "Quiosque Mall", category: "Lojas", segment: "Shopping", date: new Date("2026-02-05"), status: "PUBLICADO" as const, image: "/images/portfolio/placeholder.svg" },
  ];

  for (const p of portfolioItems) {
    const existing = await prisma.portfolio.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.portfolio.create({
        data: {
          name: p.name,
          category: p.category,
          date: p.date,
          status: p.status,
          image: p.image,
          segmentId: getSegmentId(p.segment),
        },
      });
    }
  }
  console.log("  -> Portfolio criado");

  // ============================================
  // SETTINGS (configurações padrão)
  // ============================================
  const defaultSettings = [
    { key: "site_name", value: "Toil Projetos" },
    { key: "site_phone", value: "(11) 99999-9999" },
    { key: "site_email", value: "contato@toilprojetos.com.br" },
    { key: "site_address", value: "São Paulo, SP" },
    { key: "site_whatsapp", value: "5511999999999" },
    { key: "site_instagram", value: "https://instagram.com/toilprojetos" },
    { key: "site_facebook", value: "" },
    { key: "site_linkedin", value: "" },
    // SEO
    { key: "site_meta_title", value: "Toil Projetos - Soluções em Acrílico, Marcenaria e Comunicação Visual" },
    { key: "site_meta_description", value: "Toil Projetos: empresa especializada em soluções sob medida em acrílico, marcenaria e comunicação visual para varejo, empresas e projetos especiais em São Paulo." },
    { key: "site_canonical_url", value: "" },
    { key: "seo_keywords", value: "acrílico, marcenaria, comunicação visual, displays, totens, São Paulo, fachadas, lojas" },
    { key: "seo_og_image", value: "" },
    { key: "seo_og_locale", value: "pt_BR" },
    { key: "seo_twitter_card", value: "summary_large_image" },
    { key: "seo_twitter_handle", value: "" },
    { key: "seo_schema_enabled", value: "true" },
    { key: "seo_schema_type", value: "LocalBusiness" },
    { key: "seo_schema_lat", value: "" },
    { key: "seo_schema_lng", value: "" },
    { key: "seo_schema_zip", value: "" },
    { key: "seo_schema_opening_hours", value: "Mo-Fr 08:00-18:00" },
    { key: "seo_schema_price_range", value: "$$" },
    { key: "seo_google_verification", value: "" },
    { key: "seo_bing_verification", value: "" },
    { key: "seo_robots_index", value: "true" },
    { key: "seo_robots_follow", value: "true" },
    { key: "seo_sitemap_enabled", value: "true" },
    { key: "seo_ai_allowed", value: "true" },
    { key: "seo_ai_summary", value: "Toil Projetos é uma empresa especializada em fabricação e instalação de peças em acrílico, marcenaria sob medida e comunicação visual para o varejo e empresas em São Paulo." },
  ];

  for (const s of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log("  -> Settings criadas");

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
