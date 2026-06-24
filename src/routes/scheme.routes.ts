import express from "express";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/role";
import { createScheme, getSchemes, getSchemeById, updateScheme, deleteScheme, updateSchemeStatus } from "../controllers/scheme.controller";

const router = express.Router();
router.use(authenticate, authorize("SuperAdmin", "Distributor"));

router.post("/", createScheme);
router.get("/", getSchemes);
router.get("/:id", getSchemeById);
router.put("/:id", updateScheme);
router.delete("/:id", deleteScheme);
router.patch("/:id/status", updateSchemeStatus);

export default router;
