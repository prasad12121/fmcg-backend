import { request, response } from "express";
import stockService from "../services/stock.service";

const distId = (req: typeof request): string | null =>
  req.user?.role === "Distributor" && req.user.distributor_id
    ? req.user.distributor_id
    : null;

export const addStock = async (req = request, res = response) => {
  try {
    const data = { ...req.body };
    const did = distId(req);
    if (did) data.distributor_id = did; // auto-stamp; Distributor cannot override
    const stock = await stockService.addStock(data);
    res.status(201).json(stock);
  } catch (error) {
    console.error("Error adding stock:", error);
    res.status(500).json({ message: "Error creating stock", error });
  }
};

export const getStocks = async (req = request, res = response) => {
  try {
    // If Distributor, always force their own ID; ignore query param
    const did = distId(req);
    const distributor_id = did ?? (req.query.distributor_id?.toString() || "");
    const variant_id = req.query.variant_id?.toString() || "";
    const stocks = await stockService.getStocks(distributor_id, variant_id);
    res.status(200).json(stocks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching stocks" });
  }
};

export const getStock = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const stock = await stockService.getStock({ _id: id });
    if (!stock) return res.status(404).json({ message: "Stock not found" });
    const did = distId(req);
    if (did && String((stock as any).distributor_id) !== did)
      return res.status(403).json({ message: "Forbidden" });
    res.status(200).json(stock);
  } catch (error) {
    res.status(500).json({ message: "Error fetching stock", error });
  }
};

export const getStockLedger = async (req = request, res = response) => {
  try {
    const filter: Record<string, any> = {};
    if (typeof req.query.variant_id === "string" && req.query.variant_id)
      filter.variant_id = req.query.variant_id;

    // Distributor: force their own id; SuperAdmin: accept optional query param
    const did = distId(req);
    if (did) {
      filter.distributor_id = did;
    } else if (typeof req.query.distributor_id === "string" && req.query.distributor_id) {
      filter.distributor_id = req.query.distributor_id;
    }

    const ledger = await stockService.getStockLedgerEntries(filter);
    res.status(200).json(ledger);
  } catch (error) {
    res.status(500).json({ message: "Error fetching stock ledger", error });
  }
};

export const updateStock = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const did = distId(req);
    if (did) {
      const existing = await stockService.getStock({ _id: id });
      if (!existing) return res.status(404).json({ message: "Stock not found" });
      if (String((existing as any).distributor_id) !== did)
        return res.status(403).json({ message: "You can only edit your own stock records" });
      delete req.body.distributor_id;
    }
    const stock = await stockService.updateStock(id, req.body);
    if (!stock) return res.status(404).json({ message: "Stock not found" });
    res.status(200).json(stock);
  } catch (error) {
    res.status(500).json({ message: "Error updating stock", error });
  }
};
