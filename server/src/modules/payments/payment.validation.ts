import {
  optionalBoolean,
  optionalString,
  requireString,
} from "../../shared/validation";
import type { ShippingInfo } from "../orders/order-workflow.service";

export function parseShippingInfo(body: Record<string, unknown>): ShippingInfo {
  const county = optionalString(body.county, "County", 120);
  const deliveryInstructions = optionalString(
    body.deliveryInstructions,
    "Delivery instructions",
    1000,
  );

  return {
    name: requireString(body.name, "Name", 120),
    number: requireString(body.number, "Phone number", 40),
    address: requireString(body.address, "Address", 1000),
    city: requireString(body.city, "City", 120),
    postalCode: optionalString(body.postalCode, "Postal code", 30) ?? "",
    country:
      optionalString(body.country, "Country", 120) ?? "Bangladesh",
    isInsideCity: optionalBoolean(body.isInsideCity, true),
    ...(county ? { county } : {}),
    ...(deliveryInstructions ? { deliveryInstructions } : {}),
  };
}
