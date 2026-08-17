"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productController = void 0;
const prisma_1 = require("../../shared/errors/prisma");
const cloudinary_config_1 = require("../../config/cloudinary.config");
const product_service_1 = require("./product.service");
exports.productController = {
    async getHomepageProducts(req, res) {
        try {
            const categoryProducts = await (0, product_service_1.getHomepageCategoryProducts)();
            return res.status(200).json({
                success: true,
                data: categoryProducts,
            });
        }
        catch (error) {
            console.error("Error fetching homepage products:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch homepage category products",
            });
        }
    },
    async getAllProducts(req, res) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 12;
            const category = typeof req.query.category === "string" ? req.query.category : undefined;
            const search = typeof req.query.search === "string" ? req.query.search : typeof req.query.q === "string" ? req.query.q : undefined;
            const sortBy = typeof req.query.sortBy === "string" ? req.query.sortBy : undefined;
            const minPrice = req.query.minPrice !== undefined ? Number(req.query.minPrice) : undefined;
            const maxPrice = req.query.maxPrice !== undefined ? Number(req.query.maxPrice) : undefined;
            const result = await (0, product_service_1.getPaginatedProducts)({
                page,
                limit,
                category,
                search,
                sortBy,
                minPrice,
                maxPrice,
            });
            return res.status(200).json({
                success: true,
                data: result.products,
                totalProducts: result.totalProducts,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
                limit: result.limit,
            });
        }
        catch (error) {
            console.error("Error fetching products:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch products",
            });
        }
    },
    async searchProducts(req, res) {
        try {
            const q = typeof req.query.q === "string" ? req.query.q : "";
            const limit = Math.min(Number(req.query.limit) || 20, 100);
            const offset = Number(req.query.offset) || 0;
            const products = await (0, product_service_1.searchProducts)(q, limit, offset);
            return res.status(200).json({
                success: true,
                data: products,
                pagination: {
                    limit,
                    offset,
                },
            });
        }
        catch (error) {
            console.error("Error searching products:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to search products",
            });
        }
    },
    async getProductById(req, res) {
        try {
            const { id } = req.params;
            let productId = Number(id);
            if (isNaN(productId)) {
                const bySlug = await (0, product_service_1.getProductBySlug)(String(id));
                if (!bySlug) {
                    return res.status(404).json({
                        success: false,
                        message: "Product not found",
                    });
                }
                productId = bySlug.id;
            }
            const product = await (0, product_service_1.getProductById)(productId);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found",
                });
            }
            return res.status(200).json({
                success: true,
                data: product,
            });
        }
        catch (error) {
            console.error("Error fetching product:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch product",
            });
        }
    },
    async getProductBySlug(req, res) {
        try {
            const { slug } = req.params;
            if (!slug) {
                return res.status(400).json({
                    success: false,
                    message: "Product slug is required",
                });
            }
            const slugStr = String(req.params.slug || "");
            const product = await (0, product_service_1.getProductBySlug)(slugStr);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found",
                });
            }
            return res.status(200).json({
                success: true,
                data: product,
            });
        }
        catch (error) {
            console.error("Error fetching product by slug:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch product",
            });
        }
    },
    async createProduct(req, res) {
        try {
            const { title, slug, description, price, discountPrice, categoryId, variants } = req.body;
            if (!title || typeof title !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "Product title is required and must be a string",
                });
            }
            if (!slug || typeof slug !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "Product slug is required and must be a string",
                });
            }
            if (!description || typeof description !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "Product description is required and must be a string",
                });
            }
            const numPrice = Number(price);
            if (isNaN(numPrice) || numPrice < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Product price is required and must be a positive number",
                });
            }
            const numDiscount = discountPrice !== undefined ? Number(discountPrice) : 0;
            const numCategory = Number(categoryId);
            const product = await (0, product_service_1.createProduct)({
                title: title.trim(),
                slug: slug.trim(),
                description: description.trim(),
                price: numPrice,
                discountPrice: numDiscount,
                categoryId: numCategory,
                variants: Array.isArray(variants) ? variants : [],
            });
            return res.status(201).json({
                success: true,
                message: "Product created successfully",
                data: product,
            });
        }
        catch (error) {
            const mappedError = (0, prisma_1.mapPrismaError)(error);
            if (mappedError) {
                return res.status(mappedError.statusCode).json({
                    success: false,
                    message: mappedError.message,
                    code: mappedError.code,
                });
            }
            console.error("Error creating product:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to create product",
            });
        }
    },
    async updateProduct(req, res) {
        try {
            const { id } = req.params;
            let productId = Number(id);
            if (isNaN(productId)) {
                const bySlug = await (0, product_service_1.getProductBySlug)(String(id));
                if (!bySlug) {
                    return res.status(404).json({
                        success: false,
                        message: "Product not found",
                    });
                }
                productId = bySlug.id;
            }
            const { title, slug, description, price, discountPrice, categoryId, variants } = req.body;
            const product = await (0, product_service_1.updateProduct)(productId, {
                ...(title !== undefined ? { title: String(title).trim() } : {}),
                ...(slug !== undefined ? { slug: String(slug).trim() } : {}),
                ...(description !== undefined
                    ? { description: String(description).trim() }
                    : {}),
                ...(price !== undefined ? { price: Number(price) } : {}),
                ...(discountPrice !== undefined
                    ? { discountPrice: Number(discountPrice) }
                    : {}),
                ...(categoryId !== undefined
                    ? { categoryId: Number(categoryId) }
                    : {}),
                ...(Array.isArray(variants) ? { variants } : {}),
            });
            return res.status(200).json({
                success: true,
                message: "Product updated successfully",
                data: product,
            });
        }
        catch (error) {
            const mappedError = (0, prisma_1.mapPrismaError)(error);
            if (mappedError) {
                return res.status(mappedError.statusCode).json({
                    success: false,
                    message: mappedError.message,
                    code: mappedError.code,
                });
            }
            console.error("Error updating product:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to update product",
            });
        }
    },
    async deleteProduct(req, res) {
        try {
            const { id } = req.params;
            const productId = Number(id);
            if (isNaN(productId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product ID",
                });
            }
            const product = await (0, product_service_1.deleteProduct)(productId);
            return res.status(200).json({
                success: true,
                message: "Product deleted successfully",
                data: product,
            });
        }
        catch (error) {
            const mappedError = (0, prisma_1.mapPrismaError)(error);
            if (mappedError) {
                return res.status(mappedError.statusCode).json({
                    success: false,
                    message: mappedError.message,
                    code: mappedError.code,
                });
            }
            console.error("Error deleting product:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to delete product",
            });
        }
    },
    async getProductImages(req, res) {
        try {
            const { id } = req.params;
            const productId = Number(id);
            if (isNaN(productId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product ID",
                });
            }
            const images = await (0, product_service_1.getProductImages)(productId);
            return res.status(200).json({
                success: true,
                data: images,
            });
        }
        catch (error) {
            console.error("Error fetching product images:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch product images",
            });
        }
    },
    async addProductImage(req, res) {
        try {
            const { id } = req.params;
            let productId = Number(id);
            if (isNaN(productId)) {
                const bySlug = await (0, product_service_1.getProductBySlug)(String(id));
                if (!bySlug) {
                    return res.status(404).json({
                        success: false,
                        message: "Product not found",
                    });
                }
                productId = bySlug.id;
            }
            // Handle multiple files array or single file
            let filesToUpload = [];
            if (Array.isArray(req.files) && req.files.length > 0) {
                filesToUpload = req.files;
            }
            else if (req.file) {
                filesToUpload = [req.file];
            }
            if (filesToUpload.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Image file(s) required",
                });
            }
            const createdImages = [];
            for (const file of filesToUpload) {
                if (!file.buffer)
                    continue;
                const uploadedImage = await (0, cloudinary_config_1.uploadBufferToCloudinary)(file.buffer, {
                    folder: "products",
                    filename: file.originalname,
                    optimizeImage: true,
                });
                const imageRecord = await (0, product_service_1.addProductImage)({
                    productId,
                    imageUrl: uploadedImage.secureUrl,
                    publicId: uploadedImage.publicId,
                });
                createdImages.push(imageRecord);
            }
            return res.status(201).json({
                success: true,
                message: `${createdImages.length} image(s) uploaded successfully`,
                data: createdImages.length === 1 ? createdImages[0] : createdImages,
            });
        }
        catch (error) {
            const mappedError = (0, prisma_1.mapPrismaError)(error);
            if (mappedError) {
                return res.status(mappedError.statusCode).json({
                    success: false,
                    message: mappedError.message,
                    code: mappedError.code,
                });
            }
            console.error("Error uploading product image(s):", error);
            return res.status(500).json({
                success: false,
                message: "Failed to upload product image(s)",
            });
        }
    },
    async deleteProductImage(req, res) {
        try {
            const { imageId } = req.params;
            const parsedImageId = Number(imageId);
            if (isNaN(parsedImageId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid image ID",
                });
            }
            const deleted = await (0, product_service_1.removeProductImage)(parsedImageId);
            if (deleted?.imageUrl) {
                await (0, cloudinary_config_1.deleteFileFromCloudinary)(deleted.imageUrl);
            }
            return res.status(200).json({
                success: true,
                message: "Image deleted successfully",
                data: deleted,
            });
        }
        catch (error) {
            console.error("Error deleting product image:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to delete product image",
            });
        }
    },
};
//# sourceMappingURL=product.controller.js.map