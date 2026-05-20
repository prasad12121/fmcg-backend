import express from "express";

import {

  createState,
  getStates,
  getState,
  updateState,
  deleteState,
  updateStateStatus,
} from "../controllers/state.controller";

const router = express.Router();

router.post("/", createState);
router.get("/", getStates);
router.get("/:id", getState);
router.put("/:id", updateState);
router.delete("/:id", deleteState);
router.patch("/:id/status", updateStateStatus);

export default router;
