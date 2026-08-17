"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.couponController = void 0;
const coupon_service_1 = require("./coupon.service");
exports.couponController = {
    async getCoupons(_req, res) {
        try {
            const coupons = await (0, coupon_service_1.getAllCoupons)();
            return res.status(200).json({ success: true, data: coupons });
        }
        catch (err) {
            console.error("Error getting coupons:", err);
            return res.status(500).json({ success: false, message: "Failed to fetch coupons" });
        }
    },
    async create(req, res) {
        try {
            const { code, discountType, discountAmount, minOrderValue, usageLimit, expiresAt } = req.body;
            if (!code || !discountAmount) {
                return res.status(400).json({ success: false, message: "Code and discountAmount required" });
            }
            const coupon = await (0, coupon_service_1.createCoupon)({
                code,
                discountType,
                discountAmount: Number(discountAmount),
                minOrderValue: Number(minOrderValue || 0),
                usageLimit: Number(usageLimit || 100),
                expiresAt,
            });
            return res.status(201).json({ success: true, data: coupon });
        }
        catch (err) {
            console.error("Error creating coupon:", err);
            return res.status(500).json({ success: false, message: err.message || "Failed to create coupon" });
        }
    },
    async toggleStatus(req, res) {
        try {
            const { id } = req.params;
            const { isActive } = req.body;
            const coupon = await (0, coupon_service_1.toggleCouponStatus)(Number(id), Boolean(isActive));
            return res.status(200).json({ success: true, data: coupon });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: "Failed to update coupon status" });
        }
    },
    async remove(req, res) {
        try {
            const { id } = req.params;
            await (0, coupon_service_1.deleteCoupon)(Number(id));
            return res.status(200).json({ success: true, message: "Coupon deleted" });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: "Failed to delete coupon" });
        }
    },
    async validateCode(req, res) {
        try {
            const rawCode = String(req.params.code || req.body?.code || "").trim();
            const cartSubtotal = Number(req.query.cartSubtotal || req.query.subtotal || req.body?.cartSubtotal || req.body?.subtotal || 0);
            if (!rawCode) {
                return res.status(400).json({ success: false, message: "Coupon code is required" });
            }
            const coupon = await (0, coupon_service_1.getCouponByCode)(rawCode);
            if (!coupon || !coupon.isActive) {
                return res.status(404).json({ success: false, message: "Invalid or inactive coupon code" });
            }
            if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
                return res.status(400).json({ success: false, message: "This coupon code has expired" });
            }
            if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
                return res.status(400).json({ success: false, message: "This coupon code has reached its maximum usage limit" });
            }
            const minOrderVal = Number(coupon.minOrderValue || 0);
            if (cartSubtotal > 0 && cartSubtotal < minOrderVal) {
                return res.status(400).json({
                    success: false,
                    message: `Minimum order value of $${minOrderVal.toFixed(2)} required for this coupon`,
                });
            }
            const discountAmtNum = Number(coupon.discountAmount);
            let calculatedDiscount = 0;
            if (coupon.discountType === "percentage") {
                calculatedDiscount = cartSubtotal > 0 ? (cartSubtotal * discountAmtNum) / 100 : discountAmtNum;
            }
            else {
                calculatedDiscount = discountAmtNum;
            }
            // Cap discount to cartSubtotal if subtotal provided
            if (cartSubtotal > 0 && calculatedDiscount > cartSubtotal) {
                calculatedDiscount = cartSubtotal;
            }
            return res.status(200).json({
                success: true,
                data: {
                    id: coupon.id,
                    code: coupon.code,
                    discountType: coupon.discountType,
                    discountAmount: discountAmtNum,
                    minOrderValue: minOrderVal,
                    calculatedDiscount: Number(calculatedDiscount.toFixed(2)),
                    expiresAt: coupon.expiresAt,
                },
            });
        }
        catch (err) {
            console.error("Error validating coupon:", err);
            return res.status(500).json({ success: false, message: "Failed to validate coupon code" });
        }
    },
};
//# sourceMappingURL=coupon.controller.js.map