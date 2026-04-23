import { Router } from "express";
import { prisma } from "../prisma.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// GET /api/header-menu (público - retorna menu hierárquico)
router.get("/", async (_req, res) => {
  try {
    const menus = await prisma.headerMenu.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });

    // Construir hierarquia
    const buildTree = (parentId: number | null): any[] => {
      return menus
        .filter((m) => m.parentId === parentId)
        .map((m) => ({
          id: m.id,
          label: m.label,
          link: m.link,
          order: m.order,
          children: buildTree(m.id),
        }));
    };

    const tree = buildTree(null);
    res.json(tree);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar menu" });
  }
});

// GET /api/header-menu/all (admin - retorna todos incluindo inativos)
router.get("/all", authMiddleware, async (_req, res) => {
  try {
    const menus = await prisma.headerMenu.findMany({
      orderBy: [{ order: "asc" }, { id: "asc" }],
    });

    // Construir hierarquia
    const buildTree = (parentId: number | null): any[] => {
      return menus
        .filter((m) => m.parentId === parentId)
        .map((m) => ({
          id: m.id,
          label: m.label,
          link: m.link,
          order: m.order,
          active: m.active,
          parentId: m.parentId,
          children: buildTree(m.id),
        }));
    };

    const tree = buildTree(null);
    res.json(tree);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar menu" });
  }
});

// POST /api/header-menu (criar item)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { label, link, parentId, order, active } = req.body;

    if (!label) {
      return res.status(400).json({ error: "Label é obrigatório" });
    }

    const menu = await prisma.headerMenu.create({
      data: {
        label,
        link: link || null,
        parentId: parentId || null,
        order: order || 0,
        active: active !== false,
      },
    });

    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar item do menu" });
  }
});

// PUT /api/header-menu/:id (atualizar item)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { label, link, parentId, order, active } = req.body;

    // Verificar se não está tentando ser pai de si mesmo
    if (parentId && parseInt(parentId) === parseInt(id)) {
      return res.status(400).json({ error: "Um item não pode ser pai de si mesmo" });
    }

    const menu = await prisma.headerMenu.update({
      where: { id: parseInt(id) },
      data: {
        label,
        link: link || null,
        parentId: parentId || null,
        order: order || 0,
        active: active !== false,
      },
    });

    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar item do menu" });
  }
});

// DELETE /api/header-menu/:id (deletar item e seus filhos)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.headerMenu.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Item deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar item do menu" });
  }
});

// PUT /api/header-menu/reorder (reordenar itens)
router.put("/reorder", authMiddleware, async (req, res) => {
  try {
    const { items } = req.body; // Array de { id, order }

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "Items deve ser um array" });
    }

    await Promise.all(
      items.map((item: { id: number; order: number }) =>
        prisma.headerMenu.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    res.json({ message: "Ordem atualizada com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao reordenar itens" });
  }
});

export default router;
