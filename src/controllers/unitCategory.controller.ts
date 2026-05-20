import { Request, Response } from "express";
import unitCategoryService from "../services/unitCategory.service";

export const createUnitCategory = async (req: Request, res: Response) => {
  try {
    const unitCategory = await unitCategoryService.createUnitCategory(req.body);
    res.status(201).json(unitCategory);
  } catch (error) {
    res.status(500).json({ message: "Error creating unit category", error });
  }
};

export const getUnitCategories = async (req: Request, res: Response) => {
  try {
    const unitCategories = await unitCategoryService.getUnitCategories();
    res.status(200).json(unitCategories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching unit categories", error });
  }
};

export const getUnitCategoryById = async (req: Request, res: Response) => {
  try {
       const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const unitCategory = await unitCategoryService.getUnitCategory(id);
    if (!unitCategory) {
      return res.status(404).json({ message: "Unit category not found" });
    }
    res.status(200).json(unitCategory);
  } catch (error) {
    res.status(500).json({ message: "Error fetching unit category", error });
  }
};

export const updateUnitCategory = async (req: Request, res: Response) => {
  try {
       const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;  
    const unitCategory = await unitCategoryService.updateUnitCategory(id, req.body);
    if (!unitCategory) {
      return res.status(404).json({ message: "Unit category not found" });
    }
    res.status(200).json(unitCategory);
  } catch (error) {
    res.status(500).json({ message: "Error updating unit category", error });
  }
};

export const deleteUnitCategory = async (req: Request, res: Response) => {
  try {
       const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const unitCategory = await unitCategoryService.deleteUnitCategory(id);

    if (!unitCategory) {
      return res.status(404).json({ message: "Unit category not found" });
    }
    res.status(200).json({ message: "Unit category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting unit category", error });
  }
};

export const updateUnitCategoryStatus = async (req: Request, res: Response) => {
  try {
       const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const unitCategory = await unitCategoryService.updateUnitCategoryStatus(id);

    if (!unitCategory) {
      return res.status(404).json({ message: "Unit category not found" });
    }
    unitCategory.status = unitCategory.status === "active" ? "inactive" : "active";
    await unitCategory.save();
    res.status(200).json(unitCategory);
  } catch (error) {
    res.status(500).json({ message: "Error updating unit category status", error });
  }
};
