import { request, response } from "express";
import stockService from "../services/stock.service";

export const addStock = async (req = request, res = response) => {
  try {
    const stock = await stockService.addStock(req.body);
    console.log("Stock added:", stock);
    res.status(201).json(stock);
  } catch (error) {
    //console.error("Error adding stock:", error);
    //added console activity log for errors to help with debugging
    console.error("Error adding stock:", error);
    res.status(500).json({ message: "Error creating stock", error });
  }
};

export const getStocks = async (req = request, res = response) => {
  try {
    const search = req.query.search?.toString() || "";

    const filter = search ? { name: { $regex: search, $options: "i" } } : {};

    const stocks = await stockService.getStocks(
      req.query.distributor_id?.toString() || "",
      req.query.variant_id?.toString() || "",
    );

    res.status(200).json(stocks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching stocks" });
  }
};

//Get a  all  stock by ID
export const getStock = async (req = request, res = response) => {
  try {
    const search = req.query.search?.toString() || "";
    const filter = search ? { name: { $regex: search, $options: "i" } } : {};
    const stock = await stockService.getStock(filter);
    res.status(200).json(stock);

  } catch (error) {
    res.status(500).json({ message: "Error fetching stock", error });
  }
};

export const getStockLedger = async (req = request, res = response) => {
  try {
    const filter: Record<string, any> = {};

    if (typeof req.query.variant_id === "string" && req.query.variant_id) {
      filter.variant_id = req.query.variant_id;
    }

    if (typeof req.query.distributor_id === "string" && req.query.distributor_id) {
      filter.distributor_id = req.query.distributor_id;
    }

    const ledger = await stockService.getStockLedgerEntries(filter);
    res.status(200).json(ledger);
  } catch (error) {
    res.status(500).json({ message: "Error fetching stock ledger", error });
  }
};

//Update a stock by ID
export const updateStock = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const stock = await stockService.updateStock(id, req.body);
    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }
    res.status(200).json(stock);
  } catch (error) {
    res.status(500).json({ message: "Error updating stock", error });
  }
};
