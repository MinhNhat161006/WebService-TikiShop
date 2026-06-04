import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const router = Router();

const categoryProductsQuery = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(48).default(24),
});

/**
 * @openapi
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: Danh sách danh mục
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/", async (_req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
  res.json(
    categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      productCount: c._count.products,
    }))
  );
});

/**
 * @openapi
 * /api/categories/{slug}:
 *   get:
 *     tags: [Categories]
 *     summary: Chi tiết danh mục theo slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Chi tiết danh mục
 *       404:
 *         description: Không tìm thấy danh mục
 */
router.get("/:slug", async (req, res) => {
  const parsed = categoryProductsQuery.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Query không hợp lệ", details: parsed.error.flatten() });
    return;
  }
  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const cat = await prisma.category.findUnique({
    where: { slug: req.params.slug },
    include: {
      _count: { select: { products: true } },
      products: { skip, take: limit, orderBy: { sold: "desc" } },
    },
  });
  if (!cat) {
    res.status(404).json({ error: "Không tìm thấy danh mục" });
    return;
  }
  const { _count, ...rest } = cat;
  const total = _count.products;
  res.json({
    ...rest,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

export default router;
