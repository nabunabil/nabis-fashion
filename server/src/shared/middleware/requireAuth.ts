import type { NextFunction, Request, Response } from "express";
import { getAuth } from "../../lib/auth";
import { getUserProfileByEmail } from "../../modules/user/user.service";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authInstance = await getAuth();
    const session = await authInstance.api.getSession({
      headers: req.headers as any,
    });

    const email = session?.user?.email;

    if (!email) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await getUserProfileByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    res.locals.authUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    return next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
}
