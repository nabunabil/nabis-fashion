import { prisma } from "../../lib/prisma";
import { mapPrismaError } from "../../shared/errors/prisma";

type UpdateMyProfileInput = {
  name?: string;
  phone?: string;
  image?: string | null;
};

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
} as const;

export async function getUserProfileByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: userSelect,
  });
}

export interface UserQueryOptions {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  role?: string | undefined;
}

export async function getPaginatedUsers(options: UserQueryOptions = {}) {
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.max(1, Math.min(Number(options.limit) || 15, 100)); // Default 15 users per page
  const skip = (page - 1) * limit;

  const where: any = {};

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
    prisma.user.findMany({
      where,
      select: userSelect,
      take: limit,
      skip,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
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

export async function getAllUsers(limit: number = 50, offset: number = 0) {
  return prisma.user.findMany({
    select: userSelect,
    take: limit,
    skip: offset,
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserById(id: number) {
  return prisma.user.findUnique({
    where: { id },
    select: userSelect,
  });
}

export async function getUserCount() {
  return prisma.user.count();
}

export async function deleteUserById(id: number) {
  try {
    return await prisma.user.delete({
      where: { id },
      select: userSelect,
    });
  } catch (error) {
    const mappedError = mapPrismaError(error);

    if (mappedError) {
      throw mappedError;
    }

    throw error;
  }
}

export async function updateUserRoleById(id: number, role: string) {
  return prisma.user.update({
    where: { id },
    data: { role },
    select: userSelect,
  });
}

export async function updateUserProfileByEmail(
  email: string,
  input: UpdateMyProfileInput,
) {
  try {
    return await prisma.user.update({
      where: { email },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
        ...(input.image !== undefined ? { image: input.image } : {}),
      },
      select: userSelect,
    });
  } catch (error) {
    const mappedError = mapPrismaError(error);

    if (mappedError) {
      throw mappedError;
    }

    throw error;
  }
}
