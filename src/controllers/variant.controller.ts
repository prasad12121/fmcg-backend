import { request, response } from "express";
import variantService from "../services/variant.service";

const distId = (req: typeof request): string | null =>
  req.user?.role === "Distributor" && req.user.distributor_id
    ? req.user.distributor_id
    : null;

export const createVariant = async (req = request, res = response) => {
  try {
    const data = { ...req.body };
    const did = distId(req);
    if (did) data.distributor_id = did;
    const newVariant = await variantService.createVariant(data);
    res.status(201).json(newVariant);
  } catch (error: any) {
    if (error.code === 11000)
      return res.status(409).json({ message: "SKU code already exists for this distributor." });
    res.status(500).json({ message: "Error creating variant", error: error.message });
  }
};

export const getVariant = async (req = request, res = response) => {
  try {
    const search = req.query.search?.toString() || "";
    const filter: Record<string, any> = search
      ? { name: { $regex: search, $options: "i" } }
      : {};
    const did = distId(req);
    if (did) filter.distributor_id = did;
    else if (req.query.distributor_id) filter.distributor_id = req.query.distributor_id;
    const variants = await variantService.getVariants(filter);
    res.status(200).json(variants);
  } catch (error) {
    res.status(500).json({ message: "Error fetching variants", error });
  }
};

export const getVariantById = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const variant = await variantService.getVariant(id);
    if (!variant) return res.status(404).json({ message: "Variant not found" });
    const did = distId(req);
    if (did && String((variant as any).distributor_id) !== did)
      return res.status(403).json({ message: "Forbidden" });
    res.status(200).json(variant);
  } catch (error) {
    res.status(500).json({ message: "Error fetching variant", error });
  }
};

export const updateVariant = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const did = distId(req);
    if (did) {
      const existing = await variantService.getVariant(id);
      if (!existing) return res.status(404).json({ message: "Variant not found" });
      if (String((existing as any).distributor_id) !== did)
        return res.status(403).json({ message: "You can only edit your own variants" });
      delete req.body.distributor_id;
    }
    const updatedVariant = await variantService.updateVariant(id, req.body);
    if (!updatedVariant) return res.status(404).json({ message: "Variant not found" });
    res.status(200).json(updatedVariant);
  } catch (error: any) {
    if (error.code === 11000)
      return res.status(409).json({ message: "SKU code already exists for this distributor." });
    res.status(500).json({ message: "Error updating variant", error: error.message });
  }
};

export const deleteVariant = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const did = distId(req);
    if (did) {
      const existing = await variantService.getVariant(id);
      if (!existing) return res.status(404).json({ message: "Variant not found" });
      if (String((existing as any).distributor_id) !== did)
        return res.status(403).json({ message: "You can only delete your own variants" });
    }
    const deletedVariant = await variantService.deleteVariant(id);
    if (!deletedVariant) return res.status(404).json({ message: "Variant not found" });
    res.status(200).json({ message: "Variant deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting variant", error });
  }
};

export const updateVariantStatus = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const did = distId(req);
    if (did) {
      const existing = await variantService.getVariant(id);
      if (!existing) return res.status(404).json({ message: "Variant not found" });
      if (String((existing as any).distributor_id) !== did)
        return res.status(403).json({ message: "Forbidden" });
    }
    const updatedVariant = await variantService.updateVariantStatus(id);
    res.status(200).json({ message: `Variant status updated to ${updatedVariant.status}` });
  } catch (error) {
    res.status(500).json({ message: "Error updating variant status", error });
  }
};
