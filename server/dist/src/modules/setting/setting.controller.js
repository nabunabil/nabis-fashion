"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingController = void 0;
const setting_service_1 = require("./setting.service");
exports.settingController = {
    async getSettings(_req, res) {
        try {
            const settings = await (0, setting_service_1.getStoreSettings)();
            return res.status(200).json({ success: true, data: settings });
        }
        catch (err) {
            console.error("Error fetching settings:", err);
            return res.status(500).json({ success: false, message: "Failed to fetch settings" });
        }
    },
    async updateSettings(req, res) {
        try {
            const updated = await (0, setting_service_1.updateStoreSettings)(req.body);
            return res.status(200).json({ success: true, data: updated });
        }
        catch (err) {
            console.error("Error updating settings:", err);
            return res.status(500).json({ success: false, message: "Failed to update settings" });
        }
    },
};
//# sourceMappingURL=setting.controller.js.map