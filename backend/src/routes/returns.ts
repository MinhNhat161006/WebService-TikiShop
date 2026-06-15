import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();
router.use(authRequired);

const createReturnSchema = z.object({
  order_id: z.string().min(1),
  reason: z.string().min(5, "Lý do trả hàng phải có ít nhất 5 ký tự"),
  items: z
    .array(
      z.object({
        product_id: z.string().min(1),
        return_quantity: z.coerce.number().int().min(1),
      })
    )
    .min(1, "Cần ít nhất 1 sản phẩm để trả"),
});

/**
 * @openapi
 * /api/returns:
 *   post:
 *     tags: [Returns]
 *     summary: Tạo yêu cầu trả hàng (Khách hàng)
 *     security: [{ bearerAuth: [] }]
 */
router.post("/", async (req, res) => {
  const parsed = createReturnSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation", details: parsed.error.flatten() });
    return;
  }

  const { order_id, reason, items } = parsed.data;
  const userId = req.user!.userId;

  try {
    // 1. Verify order exists, belongs to user and is delivered
    const order = await prisma.order.findUnique({
      where: { id: order_id },
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      res.status(404).json({ error: "Không tìm thấy đơn hàng" });
      return;
    }

    if (order.userId !== userId) {
      res.status(403).json({ error: "Bạn không có quyền trả hàng đơn này" });
      return;
    }

    if (order.status !== "delivered" && order.status !== "completed") {
      res.status(400).json({
        error: "Chỉ có thể tạo yêu cầu trả hàng với đơn hàng đã giao thành công",
      });
      return;
    }

    // 2. Check for existing return request on this order
    const existingReturn = await prisma.returnRequest.findFirst({
      where: { orderId: order_id },
    });
    if (existingReturn) {
      res.status(409).json({
        error: "Đơn hàng này đã có yêu cầu trả hàng (ID: " + existingReturn.id + ")",
      });
      return;
    }

    // 3. Validate products and calculate refund_amount
    let refund_amount = 0;
    const validatedItems: { product_id: string; return_quantity: number; price: number }[] = [];

    for (const item of items) {
      const orderItem = order.items.find((oi) => oi.productId === item.product_id);
      if (!orderItem) {
        res.status(400).json({
          error: `Sản phẩm ID ${item.product_id} không có trong đơn hàng này`,
        });
        return;
      }
      if (item.return_quantity > orderItem.quantity) {
        res.status(400).json({
          error: `Số lượng trả (${item.return_quantity}) vượt quá số lượng đã mua (${orderItem.quantity}) của sản phẩm ${orderItem.product.name}`,
        });
        return;
      }
      refund_amount += orderItem.price * item.return_quantity;
      validatedItems.push({ product_id: item.product_id, return_quantity: item.return_quantity, price: orderItem.price });
    }

    // 4. Create ReturnRequest + ReturnItems in transaction
    const returnRequest = await prisma.$transaction(async (tx) => {
      const rr = await tx.returnRequest.create({
        data: {
          orderId: order_id,
          userId,
          reason,
          refund_amount,
          items: {
            create: validatedItems.map((vi) => ({
              productId: vi.product_id,
              return_quantity: vi.return_quantity,
            })),
          },
        },
        include: {
          items: { include: { product: { select: { id: true, name: true, image: true, sku: true } } } },
          order: { select: { id: true, total: true, createdAt: true } },
        },
      });
      return rr;
    });

    res.status(201).json(returnRequest);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Không thể tạo yêu cầu trả hàng" });
  }
});

/**
 * @openapi
 * /api/returns:
 *   get:
 *     tags: [Returns]
 *     summary: Lấy danh sách yêu cầu trả hàng của user hiện tại
 */
router.get("/", async (req, res) => {
  const userId = req.user!.userId;
  try {
    const requests = await prisma.returnRequest.findMany({
      where: { userId },
      include: {
        order: { select: { id: true, total: true, createdAt: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, image: true, sku: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(requests);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Lỗi khi lấy danh sách yêu cầu trả hàng" });
  }
});

export default router;
