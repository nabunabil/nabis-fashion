import { Router } from "express";
import { productImageUpload } from "../../config/multer.config";
import { requireAdmin } from "../../shared/middleware/requireAdmin";
import { requireAuth } from "../../shared/middleware/requireAuth";
import { productController } from "./product.controller";

const router: Router = Router();

// Public routes
router.get("/", productController.getAllProducts);
router.get("/homepage", productController.getHomepageProducts);
router.get("/search", productController.searchProducts);
router.get("/slug/:slug", productController.getProductBySlug);
router.get("/:id", productController.getProductById);
router.get("/:id/images", productController.getProductImages);

// Protected routes (admin/authenticated users)
router.post("/", requireAuth, requireAdmin, productController.createProduct);
router.put("/:id", requireAuth, requireAdmin, productController.updateProduct);
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  productController.deleteProduct,
);
router.post(
  "/:id/images",
  requireAuth,
  requireAdmin,
  productImageUpload,
  productController.addProductImage,
);
router.delete(
  "/images/:imageId",
  requireAuth,
  requireAdmin,
  productController.deleteProductImage,
);

export default router;
