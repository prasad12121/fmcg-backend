import express from "express";

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
} from "../controllers/order.controller";


const router = express.Router();
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
