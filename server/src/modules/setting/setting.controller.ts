import type { Request, Response } from "express";
import { getStoreSettings, updateStoreSettings } from "./setting.service";

export const settingController = {
  async getSettings(_req: Request, res: Response) {
    try {
      const settings = await getStoreSettings();
      return res.status(200).json({ success: true, data: settings });
    } catch (err) {
      console.error("Error fetching settings:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch settings" });
    }
  },

  async updateSettings(req: Request, res: Response) {
    try {
      const updated = await updateStoreSettings(req.body);
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      console.error("Error updating settings:", err);
      return res.status(500).json({ success: false, message: "Failed to update settings" });
    }
  },
};
