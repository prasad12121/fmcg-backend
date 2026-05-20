import express from "express";

import {

  createUnit,
  getUnits,
  getUnitById,
  updateUnit,
  deleteUnit,
  updateUnitStatus,
} from "../controllers/unit.controller";

const router = express.Router();

router.post("/", createUnit);
router.get("/", getUnits);
router.get("/:id", getUnitById);
router.put("/:id", updateUnit);
router.delete("/:id", deleteUnit);
router.patch("/:id/status", updateUnitStatus);

export default router;
