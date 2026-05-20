import express from "express";

import {

  createSubArea,
  getSubAreas,
  getSubAreaById,
  updateSubArea,
  deleteSubArea,
  updateSubAreaStatus,
} from "../controllers/subArea.controller";

const router = express.Router();

router.post("/", createSubArea);
router.get("/", getSubAreas);
router.get("/:id", getSubAreaById);
router.put("/:id", updateSubArea);
router.delete("/:id", deleteSubArea);
router.patch("/:id/status", updateSubAreaStatus);

export default router;
