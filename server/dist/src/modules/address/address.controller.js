"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAddressesHandler = getAddressesHandler;
exports.createAddressHandler = createAddressHandler;
exports.updateAddressHandler = updateAddressHandler;
exports.setDefaultAddressHandler = setDefaultAddressHandler;
exports.deleteAddressHandler = deleteAddressHandler;
const address_service_1 = require("./address.service");
const appError_1 = require("../../shared/errors/appError");
function getAuthEmail(res) {
    const email = res.locals.authUser?.email;
    if (!email)
        throw new appError_1.AppError(401, "Unauthorized", "UNAUTHORIZED");
    return email;
}
async function getAddressesHandler(_req, res, next) {
    try {
        const email = getAuthEmail(res);
        const addresses = await (0, address_service_1.listUserAddresses)(email);
        res.json({ success: true, data: addresses });
    }
    catch (error) {
        next(error);
    }
}
async function createAddressHandler(req, res, next) {
    try {
        const email = getAuthEmail(res);
        const { label, name, phone, street, city, state, zip, country, isDefault } = req.body;
        if (!name || !phone || !street || !city) {
            throw new appError_1.AppError(400, "Missing required address fields", "VALIDATION_ERROR");
        }
        const created = await (0, address_service_1.createUserAddress)(email, {
            label,
            name,
            phone,
            street,
            city,
            state: state || city,
            zip: zip || "",
            country,
            isDefault: Boolean(isDefault),
        });
        res.status(201).json({ success: true, data: created });
    }
    catch (error) {
        next(error);
    }
}
async function updateAddressHandler(req, res, next) {
    try {
        const email = getAuthEmail(res);
        const id = Number(req.params.id);
        if (isNaN(id))
            throw new appError_1.AppError(400, "Invalid address ID", "VALIDATION_ERROR");
        const updated = await (0, address_service_1.updateUserAddress)(email, id, req.body);
        res.json({ success: true, data: updated });
    }
    catch (error) {
        next(error);
    }
}
async function setDefaultAddressHandler(req, res, next) {
    try {
        const email = getAuthEmail(res);
        const id = Number(req.params.id);
        if (isNaN(id))
            throw new appError_1.AppError(400, "Invalid address ID", "VALIDATION_ERROR");
        const updated = await (0, address_service_1.setDefaultUserAddress)(email, id);
        res.json({ success: true, data: updated });
    }
    catch (error) {
        next(error);
    }
}
async function deleteAddressHandler(req, res, next) {
    try {
        const email = getAuthEmail(res);
        const id = Number(req.params.id);
        if (isNaN(id))
            throw new appError_1.AppError(400, "Invalid address ID", "VALIDATION_ERROR");
        await (0, address_service_1.deleteUserAddress)(email, id);
        res.json({ success: true, message: "Address deleted successfully" });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=address.controller.js.map