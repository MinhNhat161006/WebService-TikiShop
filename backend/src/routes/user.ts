import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();
router.use(authRequired);

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional().nullable(),
});

/**
 * @openapi
 * /api/user/profile:
 *   get:
 *     tags: [User]
 *     summary: Hồ sơ
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lấy hồ sơ thành công
 *       404:
 *         description: Không tìm thấy user
 *   patch:
 *     tags: [User]
 *     summary: Cập nhật hồ sơ
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               phone: { type: string, nullable: true }
 *     responses:
 *       200:
 *         description: Cập nhật hồ sơ thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router
  .route("/profile")
  .get(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
    });
    if (!user) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(user);
  })
  .patch(async (req, res) => {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation", details: parsed.error.flatten() });
      return;
    }
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: parsed.data,
      select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
    });
    res.json(user);
  });

export default router;
