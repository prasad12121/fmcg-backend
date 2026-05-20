//create a routes for driver model

import express from "express";
import {
    createDriver,
    getDrivers,
    getDriver,
    updateDriverStatus,
    deleteDriver,
} from "../controllers/driver.controller";

const router = express.Router();

router.post("/", createDriver);
router.get("/", getDrivers);
router.get("/:id", getDriver);
router.put("/:id/status", updateDriverStatus);
router.delete("/:id", deleteDriver);

export default router;
