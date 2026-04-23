import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function main() {
  const segments = await prisma.segment.findMany();
  
  for (const segment of segments) {
    if (!segment.slug) {
      const slug = generateSlug(segment.name);
      await prisma.segment.update({
        where: { id: segment.id },
        data: { slug },
      });
      console.log(`✓ Slug gerado para "${segment.name}": ${slug}`);
    }
  }
  
  console.log("\n✓ Todos os slugs foram gerados!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
