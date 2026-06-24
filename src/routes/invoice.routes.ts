import express from "express";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/role";
import { createInvoice, getInvoices } from "../controllers/invoice.controller";

const router = express.Router();

router.use(authenticate, authorize("SuperAdmin", "Distributor"));

router.post("/:id", createInvoice);
router.get("/", getInvoices);

export default router;
