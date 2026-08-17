"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_config_1 = require("../../config/multer.config");
const requireAdmin_1 = require("../../shared/middleware/requireAdmin");
const requireAuth_1 = require("../../shared/middleware/requireAuth");
const product_controller_1 = require("./product.controller");
const router = (0, express_1.Router)();
// Public routes
router.get("/", product_controller_1.productController.getAllProducts);
router.get("/homepage", product_controller_1.productController.getHomepageProducts);
router.get("/search", product_controller_1.productController.searchProducts);
router.get("/slug/:slug", product_controller_1.productController.getProductBySlug);
router.get("/:id", product_controller_1.productController.getProductById);
router.get("/:id/images", product_controller_1.productController.getProductImages);
// Protected routes (admin/authenticated users)
router.post("/", requireAuth_1.requireAuth, requireAdmin_1.requireAdmin, product_controller_1.productController.createProduct);
router.put("/:id", requireAuth_1.requireAuth, requireAdmin_1.requireAdmin, product_controller_1.productController.updateProduct);
router.delete("/:id", requireAuth_1.requireAuth, requireAdmin_1.requireAdmin, product_controller_1.productController.deleteProduct);
router.post("/:id/images", requireAuth_1.requireAuth, requireAdmin_1.requireAdmin, multer_config_1.productImageUpload, product_controller_1.productController.addProductImage);
router.delete("/images/:imageId", requireAuth_1.requireAuth, requireAdmin_1.requireAdmin, product_controller_1.productController.deleteProductImage);
exports.default = router;
//# sourceMappingURL=product.routes.js.map