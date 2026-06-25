import { request, response } from "express";
import brandService from "../services/brand.service";

/** Returns distributor_id string from JWT, or null for SuperAdmin */
const distId = (req: typeof request): string | null =>
  req.user?.role === "Distributor" && req.user.distributor_id
    ? req.user.distributor_id
    : null;

export const createBrand = async (req = request, res = response) => {
  try {
    const data = { ...req.body };
    const did = distId(req);
    if (did) data.distributor_id = did;
    const brand = await brandService.createBrand(data);
    res.status(201).json(brand);
  } catch (error: any) {
    if (error.code === 11000)
      return res.status(409).json({ message: "Brand name already exists for this distributor." });
    res.status(500).json({ message: "Error creating brand", error: error.message });
  }
};

export const getBrands = async (req = request, res = response) => {
  try {
    const search = req.query.search?.toString() || "";
    const filter: Record<string, any> = search
      ? { name: { $regex: search, $options: "i" } }
      : {};
    const did = distId(req);
    if (did) filter.distributor_id = did;
    else if (req.query.distributor_id) filter.distributor_id = req.query.distributor_id;
    const brands = await brandService.getBrands(filter);
    res.status(200).json(brands);
  } catch (error) {
    res.status(500).json({ message: "Error fetching brands" });
  }
};

export const getBrand = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const brand = await brandService.getBrand(id);
    if (!brand) return res.status(404).json({ message: "Brand not found" });
    const did = distId(req);
    if (did && String((brand as any).distributor_id) !== did)
      return res.status(403).json({ message: "Forbidden" });
    res.status(200).json(brand);
  } catch (error) {
    res.status(500).json({ message: "Error fetching brand", error });
  }
};

export const updateBrand = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const did = distId(req);
    if (did) {
      const existing = await brandService.getBrand(id);
      if (!existing) return res.status(404).json({ message: "Brand not found" });
      if (String((existing as any).distributor_id) !== did)
        return res.status(403).json({ message: "You can only edit your own brands" });
      delete req.body.distributor_id;
    }
    const brand = await brandService.updateBrand(id, req.body);
    if (!brand) return res.status(404).json({ message: "Brand not found" });
    res.status(200).json(brand);
  } catch (error: any) {
    if (error.code === 11000)
      return res.status(409).json({ message: "Brand name already exists for this distributor." });
    res.status(500).json({ message: "Error updating brand", error: error.message });
  }
};

export const deleteBrand = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const did = distId(req);
    if (did) {
      const existing = await brandService.getBrand(id);
      if (!existing) return res.status(404).json({ message: "Brand not found" });
      if (String((existing as any).distributor_id) !== did)
        return res.status(403).json({ message: "You can only delete your own brands" });
    }
    const brand = await brandService.deleteBrand(id);
    if (!brand) return res.status(404).json({ message: "Brand not found" });
    res.status(200).json({ message: "Brand deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting brand", error });
  }
};

export const updateBrandStatus = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const did = distId(req);
    if (did) {
      const existing = await brandService.getBrand(id);
      if (!existing) return res.status(404).json({ message: "Brand not found" });
      if (String((existing as any).distributor_id) !== did)
        return res.status(403).json({ message: "Forbidden" });
    }
    const brand = await brandService.updateBrandStatus(id);
    res.status(200).json({ message: `Brand status updated to ${brand.status}`, data: brand });
  } catch (error: any) {
    if (error.message === "Brand not found")
      return res.status(404).json({ message: error.message });
    res.status(500).json({ message: "Error updating brand status", error: error.message });
  }
};
