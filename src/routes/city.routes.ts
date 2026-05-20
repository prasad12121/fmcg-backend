import express from "express";

import {

  createCity,
  getCities,
  getCityById,
  updateCity,
  deleteCity,
  updateCityStatus,
} from "../controllers/city.controller";

const router = express.Router();

router.post("/", createCity);
router.get("/", getCities);
router.get("/:id", getCityById);
router.put("/:id", updateCity);
router.delete("/:id", deleteCity);
router.patch("/:id/status", updateCityStatus);

export default router;
