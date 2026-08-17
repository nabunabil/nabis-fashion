import type { Request, Response } from "express";
import { AppError } from "../../shared/errors/appError";
import {
  requireNonNegativeInt,
  requirePositiveInt,
  requireString,
} from "../../shared/validation";
import {
  createVariant,
  deleteVariant,
  getVariant,
  listVariants,
  updateVariant,
  type VariantInput,
} from "./variant.service";

function parseId(value: string | undefined, field: string): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, `Invalid ${field}`, "VALIDATION_ERROR");
  }
  return id;
}

function parseCreate(body: Record<string, unknown>): VariantInput {
  return {
    productId: requirePositiveInt(body.productId, "Product ID"),
    sku: requireString(body.sku, "SKU", 100),
    size: requireString(body.size, "Size", 50),
    color: requireString(body.color, "Color", 80),
    stock: requireNonNegativeInt(body.stock, "Stock"),
  };
}

export const variantController = {
  async list(req: Request, res: Response) {
    const productId =
      req.query.productId === undefined
        ? undefined
        : parseId(String(req.query.productId), "product ID");
    return res.json({
      success: true,
      data: await listVariants(productId),
    });
  },

  async get(req: Request, res: Response) {
    const variant = await getVariant(parseId(String(req.params.id), "variant ID"));
    if (!variant) {
      throw new AppError(404, "Variant not found", "VARIANT_NOT_FOUND");
    }
    return res.json({ success: true, data: variant });
  },

  async create(req: Request, res: Response) {
    const variant = await createVariant(parseCreate(req.body));
    return res.status(201).json({
      success: true,
      message: "Variant created",
      data: variant,
    });
  },

  async update(req: Request, res: Response) {
    const body = req.body as Record<string, unknown>;
    const input: Partial<VariantInput> = {};
    if (body.productId !== undefined) {
      input.productId = requirePositiveInt(body.productId, "Product ID");
    }
    if (body.sku !== undefined) input.sku = requireString(body.sku, "SKU", 100);
    if (body.size !== undefined) {
      input.size = requireString(body.size, "Size", 50);
    }
    if (body.color !== undefined) {
      input.color = requireString(body.color, "Color", 80);
    }
    if (body.stock !== undefined) {
      input.stock = requireNonNegativeInt(body.stock, "Stock");
    }
    if (Object.keys(input).length === 0) {
      throw new AppError(
        400,
        "At least one field is required",
        "VALIDATION_ERROR",
      );
    }

    return res.json({
      success: true,
      message: "Variant updated",
      data: await updateVariant(parseId(String(req.params.id), "variant ID"), input),
    });
  },

  async delete(req: Request, res: Response) {
    await deleteVariant(parseId(String(req.params.id), "variant ID"));
    return res.json({ success: true, message: "Variant deleted" });
  },
};
