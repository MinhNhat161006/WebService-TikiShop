import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { InventoryService } from "../services/inventoryService.js";
import { ReconciliationService } from "../services/reconciliationService.js";

const router = Router();

const transferItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1)
});

const transferCreateSchema = z.object({
  srcBranchId: z.string().min(1),
  destBranchId: z.string().min(1),
  items: z.array(transferItemSchema).min(1)
});

// --- Branches API ---
router.get("/branches", async (req, res) => {
  const branches = await prisma.branch.findMany({ orderBy: { name: "asc" } });
  res.json(branches);
});

// --- Branch Product Stock API ---
router.get("/branch-stock", async (req, res) => {
  const { branchId, q } = req.query;

  const where: any = {};
  if (branchId) {
    where.branchId = branchId as string;
  }
  if (q) {
    where.product = {
      name: { contains: q as string }
    };
  }

  const stockList = await prisma.branchProduct.findMany({
    where,
    include: {
      product: true,
      branch: true
    },
    orderBy: [
      { branch: { name: "asc" } },
      { product: { name: "asc" } }
    ]
  });

  res.json(stockList);
});

// --- Inventory Batches API ---
router.get("/batches", async (req, res) => {
  const { branchId, productId } = req.query;

  const where: any = {};
  if (branchId) where.branchId = branchId as string;
  if (productId) where.productId = productId as string;

  const batches = await prisma.inventoryBatch.findMany({
    where,
    include: {
      product: true,
      branch: true,
      supplier: true
    },
    orderBy: { expiryDate: "asc" } // Expiration date sorting (FEFO preview)
  });

  res.json(batches);
});

// --- Inventory Ledgers API ---
router.get("/ledgers", async (req, res) => {
  const { branchId, productId } = req.query;

  const where: any = {};
  if (branchId) where.branchId = branchId as string;
  if (productId) where.productId = productId as string;

  const ledgers = await prisma.inventoryLedger.findMany({
    where,
    include: {
      product: true,
      branch: true
    },
    orderBy: { timestamp: "desc" }
  });

  res.json(ledgers);
});

// --- Stock Transfers API ---
router.get("/transfers", async (req, res) => {
  const list = await prisma.stockTransfer.findMany({
    include: {
      srcBranch: true,
      destBranch: true,
      items: { include: { product: true } }
    },
    orderBy: { createdAt: "desc" }
  });
  res.json(list);
});

router.post("/transfers", async (req, res) => {
  const parsed = transferCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dữ liệu luân chuyển không hợp lệ.", details: parsed.error.flatten() });
    return;
  }

  const { srcBranchId, destBranchId, items } = parsed.data;

  if (srcBranchId === destBranchId) {
    res.status(400).json({ error: "Kho nguồn và kho đích không được trùng nhau." });
    return;
  }

  try {
    // 1. Create StockTransfer in PENDING state
    const transfer = await prisma.$transaction(async (tx) => {
      const count = await tx.stockTransfer.count();
      const transferNumber = `TR-${Date.now().toString().slice(-4)}-${(count + 1).toString().padStart(3, "0")}`;

      return await tx.stockTransfer.create({
        data: {
          transferNumber,
          srcBranchId,
          destBranchId,
          status: "PENDING",
          items: {
            create: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity
            }))
          }
        }
      });
    });

    // 2. Execute Stock Transfer immediately in this demo
    const result = await InventoryService.executeStockTransfer(transfer.id);

    res.status(201).json({ ...transfer, ...result });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Luân chuyển kho thất bại." });
  }
});

// --- Reconciliation Audit API ---
router.get("/reconciliation", async (req, res) => {
  try {
    const report = await ReconciliationService.runAudit();
    res.json({
      timestamp: new Date(),
      integrityScore: report.length === 0 ? 100 : Math.max(0, 100 - report.length * 10),
      discrepancies: report
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
