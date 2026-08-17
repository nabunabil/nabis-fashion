"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStoreSettings = getStoreSettings;
exports.updateStoreSettings = updateStoreSettings;
const prisma_1 = require("../../lib/prisma");
async function getStoreSettings() {
    let settings = await prisma_1.prisma.storeSetting.findUnique({
        where: { id: 1 },
    });
    if (!settings) {
        settings = await prisma_1.prisma.storeSetting.create({
            data: {
                id: 1,
                storeName: "NABIS FASHION",
                tagline: "Luxury Bengali Panjabi, Sarees & Designer Attire",
                supportEmail: "support@nabisfashion.com",
                supportPhone: "+880 1711 000 000",
                currency: "GBP (£)",
                storeAddress: "House 45, Road 11, Banani, Dhaka, Bangladesh",
                insideCityFee: 10.00,
                outsideCityFee: 15.00,
                freeShippingMinOrder: 50.00,
                estimatedDeliveryDays: "2-4 Business Days",
                enableCOD: true,
                enableSSLCommerz: true,
                enableStripe: true,
                vatTaxRate: "0.0%",
                metaTitle: "NABIS FASHION | Luxury Punjabis, Sarees & Ethnic Clothing",
                metaDescription: "Discover handcrafted Punjabi collections, designer Sarees, and premium fashion accessories at NABIS FASHION.",
                instagram: "https://instagram.com/nabisfashion",
                facebook: "https://facebook.com/nabisfashion",
            },
        });
    }
    return settings;
}
async function updateStoreSettings(data) {
    const existing = await getStoreSettings();
    return prisma_1.prisma.storeSetting.update({
        where: { id: existing.id },
        data: {
            storeName: data.storeName ?? existing.storeName,
            tagline: data.tagline ?? existing.tagline,
            supportEmail: data.supportEmail ?? existing.supportEmail,
            supportPhone: data.supportPhone ?? existing.supportPhone,
            currency: data.currency ?? existing.currency,
            storeAddress: data.storeAddress ?? existing.storeAddress,
            insideCityFee: data.insideCityFee !== undefined ? Number(data.insideCityFee) : existing.insideCityFee,
            outsideCityFee: data.outsideCityFee !== undefined ? Number(data.outsideCityFee) : existing.outsideCityFee,
            freeShippingMinOrder: data.freeShippingMinOrder !== undefined ? Number(data.freeShippingMinOrder) : existing.freeShippingMinOrder,
            estimatedDeliveryDays: data.estimatedDeliveryDays ?? existing.estimatedDeliveryDays,
            enableCOD: data.enableCOD !== undefined ? Boolean(data.enableCOD) : existing.enableCOD,
            enableSSLCommerz: data.enableSSLCommerz !== undefined ? Boolean(data.enableSSLCommerz) : existing.enableSSLCommerz,
            enableStripe: data.enableStripe !== undefined ? Boolean(data.enableStripe) : existing.enableStripe,
            vatTaxRate: data.vatTaxRate ?? existing.vatTaxRate,
            metaTitle: data.metaTitle ?? existing.metaTitle,
            metaDescription: data.metaDescription ?? existing.metaDescription,
            instagram: data.instagram ?? existing.instagram,
            facebook: data.facebook ?? existing.facebook,
        },
    });
}
//# sourceMappingURL=setting.service.js.map