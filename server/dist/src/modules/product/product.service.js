"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaginatedProducts = getPaginatedProducts;
exports.getAllProducts = getAllProducts;
exports.getHomepageCategoryProducts = getHomepageCategoryProducts;
exports.searchProducts = searchProducts;
exports.getProductById = getProductById;
exports.getProductBySlug = getProductBySlug;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.syncProductVariants = syncProductVariants;
exports.deleteProduct = deleteProduct;
exports.getProductImages = getProductImages;
exports.addProductImage = addProductImage;
exports.removeProductImage = removeProductImage;
const prisma_1 = require("../../lib/prisma");
const productSelect = {
    id: true,
    title: true,
    slug: true,
    description: true,
    price: true,
    discountPrice: true,
    categoryId: true,
    createdAt: true,
    updatedAt: true,
};
async function getPaginatedProducts(options = {}) {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.max(1, Math.min(Number(options.limit) || 12, 100)); // Default 12 per page
    const skip = (page - 1) * limit;
    const where = {};
    if (options.category && options.category !== "all") {
        where.category = {
            OR: [
                { slug: { equals: options.category, mode: "insensitive" } },
                { name: { equals: options.category, mode: "insensitive" } },
            ],
        };
    }
    if (options.minPrice !== undefined || options.maxPrice !== undefined) {
        where.price = {};
        if (options.minPrice !== undefined && !isNaN(Number(options.minPrice))) {
            where.price.gte = Number(options.minPrice);
        }
        if (options.maxPrice !== undefined && !isNaN(Number(options.maxPrice))) {
            where.price.lte = Number(options.maxPrice);
        }
    }
    if (options.search && options.search.trim() !== "") {
        const q = options.search.trim();
        where.OR = [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
        ];
    }
    let orderBy = { createdAt: "desc" };
    if (options.sortBy === "price-low")
        orderBy = { price: "asc" };
    else if (options.sortBy === "price-high")
        orderBy = { price: "desc" };
    else if (options.sortBy === "newest")
        orderBy = { createdAt: "desc" };
    else if (options.sortBy === "oldest")
        orderBy = { createdAt: "asc" };
    const [products, totalProducts] = await Promise.all([
        prisma_1.prisma.product.findMany({
            where,
            select: {
                ...productSelect,
                category: { select: { id: true, name: true, slug: true } },
                images: { select: { id: true, imageUrl: true, publicId: true } },
                variants: { select: { id: true, size: true, color: true, stock: true, sku: true } },
                _count: { select: { variants: true, images: true, reviews: true } },
            },
            take: limit,
            skip,
            orderBy,
        }),
        prisma_1.prisma.product.count({ where }),
    ]);
    const totalPages = Math.ceil(totalProducts / limit) || 1;
    return {
        products,
        totalProducts,
        totalPages,
        currentPage: page,
        limit,
    };
}
async function getAllProducts(limit = 20, offset = 0) {
    return prisma_1.prisma.product.findMany({
        select: {
            ...productSelect,
            category: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
            images: {
                select: {
                    id: true,
                    imageUrl: true,
                    publicId: true,
                },
            },
            variants: {
                select: {
                    id: true,
                    size: true,
                    color: true,
                    stock: true,
                    sku: true,
                },
            },
            _count: {
                select: {
                    variants: true,
                    images: true,
                    reviews: true,
                },
            },
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
    });
}
async function getHomepageCategoryProducts() {
    const categories = await prisma_1.prisma.category.findMany({
        select: {
            id: true,
            name: true,
            slug: true,
        },
        take: 3,
        orderBy: { id: "asc" },
    });
    const categoryProducts = await Promise.all(categories.map(async (cat) => {
        const products = await prisma_1.prisma.product.findMany({
            where: { categoryId: cat.id },
            select: {
                ...productSelect,
                category: { select: { id: true, name: true, slug: true } },
                images: { select: { id: true, imageUrl: true, publicId: true } },
                variants: { select: { id: true, size: true, color: true, stock: true } },
                _count: { select: { reviews: true } },
            },
            take: 4,
            orderBy: { createdAt: "desc" },
        });
        return {
            ...cat,
            products,
        };
    }));
    return categoryProducts;
}
async function searchProducts(q, limit = 20, offset = 0) {
    const query = q.trim();
    if (!query)
        return [];
    return prisma_1.prisma.product.findMany({
        where: {
            OR: [
                { title: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
            ],
        },
        select: {
            ...productSelect,
            category: { select: { id: true, name: true, slug: true } },
            images: { select: { id: true, imageUrl: true } },
            variants: { select: { id: true, size: true, color: true, stock: true } },
            _count: { select: { variants: true, images: true, reviews: true } },
        },
        take: limit,
        skip: offset,
    });
}
async function getProductById(id) {
    return prisma_1.prisma.product.findUnique({
        where: { id },
        select: {
            ...productSelect,
            category: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
            variants: {
                select: {
                    id: true,
                    size: true,
                    color: true,
                    stock: true,
                    sku: true,
                },
            },
            images: {
                select: {
                    id: true,
                    imageUrl: true,
                    publicId: true,
                },
            },
            reviews: {
                take: 10,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    rating: true,
                    comment: true,
                    createdAt: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
            _count: {
                select: {
                    reviews: true,
                },
            },
        },
    });
}
async function getProductBySlug(slug) {
    return prisma_1.prisma.product.findFirst({
        where: { slug },
        select: {
            ...productSelect,
            category: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
            variants: {
                select: {
                    id: true,
                    size: true,
                    color: true,
                    stock: true,
                    sku: true,
                },
            },
            images: {
                select: {
                    id: true,
                    imageUrl: true,
                    publicId: true,
                },
            },
            reviews: {
                take: 10,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    rating: true,
                    comment: true,
                    createdAt: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
            _count: {
                select: {
                    reviews: true,
                },
            },
        },
    });
}
async function createProduct(input) {
    const created = await prisma_1.prisma.product.create({
        data: {
            title: input.title,
            slug: input.slug,
            description: input.description,
            price: input.price,
            discountPrice: input.discountPrice,
            categoryId: input.categoryId,
        },
        select: productSelect,
    });
    // Sync size-based variants if provided
    if (input.variants && input.variants.length > 0) {
        await syncProductVariants(created.id, input.variants);
    }
    return created;
}
async function updateProduct(id, input) {
    const updated = await prisma_1.prisma.product.update({
        where: { id },
        data: {
            ...(input.title !== undefined ? { title: input.title } : {}),
            ...(input.slug !== undefined ? { slug: input.slug } : {}),
            ...(input.description !== undefined
                ? { description: input.description }
                : {}),
            ...(input.price !== undefined ? { price: input.price } : {}),
            ...(input.discountPrice !== undefined
                ? { discountPrice: input.discountPrice }
                : {}),
            ...(input.categoryId !== undefined
                ? { categoryId: input.categoryId }
                : {}),
        },
        select: productSelect,
    });
    if (input.variants && input.variants.length > 0) {
        await syncProductVariants(id, input.variants);
    }
    return updated;
}
async function syncProductVariants(productId, variants) {
    for (const v of variants) {
        const size = v.size || "M";
        const color = v.color || "Default";
        const sku = v.sku || `PROD-${productId}-${color.slice(0, 3).toUpperCase()}-${size}`;
        const stock = Math.max(0, Number(v.stock) || 0);
        await prisma_1.prisma.productVariant.upsert({
            where: {
                productId_size_color: {
                    productId,
                    size,
                    color,
                },
            },
            update: {
                stock,
                sku,
            },
            create: {
                productId,
                size,
                color,
                stock,
                sku,
            },
        });
    }
}
async function deleteProduct(id) {
    return prisma_1.prisma.product.delete({
        where: { id },
        select: productSelect,
    });
}
async function getProductImages(productId) {
    return prisma_1.prisma.productImage.findMany({
        where: { productId },
        select: {
            id: true,
            productId: true,
            imageUrl: true,
            publicId: true,
        },
        orderBy: { id: "asc" },
    });
}
async function addProductImage(input) {
    return prisma_1.prisma.productImage.create({
        data: {
            productId: input.productId,
            imageUrl: input.imageUrl,
            publicId: input.publicId ?? null,
        },
        select: {
            id: true,
            productId: true,
            imageUrl: true,
            publicId: true,
        },
    });
}
async function removeProductImage(id) {
    return prisma_1.prisma.productImage.delete({
        where: { id },
        select: {
            id: true,
            productId: true,
            imageUrl: true,
            publicId: true,
        },
    });
}
//# sourceMappingURL=product.service.js.map