import { prisma } from "../lib/prisma.js";

export interface ReconciliationDiscrepancy {
  type: "BATCH_STOCK_DRIFT" | "LEDGER_STOCK_DRIFT" | "SUPPLIER_MISMATCH" | "ORPHAN_BATCH" | "ORPHAN_LEDGER";
  productId: string;
  productName: string;
  branchId: string;
  branchName: string;
  details: string;
  expected: number;
  actual: number;
}

export class ReconciliationService {
  /**
   * Audits all products and branches to ensure total integrity.
   * Section 11 - Data Reconciliation Engine
   */
  static async runAudit(): Promise<ReconciliationDiscrepancy[]> {
    const discrepancies: ReconciliationDiscrepancy[] = [];

    // Load branches, products, ledger entries, batches and current branch stocks
    const branches = await prisma.branch.findMany();
    const products = await prisma.product.findMany();

    for (const br of branches) {
      for (const prod of products) {
        // 1. Get current BranchProduct stock
        const bp = await prisma.branchProduct.findUnique({
          where: {
            branchId_productId: {
              branchId: br.id,
              productId: prod.id
            }
          }
        });
        const currentStock = bp ? bp.stock : 0;

        // 2. Sum the remaining quantity in all active batches for this product at this branch
        const activeBatches = await prisma.inventoryBatch.findMany({
          where: {
            productId: prod.id,
            branchId: br.id
          }
        });
        const batchStockSum = activeBatches.reduce((sum, b) => sum + b.remainingQty, 0);

        // Check if there is drift between batches and cached stock (BATCH_STOCK_DRIFT)
        if (currentStock !== batchStockSum) {
          discrepancies.push({
            type: "BATCH_STOCK_DRIFT",
            productId: prod.id,
            productName: prod.name,
            branchId: br.id,
            branchName: br.name,
            details: `Tồn kho theo lô (${batchStockSum}) khác với tồn kho trên hệ thống (${currentStock}).`,
            expected: batchStockSum,
            actual: currentStock
          });
        }

        // 3. Sum the ledger change movements for this branch and product
        const ledgers = await prisma.inventoryLedger.findMany({
          where: {
            productId: prod.id,
            branchId: br.id
          }
        });
        const ledgerStockSum = ledgers.reduce((sum, l) => sum + l.qtyChange, 0);

        // Check if there is drift between ledger movements and cached stock (LEDGER_STOCK_DRIFT)
        if (currentStock !== ledgerStockSum) {
          discrepancies.push({
            type: "LEDGER_STOCK_DRIFT",
            productId: prod.id,
            productName: prod.name,
            branchId: br.id,
            branchName: br.name,
            details: `Tổng lịch sử giao dịch sổ cái (${ledgerStockSum}) lệch với tồn kho trên hệ thống (${currentStock}).`,
            expected: ledgerStockSum,
            actual: currentStock
          });
        }

        // 4. Section 8: Supplier Consistency validation within batches
        for (const batch of activeBatches) {
          // Verify that the batch supplier matches the parent goods receipt's supplier
          const grItem = await prisma.goodsReceiptItem.findUnique({
            where: { id: batch.goodsReceiptItemId },
            include: {
              goodsReceipt: {
                include: { purchaseOrder: true }
              }
            }
          });

          if (grItem) {
            const grSupplierId = grItem.goodsReceipt.purchaseOrder.supplierId;
            if (batch.supplierId !== grSupplierId) {
              discrepancies.push({
                type: "SUPPLIER_MISMATCH",
                productId: prod.id,
                productName: prod.name,
                branchId: br.id,
                branchName: br.name,
                details: `Sai lệch nhà cung cấp tại lô ${batch.batchNumber}: Lô gán Supplier ID ${batch.supplierId}, nhưng Goods Receipt / PO thuộc Supplier ID ${grSupplierId}.`,
                expected: 0,
                actual: 0
              });
            }
          }
        }
      }
    }

    return discrepancies;
  }
}
