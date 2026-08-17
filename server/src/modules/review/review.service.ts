import { prisma } from "../../lib/prisma";

async function getUserIdByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  return user?.id ?? null;
}

async function ensureProductExists(productId: number) {
  const product = await prisma.product.findUnique({
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
} as const;

export async function getReviewsByProductId(
  productId: number,
  page = 1,
  limit = 10,
  includeHidden = false,
) {
  const take = Math.max(1, Math.min(100, Number(limit ?? 10)));
  const currentPage = Math.max(1, Number(page ?? 1));
  const skip = (currentPage - 1) * take;

  const where: any = { productId };

  if (!includeHidden) {
    where.isHidden = false;
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      select: reviewSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.review.count({ where }),
  ]);

  return { reviews, total, page: currentPage, limit: take };
}

export async function getAllReviews(
  page = 1,
  limit = 20,
  productId?: number,
  userId?: number,
) {
  const take = Math.max(1, Math.min(200, Number(limit ?? 20)));
  const currentPage = Math.max(1, Number(page ?? 1));
  const skip = (currentPage - 1) * take;

  const where: any = {};

  if (typeof productId === "number" && !Number.isNaN(productId)) {
    where.productId = productId;
  }

  if (typeof userId === "number" && !Number.isNaN(userId)) {
    where.userId = userId;
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      select: reviewSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.review.count({ where }),
  ]);

  return { reviews, total, page: currentPage, limit: take };
}

export async function upsertMyReviewByEmail(
  email: string,
  productId: number,
  rating: number,
  comment: string,
) {
  const userId = await getUserIdByEmail(email);

  if (!userId) {
    return null;
  }

  const product = await ensureProductExists(productId);

  if (!product) {
    return null;
  }

  const existingReview = await prisma.review.findFirst({
    where: { userId, productId },
    select: { id: true },
  });

  if (existingReview) {
    return prisma.review.update({
      where: { id: existingReview.id },
      data: {
        rating,
        comment,
      },
      select: reviewSelect,
    });
  }

  return prisma.review.create({
    data: {
      userId,
      productId,
      rating,
      comment,
    },
    select: reviewSelect,
  });
}

export async function deleteMyReviewByEmail(email: string, productId: number) {
  const userId = await getUserIdByEmail(email);

  if (!userId) {
    return null;
  }

  const review = await prisma.review.findFirst({
    where: { userId, productId },
    select: { id: true },
  });

  if (!review) {
    return null;
  }

  return prisma.review.delete({
    where: { id: review.id },
    select: reviewSelect,
  });
}

export async function deleteReviewById(id: number) {
  return prisma.review.delete({
    where: { id },
    select: reviewSelect,
  });
}

export async function setReviewHiddenById(id: number, hidden: boolean) {
  return prisma.review.update({
    where: { id },
    data: { isHidden: hidden },
    select: reviewSelect,
  });
}
