import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { adminRequired, authRequired } from "../middleware/auth.js";

const router = Router();
router.use(authRequired);
router.use(adminRequired);

// List reviews with optional status filter
const listSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
});

router.get("/", async (req, res) => {
  const parsed = listSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation", details: parsed.error.flatten() });
    return;
  }
  const { status, page, pageSize } = parsed.data;
  const skip = (page - 1) * pageSize;
  const where: any = {};
  if (status) where.status = status;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { id: true, name: true, image: true, slug: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.review.count({ where }),
  ]);
  res.json({ reviews, total, page, pageSize });
});

// Update status
const statusSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});
router.patch("/:id/status", async (req, res) => {
  const { id } = req.params;
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation", details: parsed.error.flatten() });
    return;
  }
  const { status } = parsed.data;
  try {
    const updated = await prisma.review.update({
      where: { id },
      data: { status },
    });
    res.json(updated);
  } catch (e: any) {
    res.status(400).json({ error: e.message || "Failed to update status" });
  }
});

// Add admin reply
const replySchema = z.object({
  adminReply: z.string().max(1000),
});
router.patch("/:id/reply", async (req, res) => {
  const { id } = req.params;
  const parsed = replySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation", details: parsed.error.flatten() });
    return;
  }
  const { adminReply } = parsed.data;
  try {
    const updated = await prisma.review.update({
      where: { id },
      data: { adminReply },
    });
    res.json(updated);
  } catch (e: any) {
    res.status(400).json({ error: e.message || "Failed to add reply" });
  }
});

export default router;
