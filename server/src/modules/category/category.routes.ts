import { Router } from "express";
import { requireAdmin } from "../../shared/middleware/requireAdmin";
import { requireAuth } from "../../shared/middleware/requireAuth";
import { categoryController } from "./category.controller";

const router: Router = Router();

router.get("/", categoryController.getAllCategories);
router.get("/slug/:slug", categoryController.getCategoryBySlug);
router.get("/:id", categoryController.getCategoryById);

router.post("/", requireAuth, requireAdmin, categoryController.createCategory);
router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  categoryController.updateCategory,
);
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  categoryController.deleteCategory,
);

export default router;
