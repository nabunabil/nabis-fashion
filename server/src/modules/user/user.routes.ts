import { Router } from "express";
import { requireAdmin } from "../../shared/middleware/requireAdmin";
import { requireAuth } from "../../shared/middleware/requireAuth";
import { userController } from "./user.controller";

const router: Router = Router();

// Admin routes
router.get(
  "/admin/users",
  requireAuth,
  requireAdmin,
  userController.getAllUsers,
);
router.get(
  "/admin/users/:id",
  requireAuth,
  requireAdmin,
  userController.getUserById,
);
router.put(
  "/admin/users/:id/role",
  requireAuth,
  requireAdmin,
  userController.updateUserRole,
);
router.delete(
  "/admin/users/:id",
  requireAuth,
  requireAdmin,
  userController.deleteUser,
);

// User routes
router.get("/me", requireAuth, userController.getMyProfile);
router.put("/me", requireAuth, userController.updateMyProfile);

export default router;
