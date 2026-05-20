import express from "express";

import {

  createDistributor,
  getDistributors,
  getDistributor,
  updateDistributor,
  deleteDistributor,
  updateDistributorStatus,
} from "../controllers/distributor.controller";

const router = express.Router();

router.post("/", createDistributor);
router.get("/", getDistributors);
router.get("/:id", getDistributor);
router.put("/:id", updateDistributor);
router.delete("/:id", deleteDistributor);
router.patch("/:id/status", updateDistributorStatus);

export default router;
