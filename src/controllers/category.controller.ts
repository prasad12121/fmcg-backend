import { request, response } from "express";
import categoryService from "../services/category.service";

const distId = (req: typeof request): string | null =>
  req.user?.role === "Distributor" && req.user.distributor_id
    ? req.user.distributor_id
    : null;

export const createCategory = async (req = request, res = response) => {
  try {
    const data = { ...req.body };
    const did = distId(req);
    if (did) data.distributor_id = did;
    const category = await categoryService.createCategory(data);
    res.status(201).json(category);
  } catch (error: any) {
    if (error.code === 11000)
      return res.status(409).json({ message: "Category name already exists for this distributor." });
    res.status(500).json({ message: "Error creating category", error: error.message });
  }
};

export const getCategories = async (req = request, res = response) => {
  try {
    const search = req.query.search?.toString() || "";
    const filter: Record<string, any> = search
      ? { name: { $regex: search, $options: "i" } }
      : {};
    const did = distId(req);
    if (did) filter.distributor_id = did;
    const categories = await categoryService.getCategories(filter);
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories", error });
  }
};

export const getCategory = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const category = await categoryService.getCategory(id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    const did = distId(req);
    if (did && String((category as any).distributor_id) !== did)
      return res.status(403).json({ message: "Forbidden" });
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: "Error fetching category", error });
  }
};

export const updateCategory = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const did = distId(req);
    if (did) {
      const existing = await categoryService.getCategory(id);
      if (!existing) return res.status(404).json({ message: "Category not found" });
      if (String((existing as any).distributor_id) !== did)
        return res.status(403).json({ message: "You can only edit your own categories" });
      delete req.body.distributor_id;
    }
    const category = await categoryService.updateCategory(id, req.body);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.status(200).json(category);
  } catch (error: any) {
    if (error.code === 11000)
      return res.status(409).json({ message: "Category name already exists for this distributor." });
    res.status(500).json({ message: "Error updating category", error: error.message });
  }
};

export const deleteCategory = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const did = distId(req);
    if (did) {
      const existing = await categoryService.getCategory(id);
      if (!existing) return res.status(404).json({ message: "Category not found" });
      if (String((existing as any).distributor_id) !== did)
        return res.status(403).json({ message: "You can only delete your own categories" });
    }
    const category = await categoryService.deleteCategory(id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting category", error });
  }
};

export const updateCategoryStatus = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const did = distId(req);
    if (did) {
      const existing = await categoryService.getCategory(id);
      if (!existing) return res.status(404).json({ message: "Category not found" });
      if (String((existing as any).distributor_id) !== did)
        return res.status(403).json({ message: "Forbidden" });
    }
    const category = await categoryService.updateCategoryStatus(id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: "Error updating category status", error });
  }
};
