import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();
router.use(authRequired);

const applySchema = z.object({
  code: z.string().min(1),
  order_amount: z.coerce.number().int().min(0),
  user_id: z.string().optional(),
});

/**
 * @openapi
 * /api/vouchers/apply:
 *   post:
 *     tags: [Vouchers]
 *     summary: Áp dụng thử mã giảm giá cho đơn hàng
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, order_amount]
 *             properties:
 *               code: { type: string }
 *               order_amount: { type: integer }
 *               user_id: { type: string }
 *     responses:
 *       200:
 *         description: Áp dụng voucher thành công
 *       400:
 *         description: Voucher không hợp lệ hoặc không đủ điều kiện
 */
router.post("/apply", async (req, res) => {
  const parsed = applySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation", details: parsed.error.flatten() });
    return;
  }

  const { code, order_amount } = parsed.data;
  const userId = parsed.data.user_id || req.user!.userId;

  try {
    const uppercaseCode = code.toUpperCase();

    // 1. Tìm mã trong DB.
    const voucher = await prisma.voucher.findUnique({
      where: { code: uppercaseCode },
    });

    if (!voucher) {
      res.status(400).json({ error: "Mã giảm giá không tồn tại" });
      return;
    }

    // 2. Check trạng thái khác ACTIVE hoặc quá hạn end_date.
    const now = new Date();
    const isExpired = now > new Date(voucher.end_date) || now < new Date(voucher.start_date);
    if (voucher.status !== "ACTIVE" || isExpired) {
      res.status(400).json({ error: "Mã giảm giá đã hết hạn" });
      return;
    }

    // 3. Check used_count >= usage_limit.
    if (voucher.used_count >= voucher.usage_limit) {
      res.status(400).json({ error: "Mã giảm giá đã hết lượt sử dụng" });
      return;
    }

    // 4. Check order_amount < min_order_amount.
    if (order_amount < voucher.min_order_amount) {
      res.status(400).json({ error: "Đơn hàng chưa đạt giá trị tối thiểu" });
      return;
    }

    // 5. Check User_Voucher_History: Đếm số lần user_id đã dùng voucher_id.
    const usedCountForUser = await prisma.userVoucherHistory.count({
      where: {
        userId,
        voucherId: voucher.id,
      },
    });

    if (usedCountForUser >= voucher.per_user_limit) {
      res.status(400).json({ error: "Bạn đã hết lượt sử dụng mã này" });
      return;
    }

    // Tính toán số tiền được giảm
    let discount_amount = 0;
    if (voucher.discount_type === "PERCENTAGE") {
      discount_amount = Math.floor((order_amount * voucher.discount_value) / 100);
      if (voucher.max_discount_amount != null) {
        discount_amount = Math.min(discount_amount, voucher.max_discount_amount);
      }
    } else if (voucher.discount_type === "FIXED_AMOUNT") {
      discount_amount = voucher.discount_value;
    }

    // Đảm bảo số tiền giảm không vượt quá tổng đơn hàng
    discount_amount = Math.min(discount_amount, order_amount);

    const final_amount = order_amount - discount_amount;

    res.json({
      code: voucher.code,
      discount_type: voucher.discount_type,
      discount_value: voucher.discount_value,
      discount_amount,
      final_amount,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Lỗi khi áp dụng mã giảm giá" });
  }
});

export default router;
