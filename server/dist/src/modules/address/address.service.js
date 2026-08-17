"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUserAddresses = listUserAddresses;
exports.createUserAddress = createUserAddress;
exports.updateUserAddress = updateUserAddress;
exports.setDefaultUserAddress = setDefaultUserAddress;
exports.deleteUserAddress = deleteUserAddress;
const prisma_1 = require("../../lib/prisma");
const appError_1 = require("../../shared/errors/appError");
async function getUserIdByEmail(email) {
    const user = await prisma_1.prisma.user.findUnique({
        where: { email },
        select: { id: true },
    });
    return user?.id ?? null;
}
async function listUserAddresses(email) {
    const userId = await getUserIdByEmail(email);
    if (!userId)
        throw new appError_1.AppError(404, "User not found", "USER_NOT_FOUND");
    return prisma_1.prisma.userAddress.findMany({
        where: { userId },
        orderBy: [
            { isDefault: "desc" },
            { createdAt: "desc" },
        ],
    });
}
async function createUserAddress(email, data) {
    const userId = await getUserIdByEmail(email);
    if (!userId)
        throw new appError_1.AppError(404, "User not found", "USER_NOT_FOUND");
    const existingCount = await prisma_1.prisma.userAddress.count({ where: { userId } });
    const shouldBeDefault = data.isDefault || existingCount === 0;
    if (shouldBeDefault) {
        await prisma_1.prisma.userAddress.updateMany({
            where: { userId },
            data: { isDefault: false },
        });
    }
    return prisma_1.prisma.userAddress.create({
        data: {
            userId,
            label: data.label?.trim() || "Home",
            name: data.name.trim(),
            phone: data.phone.trim(),
            street: data.street.trim(),
            city: data.city.trim(),
            state: data.state.trim(),
            zip: data.zip.trim(),
            country: data.country?.trim() || "Bangladesh",
            isDefault: shouldBeDefault,
        },
    });
}
async function updateUserAddress(email, id, data) {
    const userId = await getUserIdByEmail(email);
    if (!userId)
        throw new appError_1.AppError(404, "User not found", "USER_NOT_FOUND");
    const existing = await prisma_1.prisma.userAddress.findFirst({
        where: { id, userId },
    });
    if (!existing)
        throw new appError_1.AppError(404, "Address not found", "ADDRESS_NOT_FOUND");
    if (data.isDefault) {
        await prisma_1.prisma.userAddress.updateMany({
            where: { userId, id: { not: id } },
            data: { isDefault: false },
        });
    }
    return prisma_1.prisma.userAddress.update({
        where: { id },
        data: {
            label: data.label !== undefined ? data.label.trim() : existing.label,
            name: data.name !== undefined ? data.name.trim() : existing.name,
            phone: data.phone !== undefined ? data.phone.trim() : existing.phone,
            street: data.street !== undefined ? data.street.trim() : existing.street,
            city: data.city !== undefined ? data.city.trim() : existing.city,
            state: data.state !== undefined ? data.state.trim() : existing.state,
            zip: data.zip !== undefined ? data.zip.trim() : existing.zip,
            country: data.country !== undefined ? data.country.trim() : existing.country,
            isDefault: data.isDefault !== undefined ? data.isDefault : existing.isDefault,
        },
    });
}
async function setDefaultUserAddress(email, id) {
    const userId = await getUserIdByEmail(email);
    if (!userId)
        throw new appError_1.AppError(404, "User not found", "USER_NOT_FOUND");
    const existing = await prisma_1.prisma.userAddress.findFirst({
        where: { id, userId },
    });
    if (!existing)
        throw new appError_1.AppError(404, "Address not found", "ADDRESS_NOT_FOUND");
    await prisma_1.prisma.userAddress.updateMany({
        where: { userId },
        data: { isDefault: false },
    });
    return prisma_1.prisma.userAddress.update({
        where: { id },
        data: { isDefault: true },
    });
}
async function deleteUserAddress(email, id) {
    const userId = await getUserIdByEmail(email);
    if (!userId)
        throw new appError_1.AppError(404, "User not found", "USER_NOT_FOUND");
    const existing = await prisma_1.prisma.userAddress.findFirst({
        where: { id, userId },
    });
    if (!existing)
        throw new appError_1.AppError(404, "Address not found", "ADDRESS_NOT_FOUND");
    await prisma_1.prisma.userAddress.delete({ where: { id } });
    // If deleted address was default, make the next newest address default
    if (existing.isDefault) {
        const nextAddress = await prisma_1.prisma.userAddress.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
        if (nextAddress) {
            await prisma_1.prisma.userAddress.update({
                where: { id: nextAddress.id },
                data: { isDefault: true },
            });
        }
    }
    return { success: true };
}
//# sourceMappingURL=address.service.js.map