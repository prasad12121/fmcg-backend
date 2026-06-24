import express from "express";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/role";
import { createProduct, getProducts, getProductById, updateProduct, deleteProduct, updateProductStatus } from "../controllers/product.controller";

const router = express.Router();
router.use(authenticate, authorize("SuperAdmin", "Distributor"));

router.post("/", createProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.patch("/:id/status", updateProductStatus);

export default router;
