//create a routes for dispatch model

import express from "express";
import {
    createDispatch,
    confirmDelivery,
    getDispatchItems,
    getDispatches,
    getDispatch,
    updateDispatch,
    deleteDispatch,
    updateDispatchStatus,
} from "../controllers/dispatch.controller";

const router = express.Router();

router.post("/", createDispatch);
router.get("/", getDispatches);
router.get("/:id/items", getDispatchItems);
router.put("/:id/confirm-delivery", confirmDelivery);
router.get("/:id", getDispatch);
router.put("/:id", updateDispatch);
router.delete("/:id", deleteDispatch);
router.put("/:id/status", updateDispatchStatus);

export default router;
