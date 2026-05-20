import express from "express";

import {
    createVehicle,
    getVehicles,
    getVehicle,
    updateVehicleStatus,
    updateVehicle,
} from "../controllers/vehicle.controller";

const router = express.Router();

router.post("/", createVehicle);
router.get("/", getVehicles);
router.get("/:id", getVehicle);
router.put("/:id", updateVehicle);
router.put("/:id/status", updateVehicleStatus);

export default router;


