import type { Request, Response } from "express";
import {
  deleteUserById,
  getAllUsers,
  getPaginatedUsers,
  getUserById,
  getUserProfileByEmail,
  updateUserProfileByEmail,
  updateUserRoleById,
} from "./user.service";
import { optionalImageUrl } from "../../shared/validation";

function getEmailFromLocals(res: Response): string | null {
  const authUser = (res.locals as { authUser?: { email?: string } }).authUser;
  return authUser?.email ?? null;
}

export const userController = {
  // Admin endpoints
  async getAllUsers(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 15;
      const search = typeof req.query.search === "string" ? req.query.search : undefined;
      const role = typeof req.query.role === "string" ? req.query.role : undefined;

      const result = await getPaginatedUsers({ page, limit, search, role });

      return res.status(200).json({
        success: true,
        data: result.users,
        totalUsers: result.totalUsers,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        limit: result.limit,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch users",
      });
    }
  },

  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = Number(id);

      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      const user = await getUserById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch user",
      });
    }
  },

  async updateUserRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const userId = Number(id);

      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      if (!role || typeof role !== "string") {
        return res.status(400).json({
          success: false,
          message: "Role is required",
        });
      }

      const targetUser = await getUserById(userId);
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Check current admin email from session
      const adminEmail = getEmailFromLocals(res);
      // Protect other admin profiles from being demoted/modified by unauthorized actions if desired
      if (targetUser.email !== adminEmail && targetUser.role === "admin" && role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "You cannot change or demote another admin profile",
        });
      }

      const updatedUser = await updateUserRoleById(userId, role.toLowerCase());

      return res.status(200).json({
        success: true,
        message: "User role updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update user role",
      });
    }
  },

  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = Number(id);

      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      const user = await deleteUserById(userId);

      return res.status(200).json({
        success: true,
        message: "User deleted successfully",
        data: user,
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete user",
      });
    }
  },

  // User endpoints

  async getMyProfile(_req: Request, res: Response) {
    const email = getEmailFromLocals(res);
    if (!email) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await getUserProfileByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  },

  async updateMyProfile(req: Request, res: Response) {
    const email = getEmailFromLocals(res);
    if (!email) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { name, phone, image } = req.body as {
      name?: unknown;
      phone?: unknown;
      image?: unknown;
    };

    const nextName = typeof name === "string" ? name.trim() : undefined;
    const nextPhone = typeof phone === "string" ? phone.trim() : undefined;
    const nextImage = optionalImageUrl(image);

    if (
      nextName === undefined &&
      nextPhone === undefined &&
      nextImage === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one of name, phone, or image is required",
      });
    }

    const user = await updateUserProfileByEmail(email, {
      ...(nextName !== undefined ? { name: nextName } : {}),
      ...(nextPhone !== undefined ? { phone: nextPhone } : {}),
      ...(nextImage !== undefined ? { image: nextImage } : {}),
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  },
};
