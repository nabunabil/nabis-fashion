import { Router } from "express";
import { requireAuth } from "../../shared/middleware/requireAuth";
import {
  getAddressesHandler,
  createAddressHandler,
  updateAddressHandler,
  setDefaultAddressHandler,
  deleteAddressHandler,
} from "./address.controller";

export const addressRoutes: Router = Router();

addressRoutes.use(requireAuth);

addressRoutes.get("/", getAddressesHandler);
addressRoutes.post("/", createAddressHandler);
addressRoutes.put("/:id", updateAddressHandler);
addressRoutes.patch("/:id", updateAddressHandler);
addressRoutes.patch("/:id/default", setDefaultAddressHandler);
addressRoutes.delete("/:id", deleteAddressHandler);
