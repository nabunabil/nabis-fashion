"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.variantController = void 0;
const appError_1 = require("../../shared/errors/appError");
const validation_1 = require("../../shared/validation");
const variant_service_1 = require("./variant.service");
function parseId(value, field) {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
        throw new appError_1.AppError(400, `Invalid ${field}`, "VALIDATION_ERROR");
    }
    return id;
}
function parseCreate(body) {
    return {
        productId: (0, validation_1.requirePositiveInt)(body.productId, "Product ID"),
        sku: (0, validation_1.requireString)(body.sku, "SKU", 100),
        size: (0, validation_1.requireString)(body.size, "Size", 50),
        color: (0, validation_1.requireString)(body.color, "Color", 80),
        stock: (0, validation_1.requireNonNegativeInt)(body.stock, "Stock"),
    };
}
exports.variantController = {
    async list(req, res) {
        const productId = req.query.productId === undefined
            ? undefined
            : parseId(String(req.query.productId), "product ID");
        return res.json({
            success: true,
            data: await (0, variant_service_1.listVariants)(productId),
        });
    },
    async get(req, res) {
        const variant = await (0, variant_service_1.getVariant)(parseId(String(req.params.id), "variant ID"));
        if (!variant) {
            throw new appError_1.AppError(404, "Variant not found", "VARIANT_NOT_FOUND");
        }
        return res.json({ success: true, data: variant });
    },
    async create(req, res) {
        const variant = await (0, variant_service_1.createVariant)(parseCreate(req.body));
        return res.status(201).json({
            success: true,
            message: "Variant created",
            data: variant,
        });
    },
    async update(req, res) {
        const body = req.body;
        const input = {};
        if (body.productId !== undefined) {
            input.productId = (0, validation_1.requirePositiveInt)(body.productId, "Product ID");
        }
        if (body.sku !== undefined)
            input.sku = (0, validation_1.requireString)(body.sku, "SKU", 100);
        if (body.size !== undefined) {
            input.size = (0, validation_1.requireString)(body.size, "Size", 50);
        }
        if (body.color !== undefined) {
            input.color = (0, validation_1.requireString)(body.color, "Color", 80);
        }
        if (body.stock !== undefined) {
            input.stock = (0, validation_1.requireNonNegativeInt)(body.stock, "Stock");
        }
        if (Object.keys(input).length === 0) {
            throw new appError_1.AppError(400, "At least one field is required", "VALIDATION_ERROR");
        }
        return res.json({
            success: true,
            message: "Variant updated",
            data: await (0, variant_service_1.updateVariant)(parseId(String(req.params.id), "variant ID"), input),
        });
    },
    async delete(req, res) {
        await (0, variant_service_1.deleteVariant)(parseId(String(req.params.id), "variant ID"));
        return res.json({ success: true, message: "Variant deleted" });
    },
};
//# sourceMappingURL=variant.controller.js.map