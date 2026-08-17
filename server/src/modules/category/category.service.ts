import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/errors/appError";

export interface CreateCategoryInput {
  name: string;
  slug: string;
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
}

const categorySelect = {
  id: true,
  name: true,
  slug: true,
  _count: {
    select: {
      products: true,
    },
  },
} as const;

export async function getAllCategories() {
  return prisma.category.findMany({
    select: categorySelect,
    orderBy: { name: "asc" },
  });
}

export async function getCategoryById(id: number) {
  return prisma.category.findUnique({
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

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findFirst({
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

export async function createCategory(input: CreateCategoryInput) {
  const existing = await prisma.category.findFirst({
    where: {
      OR: [{ name: input.name }, { slug: input.slug }],
    },
    select: { id: true },
  });

  if (existing) {
    throw new AppError(
      409,
      "Category with provided name or slug already exists",
      "CATEGORY_EXISTS",
    );
  }

  return prisma.category.create({
    data: {
      name: input.name,
      slug: input.slug,
    },
    select: categorySelect,
  });
}

export async function updateCategory(id: number, input: UpdateCategoryInput) {
  if (input.name || input.slug) {
    const conflict = await prisma.category.findFirst({
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
      throw new AppError(
        409,
        "Another category with that name or slug already exists",
        "CATEGORY_CONFLICT",
      );
    }
  }

  return prisma.category.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.slug !== undefined ? { slug: input.slug } : {}),
    },
    select: categorySelect,
  });
}

export async function deleteCategory(id: number) {
  const productCount = await prisma.product.count({
    where: { categoryId: id },
  });

  if (productCount > 0) {
    throw new AppError(
      400,
      "Cannot delete category with associated products",
      "CATEGORY_HAS_PRODUCTS",
    );
  }

  return prisma.category.delete({
    where: { id },
    select: categorySelect,
  });
}
