import express from "express";
import {
  createCountry,
  getCountries,
  getCountryById,
  updateCountry,
  deleteCountry,
  updateCountryStatus
} from "../controllers/country.controller"; 

const router = express.Router();

router.post("/", createCountry);
router.get("/", getCountries);
router.get("/:id", getCountryById);
router.put("/:id", updateCountry);
router.delete("/:id", deleteCountry);
router.patch("/:id/status", updateCountryStatus);
export default router;
