import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedHeaderMenu() {
  console.log("🌱 Seeding header menu...");

  // Limpar menu existente
  await prisma.headerMenu.deleteMany();

  // Criar itens principais
  const home = await prisma.headerMenu.create({
    data: {
      label: "Home",
      link: "/",
      order: 1,
      active: true,
    },
  });

  const sobre = await prisma.headerMenu.create({
    data: {
      label: "Sobre",
      link: "/sobre",
      order: 2,
      active: true,
    },
  });

  const segmentos = await prisma.headerMenu.create({
    data: {
      label: "Segmentos",
      link: "/segmentos",
      order: 3,
      active: true,
    },
  });

  // Criar submenus de Segmentos (exemplo)
  await prisma.headerMenu.create({
    data: {
      label: "Varejo",
      link: "/segmentos/varejo",
      parentId: segmentos.id,
      order: 1,
      active: true,
    },
  });

  await prisma.headerMenu.create({
    data: {
      label: "Corporativo",
      link: "/segmentos/corporativo",
      parentId: segmentos.id,
      order: 2,
      active: true,
    },
  });

  const portfolio = await prisma.headerMenu.create({
    data: {
      label: "Portfólio",
      link: "/portfolio",
      order: 4,
      active: true,
    },
  });

  const contato = await prisma.headerMenu.create({
    data: {
      label: "Contato",
      link: "/contato",
      order: 5,
      active: true,
    },
  });

  console.log("✅ Header menu seeded successfully!");
  console.log(`Created ${await prisma.headerMenu.count()} menu items`);
}

seedHeaderMenu()
  .catch((e) => {
    console.error("❌ Error seeding header menu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
