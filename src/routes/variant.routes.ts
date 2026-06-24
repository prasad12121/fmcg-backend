import express from "express";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/role";
import { createVariant, getVariant, getVariantById, updateVariant, deleteVariant, updateVariantStatus } from "../controllers/variant.controller";

const router = express.Router();
router.use(authenticate, authorize("SuperAdmin", "Distributor"));

router.post("/", createVariant);
router.get("/", getVariant);
router.get("/:id", getVariantById);
router.put("/:id", updateVariant);
router.delete("/:id", deleteVariant);
router.patch("/:id/status", updateVariantStatus);

export default router;
