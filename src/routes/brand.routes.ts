import express from "express";
import {
  createBrand,
  getBrands,
  getBrand,
  updateBrand,
  deleteBrand,
  updateBrandStatus
} from "../controllers/brand.controller";

const router = express.Router();

router.post("/", createBrand);
router.get("/", getBrands);
router.get("/:id", getBrand);
router.put("/:id", updateBrand);
router.delete("/:id", deleteBrand);
router.patch("/:id/status", updateBrandStatus);

export default router;
