"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfileByEmail = getUserProfileByEmail;
exports.getPaginatedUsers = getPaginatedUsers;
exports.getAllUsers = getAllUsers;
exports.getUserById = getUserById;
exports.getUserCount = getUserCount;
exports.deleteUserById = deleteUserById;
exports.updateUserRoleById = updateUserRoleById;
exports.updateUserProfileByEmail = updateUserProfileByEmail;
const prisma_1 = require("../../lib/prisma");
const prisma_2 = require("../../shared/errors/prisma");
const userSelect = {
    id: true,
    name: true,
    email: true,
    phone: true,
    role: true,
    status: true,
    image: true,
    createdAt: true,
    updatedAt: true,
};
async function getUserProfileByEmail(email) {
    return prisma_1.prisma.user.findUnique({
        where: { email },
        select: userSelect,
    });
}
async function getPaginatedUsers(options = {}) {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.max(1, Math.min(Number(options.limit) || 15, 100)); // Default 15 users per page
    const skip = (page - 1) * limit;
    const where = {};
    if (options.role && options.role !== "all") {
        where.role = { equals: options.role, mode: "insensitive" };
    }
    if (options.search && options.search.trim() !== "") {
        const q = options.search.trim();
        where.OR = [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
        ];
    }
    const [users, totalUsers] = await Promise.all([
        prisma_1.prisma.user.findMany({
            where,
            select: userSelect,
            take: limit,
            skip,
            orderBy: { createdAt: "desc" },
        }),
        prisma_1.prisma.user.count({ where }),
    ]);
    const totalPages = Math.ceil(totalUsers / limit) || 1;
    return {
        users,
        totalUsers,
        totalPages,
        currentPage: page,
        limit,
    };
}
async function getAllUsers(limit = 50, offset = 0) {
    return prisma_1.prisma.user.findMany({
        select: userSelect,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
    });
}
async function getUserById(id) {
    return prisma_1.prisma.user.findUnique({
        where: { id },
        select: userSelect,
    });
}
async function getUserCount() {
    return prisma_1.prisma.user.count();
}
async function deleteUserById(id) {
    try {
        return await prisma_1.prisma.user.delete({
            where: { id },
            select: userSelect,
        });
    }
    catch (error) {
        const mappedError = (0, prisma_2.mapPrismaError)(error);
        if (mappedError) {
            throw mappedError;
        }
        throw error;
    }
}
async function updateUserRoleById(id, role) {
    return prisma_1.prisma.user.update({
        where: { id },
        data: { role },
        select: userSelect,
    });
}
async function updateUserProfileByEmail(email, input) {
    try {
        return await prisma_1.prisma.user.update({
            where: { email },
            data: {
                ...(input.name !== undefined ? { name: input.name } : {}),
                ...(input.phone !== undefined ? { phone: input.phone } : {}),
                ...(input.image !== undefined ? { image: input.image } : {}),
            },
            select: userSelect,
        });
    }
    catch (error) {
        const mappedError = (0, prisma_2.mapPrismaError)(error);
        if (mappedError) {
            throw mappedError;
        }
        throw error;
    }
}
//# sourceMappingURL=user.service.js.map