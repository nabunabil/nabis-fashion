import { Router } from "express";
import { invoiceController } from "./invoice.controller";

const router: Router = Router();

router.get("/:orderId/download", invoiceController.downloadInvoice);
router.get("/:orderId", invoiceController.downloadInvoice);

export default router;
