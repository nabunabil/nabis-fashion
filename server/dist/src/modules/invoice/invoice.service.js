"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOrderInvoicePdf = generateOrderInvoicePdf;
const invoice_pdf_1 = require("./invoice.pdf");
async function generateOrderInvoicePdf(orderId) {
    return (0, invoice_pdf_1.createInvoicePdfBuffer)(orderId);
}
//# sourceMappingURL=invoice.service.js.map