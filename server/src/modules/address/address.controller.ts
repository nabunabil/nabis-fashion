import { Request, Response, NextFunction } from "express";
import {
  listUserAddresses,
  createUserAddress,
  updateUserAddress,
  setDefaultUserAddress,
  deleteUserAddress,
} from "./address.service";
import { AppError } from "../../shared/errors/appError";

function getAuthEmail(res: Response): string {
  const email = res.locals.authUser?.email;
  if (!email) throw new AppError(401, "Unauthorized", "UNAUTHORIZED");
  return email;
}

export async function getAddressesHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const email = getAuthEmail(res);
    const addresses = await listUserAddresses(email);
    res.json({ success: true, data: addresses });
  } catch (error) {
    next(error);
  }
}

export async function createAddressHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const email = getAuthEmail(res);
    const { label, name, phone, street, city, state, zip, country, isDefault } = req.body;
    if (!name || !phone || !street || !city) {
      throw new AppError(400, "Missing required address fields", "VALIDATION_ERROR");
    }

    const created = await createUserAddress(email, {
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
  } catch (error) {
    next(error);
  }
}

export async function updateAddressHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const email = getAuthEmail(res);
    const id = Number(req.params.id);
    if (isNaN(id)) throw new AppError(400, "Invalid address ID", "VALIDATION_ERROR");

    const updated = await updateUserAddress(email, id, req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

export async function setDefaultAddressHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const email = getAuthEmail(res);
    const id = Number(req.params.id);
    if (isNaN(id)) throw new AppError(400, "Invalid address ID", "VALIDATION_ERROR");

    const updated = await setDefaultUserAddress(email, id);
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

export async function deleteAddressHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const email = getAuthEmail(res);
    const id = Number(req.params.id);
    if (isNaN(id)) throw new AppError(400, "Invalid address ID", "VALIDATION_ERROR");

    await deleteUserAddress(email, id);
    res.json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    next(error);
  }
}
