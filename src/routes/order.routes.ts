import express from "express";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/role";
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
  approveOrder,
  getProductsInOrder,
  updateOrderWithOrderItems,
  getItemsByOrderIds,
  getDispatchReadyOrders,
  getOutletOrderDetail,
} from "../controllers/order.controller";

const router = express.Router();

// All authenticated roles can access orders
router.use(authenticate, authorize("SuperAdmin", "Distributor", "outlet"));

// ── Outlet-only: full order detail with dispatch & timeline ─────────────────
router.get("/outlet-detail/:id", getOutletOrderDetail);

router.post("/", createOrder);
router.post("/items-by-ids", getItemsByOrderIds);
router.get("/", getOrders);
router.get("/dispatch-ready", getDispatchReadyOrders);
router.get("/items-by-order-id/:id", getItemsByOrderIds);
router.get("/:id", getOrder);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);
router.patch("/:id/status", updateOrderStatus);
router.patch("/:id/approve", approveOrder);
router.get("/:id/products", getProductsInOrder);
router.put("/:id/update-order-with-order-items", updateOrderWithOrderItems);

export default router;
