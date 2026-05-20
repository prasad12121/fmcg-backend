import express from "express";
import {
  createInvoice,
  getInvoices,

} from "../controllers/invoice.controller";

const router = express.Router();

router.post("/:id", createInvoice);
router.get("/", getInvoices);

export default router;
