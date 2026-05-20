import { request, response } from "express";

import returnsService from "../services/returns.service";

export const createReturn = async (req = request, res = response) => {
  try {
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({
        message: "Invalid request body",
        error: "Expected JSON body. Send { dispatch_id, reason, note, items: [...] }",
      });
    }

    const created = await returnsService.createReturn(req.body);
    res.status(201).json(created);
  } catch (error) {
    console.error("Error creating return:", error);
    res.status(500).json({
      message: "Error creating return",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const getReturns = async (req = request, res = response) => {
  try {
    const filter: Record<string, any> = {};
    if (typeof req.query.dispatch_id === "string" && req.query.dispatch_id) {
      filter.dispatch_id = req.query.dispatch_id;
    }

    const returns = await returnsService.getReturns(filter);
    res.status(200).json(returns);
  } catch (error) {
    res.status(500).json({ message: "Error fetching returns", error });
  }
};

export const getReturn = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const returnEntry = await returnsService.getReturn(id);
    res.status(200).json(returnEntry);
  } catch (error) {
    res.status(500).json({ message: "Error fetching return", error });
  }
};
