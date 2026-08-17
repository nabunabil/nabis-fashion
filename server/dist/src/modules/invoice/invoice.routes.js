"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const invoice_controller_1 = require("./invoice.controller");
const router = (0, express_1.Router)();
router.get("/:orderId/download", invoice_controller_1.invoiceController.downloadInvoice);
router.get("/:orderId", invoice_controller_1.invoiceController.downloadInvoice);
exports.default = router;
//# sourceMappingURL=invoice.routes.js.map