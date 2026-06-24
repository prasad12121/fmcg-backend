import express from "express";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/role";
import { createVehicle, getVehicles, getVehicle, updateVehicle, updateVehicleStatus } from "../controllers/vehicle.controller";

const router = express.Router();
router.use(authenticate, authorize("SuperAdmin", "Distributor"));

router.post("/", createVehicle);
router.get("/", getVehicles);
router.get("/:id", getVehicle);
router.put("/:id", updateVehicle);
router.put("/:id/status", updateVehicleStatus);

export default router;
