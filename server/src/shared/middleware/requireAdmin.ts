import type { NextFunction, Request, Response } from "express";

export async function requireAdmin(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  const authUser = (res.locals as { authUser?: { role?: string } }).authUser;

  if (!authUser?.role || authUser.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Admin access required",
    });
  }

  return next();
}
