import { prisma } from "../lib/prisma.js";

/**
 * Checks whether a user is allowed to review a product in a specific order.
 * Conditions:
 *   - Order exists and belongs to the user
 *   - Order status is "delivered" or "completed"
 *   - The order contains the product
 */
export async function canUserReview(productId: string, userId: string, orderId: string): Promise<boolean> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return false;
  if (order.userId !== userId) return false;
  const status = order.status?.toLowerCase();
  if (status !== "delivered" && status !== "completed") return false;
  const hasProduct = order.items.some((item) => item.productId === productId);
  return hasProduct;
}
