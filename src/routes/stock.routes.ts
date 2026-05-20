import express from "express";

import {

  addStock,
  getStocks,
  getStockLedger,
  getStock,
  updateStock,
} from "../controllers/stock.controller";

const router = express.Router();

router.post("/", addStock);
router.get("/", getStock);
router.get("/ledger", getStockLedger);
router.get("/:id", getStock);
router.put("/:id", updateStock);

export default router;
