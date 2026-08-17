"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requireAdmin_1 = require("../../shared/middleware/requireAdmin");
const requireAuth_1 = require("../../shared/middleware/requireAuth");
const category_controller_1 = require("./category.controller");
const router = (0, express_1.Router)();
router.get("/", category_controller_1.categoryController.getAllCategories);
router.get("/slug/:slug", category_controller_1.categoryController.getCategoryBySlug);
router.get("/:id", category_controller_1.categoryController.getCategoryById);
router.post("/", requireAuth_1.requireAuth, requireAdmin_1.requireAdmin, category_controller_1.categoryController.createCategory);
router.put("/:id", requireAuth_1.requireAuth, requireAdmin_1.requireAdmin, category_controller_1.categoryController.updateCategory);
router.delete("/:id", requireAuth_1.requireAuth, requireAdmin_1.requireAdmin, category_controller_1.categoryController.deleteCategory);
exports.default = router;
//# sourceMappingURL=category.routes.js.map