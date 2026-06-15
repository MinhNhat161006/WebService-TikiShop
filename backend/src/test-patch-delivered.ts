import { prisma } from "./lib/prisma.js";

async function main() {
  const deliveryId = "cmqc2vn0f00014r7wnv3i5sxf";
  const status = "DELIVERED";

  try {
    const result = await prisma.$transaction(async (tx) => {
      const doRow = await tx.deliveryOrder.findUnique({
        where: { id: deliveryId },
        include: {
          order: {
            include: {
              items: true,
            },
          },
        },
      });

      if (!doRow) {
        throw new Error("Không tìm thấy phiếu giao hàng");
      }

      const order = doRow.order;
      const orderBranchId = order.branchId;

      const updateData: any = { status };
      if (status === "DELIVERED") {
        updateData.actual_delivery_date = new Date();
      }

      const updated = await tx.deliveryOrder.update({
        where: { id: doRow.id },
        data: updateData,
      });

      if (status === "DELIVERED") {
        await tx.order.update({
          where: { id: order.id },
          data: { status: "completed" },
        });

        if (orderBranchId) {
          for (const item of order.items) {
            const inv = await tx.inventory.findUnique({
              where: { branchId_productId: { branchId: orderBranchId, productId: item.productId } },
            });
            if (inv) {
              const newPhysical = Math.max(0, inv.physical_stock - item.quantity);
              const newReserved = Math.max(0, inv.reserved_stock - item.quantity);
              const newAvailable = newPhysical - newReserved;

              await tx.inventory.update({
                where: { id: inv.id },
                data: {
                  physical_stock: newPhysical,
                  reserved_stock: newReserved,
                  available_stock: newAvailable,
                },
              });
            }
          }
        }
      }

      return updated;
    });

    console.log("Success:", result);
  } catch (err: any) {
    console.error("Failed:", err.message);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
