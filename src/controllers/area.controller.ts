import { request, response } from "express";
import areaService from "../services/area.service";

const distId = (req: typeof request): string | null =>
  req.user?.role === "Distributor" && req.user.distributor_id
    ? req.user.distributor_id
    : null;

export const createArea = async (req = request, res = response) => {
  try {
    const data = { ...req.body };
    const did = distId(req);
    if (did) data.distributor_id = did;
    const area = await areaService.createArea(data);
    res.status(201).json(area);
  } catch (error: any) {
    if (error.code === 11000)
      return res.status(409).json({ message: "Area name already exists in this city for your distributor." });
    res.status(500).json({ message: "Error creating area", error: error.message });
  }
};

export const getAreas = async (req = request, res = response) => {
  try {
    const search = req.query.search?.toString() || "";
    const city_id = req.query.city_id?.toString();
    const filter: Record<string, any> = search
      ? { name: { $regex: search, $options: "i" } }
      : {};
    if (city_id) filter.city_id = city_id;
    const did = distId(req);
    if (did) filter.distributor_id = did;
    else if (req.query.distributor_id) filter.distributor_id = req.query.distributor_id;
    const areas = await areaService.getAreas(filter);
    res.status(200).json(areas);
  } catch (error) {
    res.status(500).json({ message: "Error fetching areas" });
  }
};

export const getAreaById = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const area = await areaService.getArea(id);
    if (!area) return res.status(404).json({ message: "Area not found" });
    const did = distId(req);
    if (did && String((area as any).distributor_id) !== did)
      return res.status(403).json({ message: "Forbidden" });
    res.status(200).json(area);
  } catch (error) {
    res.status(500).json({ message: "Error fetching area", error });
  }
};

export const updateArea = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const did = distId(req);
    if (did) {
      const existing = await areaService.getArea(id);
      if (!existing) return res.status(404).json({ message: "Area not found" });
      if (String((existing as any).distributor_id) !== did)
        return res.status(403).json({ message: "You can only edit your own areas" });
      delete req.body.distributor_id;
    }
    const area = await areaService.updateArea(id, req.body);
    if (!area) return res.status(404).json({ message: "Area not found" });
    res.status(200).json(area);
  } catch (error: any) {
    if (error.code === 11000)
      return res.status(409).json({ message: "Area name already exists in this city for your distributor." });
    res.status(500).json({ message: "Error updating area", error: error.message });
  }
};

export const deleteArea = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const did = distId(req);
    if (did) {
      const existing = await areaService.getArea(id);
      if (!existing) return res.status(404).json({ message: "Area not found" });
      if (String((existing as any).distributor_id) !== did)
        return res.status(403).json({ message: "You can only delete your own areas" });
    }
    const area = await areaService.deleteArea(id);
    if (!area) return res.status(404).json({ message: "Area not found" });
    res.status(200).json({ message: "Area deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting area", error });
  }
};

export const updateAreaStatus = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const did = distId(req);
    if (did) {
      const existing = await areaService.getArea(id);
      if (!existing) return res.status(404).json({ message: "Area not found" });
      if (String((existing as any).distributor_id) !== did)
        return res.status(403).json({ message: "Forbidden" });
    }
    const area = await areaService.updateAreaStatus(id);
    res.status(200).json({ message: `Area status updated to ${area.status}`, data: area });
  } catch (error: any) {
    if (error.message === "Area not found")
      return res.status(404).json({ message: error.message });
    res.status(500).json({ message: "Error updating area status", error: error.message });
  }
};
