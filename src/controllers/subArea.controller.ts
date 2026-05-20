import { request, response } from "express";

import subAreaService from "../services/subAreas.service";


export const createSubArea = async (req = request, res = response) => {
  try {
    const subArea = await subAreaService.createSubArea(req.body);
    res.status(201).json(subArea);
  } catch (error) {
    res.status(500).json({ message: "Error creating subArea", error });
  }
};


export const getSubAreas = async (req = request, res = response) => {
  try {

    const search = req.query.search?.toString() || "";
    const area_id = req.query.area_id?.toString();

    const filter: any = search
      ? { name: { $regex: search, $options: "i" } }
      : {};

    if (area_id) {
      filter.area_id = area_id;
    }
    const subAreas = await subAreaService.getSubAreas(filter);
    res.status(200).json(subAreas);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching subAreas" });
  }
};

//Get a single subArea by ID
export const getSubAreaById = async (req = request, res = response) => {
  try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const subArea = await subAreaService.getSubArea(id);
    if (!subArea) {
      return res.status(404).json({ message: "SubArea not found" });
    }
    res.status(200).json(subArea);
  } catch (error) {
    res.status(500).json({ message: "Error fetching subArea", error });
  }
};

//Update a subArea by ID
export const updateSubArea = async (req = request, res = response) => {
  try {
     const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const subArea = await subAreaService.updateSubArea(id, req.body);
    if (!subArea) {
      return res.status(404).json({ message: "SubArea not found" });
    }
    res.status(200).json(subArea);
  } catch (error) {
    res.status(500).json({ message: "Error updating subArea", error });
  }
};

//Delete a subArea by ID
export const deleteSubArea = async (req = request, res = response) => {
  try {
     const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const subArea = await subAreaService.deleteSubArea(id);
    if (!subArea) {
      return res.status(404).json({ message: "SubArea not found" });
    }

    res.status(200).json({ message: "SubArea deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting subArea", error });
  }
};

//change subArea status
export const updateSubAreaStatus = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const subArea = await subAreaService.updateSubAreaStatus(id);

    res.status(200).json({
      message: `SubArea status updated to ${subArea.status}`,
      data: subArea
    });

  } catch (error: any) {

    if (error.message === "SubArea not found") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({
      message: "Error updating subArea status",
      error: error.message
    });
  }
};
