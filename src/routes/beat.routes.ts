import express from "express";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/role";
import { createBeat, getBeats, getBeatById, updateBeat, deleteBeat, updateBeatStatus } from "../controllers/beat.controller";

const router = express.Router();
router.use(authenticate, authorize("SuperAdmin", "Distributor"));

router.post("/", createBeat);
router.get("/", getBeats);
router.get("/:id", getBeatById);
router.put("/:id", updateBeat);
router.delete("/:id", deleteBeat);
router.patch("/:id/status", updateBeatStatus);

export default router;
