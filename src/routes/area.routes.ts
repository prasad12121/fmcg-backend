import express from "express";

import {
  createArea,
  getAreas,
  getAreaById,
  updateArea,
  deleteArea,
  updateAreaStatus,
} from "../controllers/area.controller";

const router = express.Router();
    
router.post("/", createArea);
router.get("/", getAreas);
router.get("/:id", getAreaById);
router.put("/:id", updateArea);
router.delete("/:id", deleteArea);
router.patch("/:id/status", updateAreaStatus);

export default router;
