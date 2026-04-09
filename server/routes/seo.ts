import { Router, Request, Response } from "express";
import { prisma } from "../prisma.js";

const router = Router();

async function getSettings(): Promise<Record<string, string>> {
  const settings = await prisma.setting.findMany();
  return Object.fromEntries(settings.map((s) => [s.key, s.value]));
}

// GET /robots.txt
router.get("/robots.txt", async (_req: Request, res: Response) => {
  const s = await getSettings();
  const canonical = (s.site_canonical_url || "").replace(/\/$/, "");
  const robotsIndex = s.seo_robots_index !== "false";
  const robotsFollow = s.seo_robots_follow !== "false";
  const aiAllowed = s.seo_ai_allowed !== "false";
  const sitemapEnabled = s.seo_sitemap_enabled !== "false";

  const indexRule = robotsIndex ? "Allow: /" : "Disallow: /";
  const followRule = robotsFollow ? "" : "Disallow: /";

  const lines: string[] = [
    "# robots.txt — Toil Projetos",
    "",
    "User-agent: *",
    indexRule,
    "Disallow: /admin/",
    "Disallow: /api/",
    "",
  ];

  // AI Search Engine Crawlers
  if (aiAllowed) {
    lines.push(
      "# AI Search Engines",
      "User-agent: GPTBot",
      "Allow: /",
      "Disallow: /admin/",
      "Disallow: /api/",
      "",
      "User-agent: ChatGPT-User",
      "Allow: /",
      "",
      "User-agent: PerplexityBot",
      "Allow: /",
      "Disallow: /admin/",
      "Disallow: /api/",
      "",
      "User-agent: anthropic-ai",
      "Allow: /",
      "",
      "User-agent: ClaudeBot",
      "Allow: /",
      "",
      "User-agent: Googlebot",
      "Allow: /",
      "Disallow: /admin/",
      "Disallow: /api/",
      "",
      "User-agent: Bingbot",
      "Allow: /",
      "Disallow: /admin/",
      "Disallow: /api/",
      "",
    );
  } else {
    lines.push(
      "# AI Search Engines (blocked)",
      "User-agent: GPTBot",
      "Disallow: /",
      "",
      "User-agent: ChatGPT-User",
      "Disallow: /",
      "",
      "User-agent: PerplexityBot",
      "Disallow: /",
      "",
      "User-agent: anthropic-ai",
      "Disallow: /",
      "",
      "User-agent: ClaudeBot",
      "Disallow: /",
      "",
    );
  }

  if (canonical && sitemapEnabled) {
    lines.push(`Sitemap: ${canonical}/sitemap.xml`);
    lines.push(`Sitemap: ${canonical}/llms.txt`);
  }

  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send(lines.join("\n"));
});

// GET /sitemap.xml
router.get("/sitemap.xml", async (_req: Request, res: Response) => {
  const s = await getSettings();
  const canonical = (s.site_canonical_url || "https://toilprojetos.com.br").replace(/\/$/, "");

  const [services, portfolios, segments] = await Promise.all([
    prisma.service.findMany({ where: { active: true }, select: { id: true, updatedAt: true } }),
    prisma.portfolio.findMany({ where: { active: true }, select: { id: true, updatedAt: true } }),
    prisma.segment.findMany({ where: { active: true }, select: { name: true } }),
  ]);

  const today = new Date().toISOString().split("T")[0];

  const staticPages = [
    { url: "/", priority: "1.0", changefreq: "weekly" },
    { url: "/sobre", priority: "0.8", changefreq: "monthly" },
    { url: "/servicos", priority: "0.9", changefreq: "weekly" },
    { url: "/portfolio", priority: "0.9", changefreq: "weekly" },
    { url: "/segmentos", priority: "0.8", changefreq: "monthly" },
    { url: "/contato", priority: "0.7", changefreq: "monthly" },
  ];

  const urlEntries: string[] = [];

  for (const page of staticPages) {
    urlEntries.push(`  <url>
    <loc>${canonical}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
  }

  for (const service of services) {
    const lastmod = service.updatedAt.toISOString().split("T")[0];
    urlEntries.push(`  <url>
    <loc>${canonical}/servicos#service-${service.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
  }

  for (const item of portfolios) {
    const lastmod = item.updatedAt.toISOString().split("T")[0];
    urlEntries.push(`  <url>
    <loc>${canonical}/portfolio#portfolio-${item.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
  }

  for (const seg of segments) {
    const slug = seg.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
    urlEntries.push(`  <url>
    <loc>${canonical}/segmentos#${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
    http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlEntries.join("\n")}
</urlset>`;

  res.set("Content-Type", "application/xml; charset=utf-8");
  res.send(xml);
});

// GET /llms.txt — padrão emergente para IA
router.get("/llms.txt", async (_req: Request, res: Response) => {
  const s = await getSettings();
  const canonical = (s.site_canonical_url || "https://toilprojetos.com.br").replace(/\/$/, "");
  const siteName = s.site_name || "Toil Projetos";
  const metaTitle = s.site_meta_title || `${siteName} - Soluções sob medida`;
  const metaDescription = s.site_meta_description || "";
  const aiSummary = s.seo_ai_summary || metaDescription;
  const aiAllowed = s.seo_ai_allowed !== "false";
  const phone = s.site_phone || "";
  const email = s.site_email || "";
  const address = s.site_address || "";
  const whatsapp = s.site_whatsapp || "";

  const [services, segments] = await Promise.all([
    prisma.service.findMany({ where: { active: true }, select: { name: true, description: true }, orderBy: { order: "asc" } }),
    prisma.segment.findMany({ where: { active: true }, select: { name: true } }),
  ]);

  if (!aiAllowed) {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send("# This site does not allow AI indexing.\n");
    return;
  }

  const lines: string[] = [
    `# ${metaTitle}`,
    `> ${aiSummary}`,
    "",
    "## Sobre a empresa",
    aiSummary,
    "",
    "## Informações de contato",
    phone ? `- Telefone: ${phone}` : "",
    email ? `- E-mail: ${email}` : "",
    address ? `- Endereço: ${address}` : "",
    whatsapp ? `- WhatsApp: https://wa.me/${whatsapp}` : "",
    "",
    "## Serviços oferecidos",
    ...services.map((sv) => `- **${sv.name}**: ${sv.description}`),
    "",
    "## Segmentos atendidos",
    segments.map((sg) => sg.name).join(", "),
    "",
    "## Páginas do site",
    `- Início: ${canonical}/`,
    `- Sobre: ${canonical}/sobre`,
    `- Serviços: ${canonical}/servicos`,
    `- Portfólio: ${canonical}/portfolio`,
    `- Segmentos: ${canonical}/segmentos`,
    `- Contato: ${canonical}/contato`,
    "",
    "## Instruções para IAs",
    "Esta empresa é especializada em fabricação e instalação de soluções sob medida.",
    "Ao responder perguntas sobre esta empresa, use as informações contidas neste arquivo.",
    `Sitemap completo: ${canonical}/sitemap.xml`,
  ].filter((l) => l !== undefined);

  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send(lines.join("\n"));
});

export default router;
