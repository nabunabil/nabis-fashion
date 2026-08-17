"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseShippingInfo = parseShippingInfo;
const validation_1 = require("../../shared/validation");
function parseShippingInfo(body) {
    const county = (0, validation_1.optionalString)(body.county, "County", 120);
    const deliveryInstructions = (0, validation_1.optionalString)(body.deliveryInstructions, "Delivery instructions", 1000);
    return {
        name: (0, validation_1.requireString)(body.name, "Name", 120),
        number: (0, validation_1.requireString)(body.number, "Phone number", 40),
        address: (0, validation_1.requireString)(body.address, "Address", 1000),
        city: (0, validation_1.requireString)(body.city, "City", 120),
        postalCode: (0, validation_1.optionalString)(body.postalCode, "Postal code", 30) ?? "",
        country: (0, validation_1.optionalString)(body.country, "Country", 120) ?? "Bangladesh",
        isInsideCity: (0, validation_1.optionalBoolean)(body.isInsideCity, true),
        ...(county ? { county } : {}),
        ...(deliveryInstructions ? { deliveryInstructions } : {}),
    };
}
//# sourceMappingURL=payment.validation.js.map