import express from "express";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/role";
import { getMyInfo, getCatalog } from "../controllers/outlet-portal.controller";

const router = express.Router();

// Outlet-only endpoints
router.use(authenticate, authorize("outlet"));

router.get("/my-info", getMyInfo);
router.get("/catalog", getCatalog);

export default router;
