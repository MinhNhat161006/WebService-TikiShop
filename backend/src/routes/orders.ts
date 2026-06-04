import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();
router.use(authRequired);

const checkoutSchema = z.object({
  address: z.string().min(5),
  phone: z.string().min(8),
  /** Nếu gửi: chỉ các dòng giỏ này được đưa vào đơn và xóa khỏi giỏ; các dòng khác giữ lại. Bỏ qua = toàn bộ giỏ (tương thích cũ). */
  cartItemIds: z.array(z.string()).min(1).max(200).optional(),
});

/**
 * @openapi
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: Lịch sử đơn hàng
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 */
router.get("/", async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: { include: { product: { select: { id: true, name: true, slug: true, image: true } } } },
    },
  });
  res.json(orders);
});

/**
 * @openapi
 * /api/orders/checkout:
 *   post:
 *     tags: [Orders]
 *     summary: Đặt hàng từ giỏ hiện tại
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [address, phone]
 *             properties:
 *               address: { type: string, minLength: 5 }
 *               phone: { type: string, minLength: 8 }
 *     responses:
 *       201:
 *         description: Đặt hàng thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 */
router.post("/checkout", async (req, res) => {
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation", details: parsed.error.flatten() });
    return;
  }
  const { address, phone, cartItemIds } = parsed.data;
  const allCart = await prisma.cartItem.findMany({
    where: { userId: req.user!.userId },
    include: { product: true },
  });
  if (allCart.length === 0) {
    res.status(400).json({ error: "Giỏ hàng trống" });
    return;
  }

  let cartItems = allCart;
  if (cartItemIds && cartItemIds.length > 0) {
    const uniqueIds = [...new Set(cartItemIds)];
    cartItems = uniqueIds
      .map((id) => allCart.find((c) => c.id === id))
      .filter((x): x is (typeof allCart)[number] => x != null);
    if (cartItems.length !== uniqueIds.length) {
      res.status(400).json({
        error: "Danh sách thanh toán không hợp lệ (thiếu mục hoặc không thuộc giỏ của bạn).",
      });
      return;
    }
  }

  const total = cartItems.reduce((s, i) => s + i.product.price * i.quantity, 0);

  const order = await prisma.$transaction(async (tx) => {
    const o = await tx.order.create({
      data: {
        userId: req.user!.userId,
        total,
        address,
        phone,
        status: "pending",
        items: {
          create: cartItems.map((ci) => ({
            productId: ci.productId,
            quantity: ci.quantity,
            price: ci.product.price,
          })),
        },
      },
    });
    await tx.cartItem.deleteMany({
      where: { userId: req.user!.userId, id: { in: cartItems.map((c) => c.id) } },
    });
    return o;
  });

  const full = await prisma.order.findUnique({
    where: { id: order.id },
    include: { items: { include: { product: true } } },
  });
  res.status(201).json(full);
});

/**
 * @openapi
 * /api/orders/{id}/cancel:
 *   post:
 *     tags: [Orders]
 *     summary: Khách hủy đơn (chỉ khi chờ xác nhận / đã xác nhận)
 */
router.post("/:id/cancel", async (req, res) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
  });
  if (!order) {
    res.status(404).json({ error: "Không tìm thấy đơn hàng" });
    return;
  }
  if (order.status === "cancelled") {
    res.status(400).json({ error: "Đơn hàng đã được hủy trước đó" });
    return;
  }
  if (order.status !== "pending" && order.status !== "confirmed") {
    res.status(400).json({
      error: "Không thể hủy đơn ở trạng thái này. Đơn đã chuyển sang giao hàng — vui lòng liên hệ hỗ trợ.",
    });
    return;
  }
  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status: "cancelled" },
    include: { items: { include: { product: true } } },
  });
  res.json(updated);
});

/**
 * @openapi
 * /api/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Chi tiết đơn hàng
 *     security: [{ bearerAuth: [] }]
 */
router.get("/:id", async (req, res) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
    include: {
      items: { include: { product: true } },
    },
  });
  if (!order) {
    res.status(404).json({ error: "Không tìm thấy đơn hàng" });
    return;
  }
  res.json(order);
});

export default router;
