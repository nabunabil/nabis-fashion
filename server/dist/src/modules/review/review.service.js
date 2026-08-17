"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReviewsByProductId = getReviewsByProductId;
exports.getAllReviews = getAllReviews;
exports.upsertMyReviewByEmail = upsertMyReviewByEmail;
exports.deleteMyReviewByEmail = deleteMyReviewByEmail;
exports.deleteReviewById = deleteReviewById;
exports.setReviewHiddenById = setReviewHiddenById;
const prisma_1 = require("../../lib/prisma");
async function getUserIdByEmail(email) {
    const user = await prisma_1.prisma.user.findUnique({
        where: { email },
        select: { id: true },
    });
    return user?.id ?? null;
}
async function ensureProductExists(productId) {
    const product = await prisma_1.prisma.product.findUnique({
        where: { id: productId },
        select: { id: true },
    });
    return product ?? null;
}
const reviewSelect = {
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
    product: {
        select: {
            id: true,
            title: true,
            slug: true,
        },
    },
};
async function getReviewsByProductId(productId, page = 1, limit = 10, includeHidden = false) {
    const take = Math.max(1, Math.min(100, Number(limit ?? 10)));
    const currentPage = Math.max(1, Number(page ?? 1));
    const skip = (currentPage - 1) * take;
    const where = { productId };
    if (!includeHidden) {
        where.isHidden = false;
    }
    const [reviews, total] = await Promise.all([
        prisma_1.prisma.review.findMany({
            where,
            select: reviewSelect,
            orderBy: { createdAt: "desc" },
            skip,
            take,
        }),
        prisma_1.prisma.review.count({ where }),
    ]);
    return { reviews, total, page: currentPage, limit: take };
}
async function getAllReviews(page = 1, limit = 20, productId, userId) {
    const take = Math.max(1, Math.min(200, Number(limit ?? 20)));
    const currentPage = Math.max(1, Number(page ?? 1));
    const skip = (currentPage - 1) * take;
    const where = {};
    if (typeof productId === "number" && !Number.isNaN(productId)) {
        where.productId = productId;
    }
    if (typeof userId === "number" && !Number.isNaN(userId)) {
        where.userId = userId;
    }
    const [reviews, total] = await Promise.all([
        prisma_1.prisma.review.findMany({
            where,
            select: reviewSelect,
            orderBy: { createdAt: "desc" },
            skip,
            take,
        }),
        prisma_1.prisma.review.count({ where }),
    ]);
    return { reviews, total, page: currentPage, limit: take };
}
async function upsertMyReviewByEmail(email, productId, rating, comment) {
    const userId = await getUserIdByEmail(email);
    if (!userId) {
        return null;
    }
    const product = await ensureProductExists(productId);
    if (!product) {
        return null;
    }
    const existingReview = await prisma_1.prisma.review.findFirst({
        where: { userId, productId },
        select: { id: true },
    });
    if (existingReview) {
        return prisma_1.prisma.review.update({
            where: { id: existingReview.id },
            data: {
                rating,
                comment,
            },
            select: reviewSelect,
        });
    }
    return prisma_1.prisma.review.create({
        data: {
            userId,
            productId,
            rating,
            comment,
        },
        select: reviewSelect,
    });
}
async function deleteMyReviewByEmail(email, productId) {
    const userId = await getUserIdByEmail(email);
    if (!userId) {
        return null;
    }
    const review = await prisma_1.prisma.review.findFirst({
        where: { userId, productId },
        select: { id: true },
    });
    if (!review) {
        return null;
    }
    return prisma_1.prisma.review.delete({
        where: { id: review.id },
        select: reviewSelect,
    });
}
async function deleteReviewById(id) {
    return prisma_1.prisma.review.delete({
        where: { id },
        select: reviewSelect,
    });
}
async function setReviewHiddenById(id, hidden) {
    return prisma_1.prisma.review.update({
        where: { id },
        data: { isHidden: hidden },
        select: reviewSelect,
    });
}
//# sourceMappingURL=review.service.js.map