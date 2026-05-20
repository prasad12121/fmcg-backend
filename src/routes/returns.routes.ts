import express from "express";

import { createReturn, getReturn, getReturns } from "../controllers/returns.controller";

const router = express.Router();

router.post("/", createReturn);
router.get("/", getReturns);
router.get("/:id", getReturn);

export default router;
