import express from "express";

import {

  createUnitCategory,
  getUnitCategories,
  getUnitCategoryById,
  updateUnitCategory,
  deleteUnitCategory,
  updateUnitCategoryStatus,
} from "../controllers/unitCategory.controller";
const router = express.Router();

router.post("/", createUnitCategory);
router.get("/", getUnitCategories);
router.get("/:id", getUnitCategoryById);
router.put("/:id", updateUnitCategory);
router.delete("/:id", deleteUnitCategory);
router.patch("/:id/status", updateUnitCategoryStatus);

export default router;
