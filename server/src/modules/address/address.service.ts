import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/errors/appError";

async function getUserIdByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  return user?.id ?? null;
}

export type AddressPayload = {
  label?: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
  isDefault?: boolean;
};

export async function listUserAddresses(email: string) {
  const userId = await getUserIdByEmail(email);
  if (!userId) throw new AppError(404, "User not found", "USER_NOT_FOUND");

  return prisma.userAddress.findMany({
    where: { userId },
    orderBy: [
      { isDefault: "desc" },
      { createdAt: "desc" },
    ],
  });
}

export async function createUserAddress(email: string, data: AddressPayload) {
  const userId = await getUserIdByEmail(email);
  if (!userId) throw new AppError(404, "User not found", "USER_NOT_FOUND");

  const existingCount = await prisma.userAddress.count({ where: { userId } });
  const shouldBeDefault = data.isDefault || existingCount === 0;

  if (shouldBeDefault) {
    await prisma.userAddress.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  return prisma.userAddress.create({
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

export async function updateUserAddress(
  email: string,
  id: number,
  data: AddressPayload,
) {
  const userId = await getUserIdByEmail(email);
  if (!userId) throw new AppError(404, "User not found", "USER_NOT_FOUND");

  const existing = await prisma.userAddress.findFirst({
    where: { id, userId },
  });
  if (!existing) throw new AppError(404, "Address not found", "ADDRESS_NOT_FOUND");

  if (data.isDefault) {
    await prisma.userAddress.updateMany({
      where: { userId, id: { not: id } },
      data: { isDefault: false },
    });
  }

  return prisma.userAddress.update({
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

export async function setDefaultUserAddress(email: string, id: number) {
  const userId = await getUserIdByEmail(email);
  if (!userId) throw new AppError(404, "User not found", "USER_NOT_FOUND");

  const existing = await prisma.userAddress.findFirst({
    where: { id, userId },
  });
  if (!existing) throw new AppError(404, "Address not found", "ADDRESS_NOT_FOUND");

  await prisma.userAddress.updateMany({
    where: { userId },
    data: { isDefault: false },
  });

  return prisma.userAddress.update({
    where: { id },
    data: { isDefault: true },
  });
}

export async function deleteUserAddress(email: string, id: number) {
  const userId = await getUserIdByEmail(email);
  if (!userId) throw new AppError(404, "User not found", "USER_NOT_FOUND");

  const existing = await prisma.userAddress.findFirst({
    where: { id, userId },
  });
  if (!existing) throw new AppError(404, "Address not found", "ADDRESS_NOT_FOUND");

  await prisma.userAddress.delete({ where: { id } });

  // If deleted address was default, make the next newest address default
  if (existing.isDefault) {
    const nextAddress = await prisma.userAddress.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    if (nextAddress) {
      await prisma.userAddress.update({
        where: { id: nextAddress.id },
        data: { isDefault: true },
      });
    }
  }

  return { success: true };
}
