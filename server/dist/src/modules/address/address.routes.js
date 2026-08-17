"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addressRoutes = void 0;
const express_1 = require("express");
const requireAuth_1 = require("../../shared/middleware/requireAuth");
const address_controller_1 = require("./address.controller");
exports.addressRoutes = (0, express_1.Router)();
exports.addressRoutes.use(requireAuth_1.requireAuth);
exports.addressRoutes.get("/", address_controller_1.getAddressesHandler);
exports.addressRoutes.post("/", address_controller_1.createAddressHandler);
exports.addressRoutes.put("/:id", address_controller_1.updateAddressHandler);
exports.addressRoutes.patch("/:id", address_controller_1.updateAddressHandler);
exports.addressRoutes.patch("/:id/default", address_controller_1.setDefaultAddressHandler);
exports.addressRoutes.delete("/:id", address_controller_1.deleteAddressHandler);
//# sourceMappingURL=address.routes.js.map