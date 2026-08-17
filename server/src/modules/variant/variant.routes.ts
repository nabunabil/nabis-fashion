import { Router } from "express";
import { requireAdmin } from "../../shared/middleware/requireAdmin";
import { requireAuth } from "../../shared/middleware/requireAuth";
import { variantController } from "./variant.controller";

const router: Router = Router();

router.get("/", variantController.list);
router.get("/:id", variantController.get);
router.post("/", requireAuth, requireAdmin, variantController.create);
router.patch("/:id", requireAuth, requireAdmin, variantController.update);
router.delete("/:id", requireAuth, requireAdmin, variantController.delete);

export default router;
