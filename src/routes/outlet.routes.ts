import express from "express";

import {

  createOutlet,
  getOutlets,
  getOutlet,
  updateOutlet,
  deleteOutlet,
  updateOutletStatus,
} from "../controllers/outlet.controller";

const router = express.Router();

router.post("/", createOutlet);
router.get("/", getOutlets);
router.get("/:id", getOutlet);
router.put("/:id", updateOutlet);
router.delete("/:id", deleteOutlet);
router.patch("/:id/status", updateOutletStatus);

export default router;
