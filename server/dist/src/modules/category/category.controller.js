"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryController = void 0;
const appError_1 = require("../../shared/errors/appError");
const prisma_1 = require("../../shared/errors/prisma");
const category_service_1 = require("./category.service");
exports.categoryController = {
    async getAllCategories(_req, res) {
        try {
            const categories = await (0, category_service_1.getAllCategories)();
            return res.status(200).json({
                success: true,
                data: categories,
            });
        }
        catch (error) {
            console.error("Error fetching categories:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch categories",
            });
        }
    },
    async getCategoryById(req, res) {
        try {
            const { id } = req.params;
            const categoryId = Number(id);
            if (Number.isNaN(categoryId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category ID",
                });
            }
            const category = await (0, category_service_1.getCategoryById)(categoryId);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found",
                });
            }
            return res.status(200).json({
                success: true,
                data: category,
            });
        }
        catch (error) {
            console.error("Error fetching category:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch category",
            });
        }
    },
    async getCategoryBySlug(req, res) {
        try {
            const { slug } = req.params;
            if (!slug || typeof slug !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category slug",
                });
            }
            const category = await (0, category_service_1.getCategoryBySlug)(slug);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found",
                });
            }
            return res.status(200).json({
                success: true,
                data: category,
            });
        }
        catch (error) {
            console.error("Error fetching category by slug:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch category",
            });
        }
    },
    async createCategory(req, res) {
        try {
            const { name, slug } = req.body;
            if (!name || typeof name !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "Category name is required and must be a string",
                });
            }
            if (!slug || typeof slug !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "Category slug is required and must be a string",
                });
            }
            const category = await (0, category_service_1.createCategory)({
                name: name.trim(),
                slug: slug.trim(),
            });
            return res.status(201).json({
                success: true,
                message: "Category created successfully",
                data: category,
            });
        }
        catch (error) {
            if (error instanceof appError_1.AppError) {
                return res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    code: error.code,
                });
            }
            const mappedError = (0, prisma_1.mapPrismaError)(error);
            if (mappedError) {
                return res.status(mappedError.statusCode).json({
                    success: false,
                    message: mappedError.message,
                    code: mappedError.code,
                });
            }
            console.error("Error creating category:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to create category",
            });
        }
    },
    async updateCategory(req, res) {
        try {
            const { id } = req.params;
            const categoryId = Number(id);
            if (Number.isNaN(categoryId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category ID",
                });
            }
            const { name, slug } = req.body;
            const updateData = {};
            if (name !== undefined) {
                if (typeof name !== "string") {
                    return res.status(400).json({
                        success: false,
                        message: "Category name must be a string",
                    });
                }
                updateData.name = name.trim();
            }
            if (slug !== undefined) {
                if (typeof slug !== "string") {
                    return res.status(400).json({
                        success: false,
                        message: "Category slug must be a string",
                    });
                }
                updateData.slug = slug.trim();
            }
            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "At least one field is required to update",
                });
            }
            const category = await (0, category_service_1.updateCategory)(categoryId, updateData);
            return res.status(200).json({
                success: true,
                message: "Category updated successfully",
                data: category,
            });
        }
        catch (error) {
            if (error instanceof appError_1.AppError) {
                return res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    code: error.code,
                });
            }
            const mappedError = (0, prisma_1.mapPrismaError)(error);
            if (mappedError) {
                return res.status(mappedError.statusCode).json({
                    success: false,
                    message: mappedError.message,
                    code: mappedError.code,
                });
            }
            console.error("Error updating category:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to update category",
            });
        }
    },
    async deleteCategory(req, res) {
        try {
            const { id } = req.params;
            const categoryId = Number(id);
            if (Number.isNaN(categoryId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category ID",
                });
            }
            const category = await (0, category_service_1.deleteCategory)(categoryId);
            return res.status(200).json({
                success: true,
                message: "Category deleted successfully",
                data: category,
            });
        }
        catch (error) {
            if (error instanceof appError_1.AppError) {
                return res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    code: error.code,
                });
            }
            const mappedError = (0, prisma_1.mapPrismaError)(error);
            if (mappedError) {
                return res.status(mappedError.statusCode).json({
                    success: false,
                    message: mappedError.message,
                    code: mappedError.code,
                });
            }
            console.error("Error deleting category:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to delete category",
            });
        }
    },
};
//# sourceMappingURL=category.controller.js.map