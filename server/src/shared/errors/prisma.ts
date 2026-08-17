import { AppError } from "./appError";

type PrismaLikeError = {
  code?: string;
  meta?: {
    target?: string[];
  };
};

export function mapPrismaError(error: unknown): AppError | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const prismaError = error as PrismaLikeError;

  if (prismaError.code === "P2025") {
    return new AppError(404, "Resource not found", "RESOURCE_NOT_FOUND");
  }

  if (prismaError.code === "P2003") {
    return new AppError(
      400,
      "Related resource not found",
      "RELATED_RESOURCE_NOT_FOUND",
    );
  }

  if (prismaError.code === "P2002") {
    const target = prismaError.meta?.target?.join(", ") || "field";
    return new AppError(
      409,
      `A record with this ${target} already exists`,
      "DUPLICATE_RESOURCE",
    );
  }

  return null;
}
