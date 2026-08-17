import { createInvoicePdfBuffer } from "./invoice.pdf";

export async function generateOrderInvoicePdf(orderId: number): Promise<Buffer> {
  return createInvoicePdfBuffer(orderId);
}
