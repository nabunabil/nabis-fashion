import { Router } from "express";
import { requireAdmin } from "../../shared/middleware/requireAdmin";
import { requireAuth } from "../../shared/middleware/requireAuth";
import { settingController } from "./setting.controller";

const router: Router = Router();

// Public endpoint so storefront can read store configuration (currency, shipping fees, etc.)
router.get("/", settingController.getSettings);

// Admin-only endpoint to update store configuration
router.put("/", requireAuth, requireAdmin, settingController.updateSettings);

export default router;
