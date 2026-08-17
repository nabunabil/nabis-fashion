import {
  createOrderFromCart,
  type ShippingInfo,
} from "../orders/order-workflow.service";

export async function processCODOrder(
  userId: number,
  shipping: ShippingInfo,
) {
  return createOrderFromCart(userId, "COD", shipping);
}
