import express from "express";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/role";
import {
  createDispatch,
  confirmDelivery,
  getDispatchItems,
  getDispatches,
  getDispatch,
  updateDispatch,
  deleteDispatch,
  updateDispatchStatus,
} from "../controllers/dispatch.controller";

const router = express.Router();

router.use(authenticate, authorize("SuperAdmin", "Distributor"));

router.post("/", createDispatch);
router.get("/", getDispatches);
router.get("/:id/items", getDispatchItems);
router.put("/:id/confirm-delivery", confirmDelivery);
router.get("/:id", getDispatch);
router.put("/:id", updateDispatch);
router.delete("/:id", deleteDispatch);
router.put("/:id/status", updateDispatchStatus);

export default router;
