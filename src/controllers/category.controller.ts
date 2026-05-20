import { request, response} from "express";

import categoryService from "../services/category.service";
  
export const createCategory = async (req= request, res = response) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: "Error creating category", error });
  }
};

export const getCategories = async (req = request, res = response) => {
  try {

    const search = req.query.search?.toString() || "";

    const filter = search
      ? { name: { $regex: search, $options: "i" } }
      : {};

    const categories = await categoryService.getCategories(filter);
    res.status(200).json(categories);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching categories", error });
  }
};

export const getCategory = async (req= request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const category = await categoryService.getCategory(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: "Error fetching category", error });
  }
};

export const updateCategory = async (req= request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const category = await categoryService.updateCategory(id, req.body);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: "Error updating category", error });
  }
};

export const deleteCategory = async (req= request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const category = await categoryService.deleteCategory(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting category", error });
  }
};

export const updateCategoryStatus = async (req= request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const category = await categoryService.updateCategoryStatus(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: "Error updating category status", error });
  }
};
