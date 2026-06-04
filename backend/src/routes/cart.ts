import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

router.use(authRequired);

const addSchema = z.object({
  productId: z.string(),
  quantity: z.coerce.number().min(1).max(99).default(1),
});

const patchSchema = z.object({
  quantity: z.coerce.number().min(1).max(99),
});

/**
 * @openapi
 * /api/cart:
 *   get:
 *     tags: [Cart]
 *     summary: Giỏ hàng của user đăng nhập
 *     security: [{ bearerAuth: [] }]
 */
router.get("/", async (req, res) => {
  const items = await prisma.cartItem.findMany({
    where: { userId: req.user!.userId },
    include: { product: { include: { category: { select: { name: true, slug: true } } } } },
  });
  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  res.json({ items, subtotal });
});

/**
 * @openapi
 * /api/cart:
 *   post:
 *     tags: [Cart]
 *     summary: Thêm sản phẩm vào giỏ
 *     security: [{ bearerAuth: [] }]
 */
router.post("/", async (req, res) => {
  const parsed = addSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation", details: parsed.error.flatten() });
    return;
  }
  const { productId, quantity } = parsed.data;
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    res.status(404).json({ error: "Sản phẩm không tồn tại" });
    return;
  }
  const existing = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId: req.user!.userId, productId } },
  });
  if (existing) {
    const nextQty = Math.min(99, existing.quantity + quantity);
    if (nextQty === existing.quantity && quantity > 0) {
      res.status(400).json({ error: "Số lượng tối đa mỗi sản phẩm trong giỏ là 99." });
      return;
    }
    const updated = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: nextQty },
      include: { product: true },
    });
    res.json(updated);
    return;
  }
  const created = await prisma.cartItem.create({
    data: { userId: req.user!.userId, productId, quantity },
    include: { product: true },
  });
  res.status(201).json(created);
});

/**
 * @openapi
 * /api/cart/clear/all:
 *   post:
 *     tags: [Cart]
 *     summary: Xóa toàn bộ giỏ
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Xóa giỏ thành công
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 */
router.post("/clear/all", async (req, res) => {
  await prisma.cartItem.deleteMany({ where: { userId: req.user!.userId } });
  res.json({ ok: true });
});

/**
 * @openapi
 * /api/cart/{id}:
 *   patch:
 *     tags: [Cart]
 *     summary: Cập nhật số lượng dòng giỏ
 *     security: [{ bearerAuth: [] }]
 */
router.patch("/:id", async (req, res) => {
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation", details: parsed.error.flatten() });
    return;
  }
  const item = await prisma.cartItem.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
  });
  if (!item) {
    res.status(404).json({ error: "Không tìm thấy" });
    return;
  }
  const updated = await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity: parsed.data.quantity },
    include: { product: true },
  });
  res.json(updated);
});

/**
 * @openapi
 * /api/cart/{id}:
 *   delete:
 *     tags: [Cart]
 *     summary: Xóa dòng giỏ
 *     security: [{ bearerAuth: [] }]
 */
router.delete("/:id", async (req, res) => {
  const item = await prisma.cartItem.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
  });
  if (!item) {
    res.status(404).json({ error: "Không tìm thấy" });
    return;
  }
  await prisma.cartItem.delete({ where: { id: item.id } });
  res.status(204).send();
});

export default router;
