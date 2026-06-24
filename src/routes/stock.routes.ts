import express from "express";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/role";
import { addStock, getStocks, getStock, getStockLedger, updateStock } from "../controllers/stock.controller";

const router = express.Router();
router.use(authenticate, authorize("SuperAdmin", "Distributor"));

router.post("/", addStock);
router.get("/", getStocks);
router.get("/ledger", getStockLedger);
router.get("/:id", getStock);
router.put("/:id", updateStock);

export default router;
