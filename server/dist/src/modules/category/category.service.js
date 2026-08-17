"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCategories = getAllCategories;
exports.getCategoryById = getCategoryById;
exports.getCategoryBySlug = getCategoryBySlug;
exports.createCategory = createCategory;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
const prisma_1 = require("../../lib/prisma");
const appError_1 = require("../../shared/errors/appError");
const categorySelect = {
    id: true,
    name: true,
    slug: true,
    _count: {
        select: {
            products: true,
        },
    },
};
async function getAllCategories() {
    return prisma_1.prisma.category.findMany({
        select: categorySelect,
        orderBy: { name: "asc" },
    });
}
async function getCategoryById(id) {
    return prisma_1.prisma.category.findUnique({
        where: { id },
        select: {
            ...categorySelect,
            products: {
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    price: true,
                    discountPrice: true,
                    createdAt: true,
                },
                orderBy: { createdAt: "desc" },
            },
        },
    });
}
async function getCategoryBySlug(slug) {
    return prisma_1.prisma.category.findFirst({
        where: { slug },
        select: {
            ...categorySelect,
            products: {
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    price: true,
                    discountPrice: true,
                    createdAt: true,
                },
                orderBy: { createdAt: "desc" },
            },
        },
    });
}
async function createCategory(input) {
    const existing = await prisma_1.prisma.category.findFirst({
        where: {
            OR: [{ name: input.name }, { slug: input.slug }],
        },
        select: { id: true },
    });
    if (existing) {
        throw new appError_1.AppError(409, "Category with provided name or slug already exists", "CATEGORY_EXISTS");
    }
    return prisma_1.prisma.category.create({
        data: {
            name: input.name,
            slug: input.slug,
        },
        select: categorySelect,
    });
}
async function updateCategory(id, input) {
    if (input.name || input.slug) {
        const conflict = await prisma_1.prisma.category.findFirst({
            where: {
                AND: [
                    { id: { not: id } },
                    {
                        OR: [
                            ...(input.name ? [{ name: input.name }] : []),
                            ...(input.slug ? [{ slug: input.slug }] : []),
                        ],
                    },
                ],
            },
            select: { id: true },
        });
        if (conflict) {
            throw new appError_1.AppError(409, "Another category with that name or slug already exists", "CATEGORY_CONFLICT");
        }
    }
    return prisma_1.prisma.category.update({
        where: { id },
        data: {
            ...(input.name !== undefined ? { name: input.name } : {}),
            ...(input.slug !== undefined ? { slug: input.slug } : {}),
        },
        select: categorySelect,
    });
}
async function deleteCategory(id) {
    const productCount = await prisma_1.prisma.product.count({
        where: { categoryId: id },
    });
    if (productCount > 0) {
        throw new appError_1.AppError(400, "Cannot delete category with associated products", "CATEGORY_HAS_PRODUCTS");
    }
    return prisma_1.prisma.category.delete({
        where: { id },
        select: categorySelect,
    });
}
//# sourceMappingURL=category.service.js.map