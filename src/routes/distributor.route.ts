import express from "express";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/role";
import {
  createDistributor,
  getDistributors,
  getDistributor,
  updateDistributor,
  deleteDistributor,
  updateDistributorStatus,
} from "../controllers/distributor.controller";

const router = express.Router();

// All distributor management is SuperAdmin only
router.use(authenticate, authorize("SuperAdmin"));

router.post("/", createDistributor);
router.get("/", getDistributors);
router.get("/:id", getDistributor);
router.put("/:id", updateDistributor);
router.delete("/:id", deleteDistributor);
router.patch("/:id/status", updateDistributorStatus);

export default router;
