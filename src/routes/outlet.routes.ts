import express from "express";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/role";
import {
  createOutlet,
  getOutlets,
  getOutlet,
  updateOutlet,
  deleteOutlet,
  updateOutletStatus,
} from "../controllers/outlet.controller";

const router = express.Router();

// SuperAdmin and Distributor can manage outlets
router.use(authenticate, authorize("SuperAdmin", "Distributor"));

router.post("/", createOutlet);
router.get("/", getOutlets);
router.get("/:id", getOutlet);
router.put("/:id", updateOutlet);
router.delete("/:id", deleteOutlet);
router.patch("/:id/status", updateOutletStatus);

export default router;
