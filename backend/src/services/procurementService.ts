import { prisma } from "../lib/prisma.js";
import { POStatus } from "@prisma/client";

export class ProcurementService {
  /**
   * Enforces valid PO status transitions (Section 2)
   */
  static isValidTransition(current: POStatus, target: POStatus): boolean {
    const transitions: Record<POStatus, POStatus[]> = {
      DRAFT: ["SUBMITTED", "CANCELLED"],
      SUBMITTED: ["APPROVED", "DRAFT", "CANCELLED"],
      APPROVED: ["RECEIVING", "CANCELLED", "COMPLETED"], // COMPLETED allowed if received in one-go
      RECEIVING: ["COMPLETED", "CANCELLED"],
      COMPLETED: [], // Final state
      CANCELLED: []  // Final state
    };
    return transitions[current]?.includes(target) ?? false;
  }

  /**
   * Transitions a Purchase Order to a new status, performing checks.
   */
  static async transitionStatus(poId: string, targetStatus: POStatus, actorId: string) {
    return await prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.findUnique({
        where: { id: poId }
      });

      if (!po) {
        throw new Error("Không tìm thấy đơn nhập hàng (PO).");
      }

      if (po.status === targetStatus) {
        return po; // Already in target status
      }

      if (!this.isValidTransition(po.status, targetStatus)) {
        throw new Error(`Chuyển đổi trạng thái không hợp lệ: từ ${po.status} sang ${targetStatus}.`);
      }

      const updateData: Partial<typeof po> = { status: targetStatus };

      // Record manager approvals (Section 2)
      if (targetStatus === "APPROVED") {
        updateData.approvedById = actorId;
        updateData.approvedAt = new Date();
      }

      return await tx.purchaseOrder.update({
        where: { id: poId },
        data: updateData
      });
    });
  }

  /**
   * Checks if a Purchase Order is editable.
   * Section 2: Approved, Receiving, Completed, Cancelled orders are NOT editable/deletable.
   */
  static isEditable(status: POStatus): boolean {
    return status === "DRAFT" || status === "SUBMITTED";
  }

  /**
   * Deletes a Purchase Order, verifying it is in editable state.
   */
  static async deletePO(poId: string) {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: poId }
    });

    if (!po) {
      throw new Error("Không tìm thấy đơn nhập hàng (PO).");
    }

    if (!this.isEditable(po.status)) {
      throw new Error(`Không thể xóa đơn nhập hàng đã được phê duyệt hoặc hoàn thành (Trạng thái: ${po.status}).`);
    }

    await prisma.purchaseOrder.delete({
      where: { id: poId }
    });

    return { success: true };
  }

  /**
   * Updates a Purchase Order if it is in an editable state (DRAFT or SUBMITTED).
   */
  static async updatePO(poId: string, supplierId: string, items: any[]) {
    return await prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.findUnique({
        where: { id: poId }
      });

      if (!po) {
        throw new Error("Không tìm thấy đơn nhập hàng (PO).");
      }

      if (!this.isEditable(po.status)) {
        throw new Error(`Không thể chỉnh sửa đơn nhập hàng ở trạng thái ${po.status}.`);
      }

      // Delete existing PO items
      await tx.purchaseOrderItem.deleteMany({
        where: { purchaseOrderId: poId }
      });

      const poItemsToCreate = [];

      for (const item of items) {
        let productId = item.productId;

        // Support quick product creation during PO update
        if (item.isNewProduct && item.newProductData) {
          const np = item.newProductData;
          const sku = `SKU-${np.slug.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
          const barcode = `893000${Math.floor(100000 + Math.random() * 900000)}`;

          const nameDup = await tx.product.findFirst({
            where: {
              OR: [
                { name: { equals: np.name } },
                { slug: { equals: np.slug } }
              ]
            }
          });
          if (nameDup) {
            throw new Error(`Sản phẩm với tên hoặc slug "${np.name}" đã tồn tại trên hệ thống.`);
          }

          const newProduct = await tx.product.create({
            data: {
              name: np.name,
              slug: np.slug,
              sku,
              barcode,
              description: np.description,
              price: np.price,
              image: np.image,
              categoryId: np.categoryId,
              brand: np.brand ?? null,
              tags: np.tags ?? null
            }
          });

          productId = newProduct.id;

          const branches = await tx.branch.findMany();
          for (const br of branches) {
            await tx.branchProduct.create({
              data: {
                branchId: br.id,
                productId: newProduct.id,
                stock: 0,
                minStock: 10
              }
            });
          }
        }

        if (!productId) {
          throw new Error("Không có Product ID hoặc dữ liệu tạo sản phẩm mới.");
        }

        poItemsToCreate.push({
          productId,
          quantityOrdered: item.quantityOrdered,
          pricePerUnit: item.pricePerUnit
        });
      }

      return await tx.purchaseOrder.update({
        where: { id: poId },
        data: {
          supplierId,
          items: {
            create: poItemsToCreate
          }
        },
        include: {
          items: true
        }
      });
    });
  }
}
