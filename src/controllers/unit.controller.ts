import { request, response } from "express";
import unitService from "../services/unit.service";

const distId = (req: typeof request): string | null =>
  req.user?.role === "Distributor" && req.user.distributor_id
    ? req.user.distributor_id
    : null;

export const createUnit = async (req = request, res = response) => {
  try {
    const data = { ...req.body };
    const did = distId(req);
    if (did) data.distributor_id = did;
    const unit = await unitService.createUnit(data);
    res.status(201).json(unit);
  } catch (error: any) {
    if (error.code === 11000)
      return res.status(409).json({ message: "Unit name or symbol already exists for this distributor." });
    res.status(500).json({ message: "Error creating unit", error: error.message });
  }
};

export const getUnits = async (req = request, res = response) => {
  try {
    const search = req.query.search?.toString() || "";
    const filter: Record<string, any> = search
      ? { name: { $regex: search, $options: "i" } }
      : {};
    const did = distId(req);
    if (did) filter.distributor_id = did;
    const units = await unitService.getUnits(filter);
    res.status(200).json(units);
  } catch (error) {
    res.status(500).json({ message: "Error fetching units", error });
  }
};

export const getUnitById = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const unit = await unitService.getUnit(id);
    if (!unit) return res.status(404).json({ message: "Unit not found" });
    const did = distId(req);
    if (did && String((unit as any).distributor_id) !== did)
      return res.status(403).json({ message: "Forbidden" });
    res.status(200).json(unit);
  } catch (error) {
    res.status(500).json({ message: "Error fetching unit", error });
  }
};

export const updateUnit = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const did = distId(req);
    if (did) {
      const existing = await unitService.getUnit(id);
      if (!existing) return res.status(404).json({ message: "Unit not found" });
      if (String((existing as any).distributor_id) !== did)
        return res.status(403).json({ message: "You can only edit your own units" });
      delete req.body.distributor_id;
    }
    const unit = await unitService.updateUnit(id, req.body);
    if (!unit) return res.status(404).json({ message: "Unit not found" });
    res.status(200).json(unit);
  } catch (error: any) {
    if (error.code === 11000)
      return res.status(409).json({ message: "Unit name or symbol already exists for this distributor." });
    res.status(500).json({ message: "Error updating unit", error: error.message });
  }
};

export const deleteUnit = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const did = distId(req);
    if (did) {
      const existing = await unitService.getUnit(id);
      if (!existing) return res.status(404).json({ message: "Unit not found" });
      if (String((existing as any).distributor_id) !== did)
        return res.status(403).json({ message: "You can only delete your own units" });
    }
    const unit = await unitService.deleteUnit(id);
    if (!unit) return res.status(404).json({ message: "Unit not found" });
    res.status(200).json({ message: "Unit deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting unit", error });
  }
};

export const updateUnitStatus = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const did = distId(req);
    if (did) {
      const existing = await unitService.getUnit(id);
      if (!existing) return res.status(404).json({ message: "Unit not found" });
      if (String((existing as any).distributor_id) !== did)
        return res.status(403).json({ message: "Forbidden" });
    }
    const unit = await unitService.updateUnitStatus(id);
    if (!unit) return res.status(404).json({ message: "Unit not found" });
    res.status(200).json(unit);
  } catch (error) {
    res.status(500).json({ message: "Error updating unit status", error });
  }
};
