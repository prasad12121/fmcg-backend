import express from "express";

import { createProductPrice, getProductPrice, updateProductPrice, deleteProductPrice } from "../controllers/productPrice.controller";

const router = express.Router();

router.post("/", createProductPrice);
router.get("/", getProductPrice);
router.put("/:id", updateProductPrice);
router.delete("/:id", deleteProductPrice);

export default router;
