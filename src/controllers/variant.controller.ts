import { request, response } from "express";
import variantService from "../services/variant.service";

export const createVariant = async (req = request, res = response) => {
  try {
    const newVariant = await variantService.createVariant(req.body);
    res.status(201).json(newVariant);
  } catch (error) {
    res.status(500).json({ message: "Error creating variant", error });
  }
};

export const getVariant = async (req = request, res = response) => {
  try {
    const { search } = req.query;

    const filter = search
      ? { name: { $regex: String(search), $options: "i" } }
      : {};
      
    const variants = await variantService.getVariants(filter);
    res.status(200).json(variants);
  } catch (error) {
    res.status(500).json({ message: "Error fetching variants", error });
  }
};

//Get a single variant by ID
export const getVariantById = async (req = request, res = response) => {
  try {
       const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const variant = await variantService.getVariant(id);
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }
    res.status(200).json(variant);
  } catch (error) {
    res.status(500).json({ message: "Error fetching variant", error });
  }
};

//Update a variant by ID
export const updateVariant = async (req = request, res = response) => {
  try {
       const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updatedVariant = await variantService.updateVariant(id, req.body);
    if (!updatedVariant) {
      return res.status(404).json({ message: "Variant not found" });
    }
    res.status(200).json(updatedVariant);
  } catch (error) {
    res.status(500).json({ message: "Error updating variant", error });
  }
};

//Delete a variant by ID
export const deleteVariant = async (req = request, res = response) => {
  try {
       const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const deletedVariant = await variantService.deleteVariant(id);
    if (!deletedVariant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    res.status(200).json({ message: "Variant deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting variant", error });
  }
};

//change variant status
export const updateVariantStatus = async (req = request, res = response) => {
  try {

       const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const variant = await variantService.getVariant(id);
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    const updatedVariant = await variantService.updateVariantStatus(id);
    res
      .status(200)
      .json({ message: `Variant status updated to ${updatedVariant.status}` });
  } catch (error) {
    res.status(500).json({ message: "Error updating variant status", error });
  }
};
