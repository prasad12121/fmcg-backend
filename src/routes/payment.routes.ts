import express from "express";
import {
  createPayment,
  getPaymentById,
  getPayments,
  updatePayment,
} from "../controllers/payment.controller";



const router = express.Router();

router.post("/", createPayment);
router.get("/", getPayments);
router.get("/:id", getPaymentById);
router.put("/:id", updatePayment);

export default router;
