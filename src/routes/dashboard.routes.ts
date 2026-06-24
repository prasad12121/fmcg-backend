import express from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/role";
import { getDashboardStats } from "../controllers/dashboard.controller";

const router = express.Router();

// Only SuperAdmin and Distributor can access the dashboard stats
router.get(
  "/stats",
  authenticate,
  authorize("SuperAdmin", "Distributor"),
  asyncHandler(getDashboardStats)
);

export default router;
