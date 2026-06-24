import express from "express";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/role";
import { createReturn, getReturn, getReturns } from "../controllers/returns.controller";

const router = express.Router();

router.use(authenticate, authorize("SuperAdmin", "Distributor"));

router.post("/", createReturn);
router.get("/", getReturns);
router.get("/:id", getReturn);

export default router;
