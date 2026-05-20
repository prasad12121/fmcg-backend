import { Request, Response } from "express";
import unitService from "../services/unit.service";


export const createUnit = async (req: Request, res: Response) => {
  try {
    const unit = await unitService.createUnit(req.body);
    res.status(201).json(unit);
  } catch (error) {
    res.status(500).json({ message: "Error creating unit", error });
  }
};

export const getUnits = async (req: Request, res: Response) => {
try {
    const search = req.query.search?.toString() || "";
    const category_id = req.query.category_id?.toString();

    const filter: { name?: { $regex: string; $options: string }; category_id?: string } = search
      ? { name: { $regex: search, $options: "i" } }
      : {};

       if (category_id) {
      filter.category_id = category_id;
    }

    const units = await unitService.getUnits(filter);

    res.status(200).json(units);
  } catch (error) {
    res.status(500).json({ message: "Error fetching units", error });
  }
};

export const getUnitById = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const unit = await unitService.getUnit(id);
    if (!unit) {
      return res.status(404).json({ message: "Unit not found" });
    }
    res.status(200).json(unit);
  } catch (error) {
    res.status(500).json({ message: "Error fetching unit", error });
  }
};

export const updateUnit = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const unit = await unitService.updateUnit(id, req.body);
    if (!unit) {
      return res.status(404).json({ message: "Unit not found" });
    }
    res.status(200).json(unit);
  } catch (error) {
    res.status(500).json({ message: "Error updating unit", error });
  }
};

export const deleteUnit = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const unit = await unitService.deleteUnit(id);

    if (!unit) {
      return res.status(404).json({ message: "Unit not found" });
    }
    res.status(200).json({ message: "Unit deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting unit", error });
  }
};

export const updateUnitStatus = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const unit = await unitService.updateUnitStatus(id);

    if (!unit) {
      return res.status(404).json({ message: "Unit not found" });
    }
    res.status(200).json(unit);
  } catch (error) {
    res.status(500).json({ message: "Error updating unit status", error });
  }
};
