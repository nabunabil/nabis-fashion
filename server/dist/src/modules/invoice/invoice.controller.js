"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceController = void 0;
const invoice_service_1 = require("./invoice.service");
exports.invoiceController = {
    async downloadInvoice(req, res) {
        try {
            const paramId = req.params.orderId || req.params.id;
            const orderId = Number(paramId) || 1;
            const pdfBuffer = await (0, invoice_service_1.generateOrderInvoicePdf)(orderId);
            // Generate filename with date and unique 4-digit random number
            const dateStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
            const randomSuffix = Math.floor(1000 + Math.random() * 9000);
            const filename = `invoice-#${orderId}_${dateStr}_${randomSuffix}.pdf`;
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
            res.setHeader("Content-Length", pdfBuffer.length);
            return res.status(200).send(pdfBuffer);
        }
        catch (err) {
            console.error("Error downloading PDF invoice:", err);
            return res
                .status(err.statusCode || 500)
                .json({ success: false, message: err.message || "Failed to generate PDF invoice" });
        }
    },
};
//# sourceMappingURL=invoice.controller.js.map