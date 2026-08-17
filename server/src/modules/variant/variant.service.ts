import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/errors/appError";

export type VariantInput = {
  productId: number;
  sku: string;
  size: string;
  color: string;
  stock: number;
};

const variantInclude = {
  product: {
    select: { id: true, title: true, slug: true },
  },
} as const;

export function listVariants(productId?: number) {
  return prisma.productVariant.findMany({
    ...(productId ? { where: { productId } } : {}),
    include: variantInclude,
    orderBy: [{ productId: "asc" }, { id: "asc" }],
  });
}

export function getVariant(id: number) {
  return prisma.productVariant.findUnique({
    where: { id },
    include: variantInclude,
  });
}

export async function createVariant(input: VariantInput) {
  return prisma.$transaction(async (tx) => {
    const variant = await tx.productVariant.create({
      data: input,
      include: variantInclude,
    });

    if (input.stock > 0) {
      await tx.inventoryMovement.create({
        data: {
          productVariantId: variant.id,
          quantity: input.stock,
          reason: "INITIAL_STOCK",
        },
      });
    }

    return variant;
  });
}

export async function updateVariant(
  id: number,
  input: Partial<VariantInput>,
) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.productVariant.findUnique({ where: { id } });
    if (!current) {
      throw new AppError(404, "Variant not found", "VARIANT_NOT_FOUND");
    }

    const variant = await tx.productVariant.update({
      where: { id },
      data: input,
      include: variantInclude,
    });

    if (input.stock !== undefined && input.stock !== current.stock) {
      await tx.inventoryMovement.create({
        data: {
          productVariantId: id,
          quantity: input.stock - current.stock,
          reason: "ADMIN_ADJUSTMENT",
        },
      });
    }

    return variant;
  });
}

export async function deleteVariant(id: number) {
  const orderItemCount = await prisma.orderItem.count({
    where: { productVariantId: id },
  });
  if (orderItemCount > 0) {
    throw new AppError(
      409,
      "Variants used by orders cannot be deleted",
      "VARIANT_HAS_ORDERS",
    );
  }

  return prisma.productVariant.delete({ where: { id } });
}
