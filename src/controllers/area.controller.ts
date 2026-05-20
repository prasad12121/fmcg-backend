import { request, response } from "express";
import areaService from "../services/area.service";


export const createArea = async (req = request, res = response) => {
  try {
    const area = await areaService.createArea(req.body);
    res.status(201).json(area);
  } catch (error) {
    res.status(500).json({ message: "Error creating area", error });
  }
};


export const getAreas = async (req = request, res = response) => {
  try {

    const search = req.query.search?.toString() || "";
    const city_id = req.query.city_id?.toString();

    const filter: any = search
      ? { name: { $regex: search, $options: "i" } }
      : {};

    if (city_id) {
      filter.city_id = city_id;
    }

    const areas = await areaService.getAreas(filter); 
    res.status(200).json(areas);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching areas" });
  }
};

//Get a single area by ID
export const getAreaById = async (req = request, res = response) => {
  try {
     const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const area = await areaService.getArea(id);
    if (!area) {
      return res.status(404).json({ message: "Area not found" });
    }
    res.status(200).json(area);
  } catch (error) {
    res.status(500).json({ message: "Error fetching area", error });
  }
};

//Update an area by ID
export const updateArea = async (req = request, res = response) => {
  try {
     const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const area = await areaService.updateArea(id, req.body);
    if (!area) {
      return res.status(404).json({ message: "Area not found" });
    }
    res.status(200).json(area);
  } catch (error) {
    res.status(500).json({ message: "Error updating area", error });
  }
};

//Delete an area by ID
export const deleteArea = async (req = request, res = response) => {
  try {
     const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const area = await areaService.deleteArea(id);
    if (!area) {
      return res.status(404).json({ message: "Area not found" });
    }

    res.status(200).json({ message: "Area deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting area", error });
  }
};

//change area status
export const updateAreaStatus = async (req = request, res = response) => {
  try {
     const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const area = await areaService.updateAreaStatus(id);

    res.status(200).json({
      message: `Area status updated to ${area.status}`,
      data: area
    });

  } catch (error: any) {

    if (error.message === "Area not found") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({
      message: "Error updating area status",
      error: error.message
    });
  }
};
