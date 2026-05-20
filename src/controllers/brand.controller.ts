import { request, response } from "express";

import brandService from "../services/brand.service";


export const createBrand = async (req = request, res = response) => {
  try {
    const brand = await brandService.createBrand(req.body);
    res.status(201).json(brand);
  } catch (error) {
    res.status(500).json({ message: "Error creating brand", error });
  }
};


export const getBrands = async (req = request, res = response) => {
  try {

    const search = req.query.search?.toString() || "";

    const filter = search
      ? { name: { $regex: search, $options: "i" } }
      : {};

    const brands = await brandService.getBrands(filter);

    res.status(200).json(brands);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching brands" });
  }
};

//Get a single brand by ID
export const getBrand = async (req = request, res = response) => {
  try {
     const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const brand = await brandService.getBrand(id);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }
    res.status(200).json(brand);
  } catch (error) {
    res.status(500).json({ message: "Error fetching brand", error });
  }
};

//Update a brand by ID
export const updateBrand = async (req = request, res = response) => {
  try {
     const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const brand = await brandService.updateBrand(id, req.body);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }
    res.status(200).json(brand);
  } catch (error) {
    res.status(500).json({ message: "Error updating brand", error });
  }
};

//Delete a brand by ID
export const deleteBrand = async (req = request, res = response) => {
  try {
     const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const brand = await brandService.deleteBrand(id);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    res.status(200).json({ message: "Brand deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting brand", error });
  }
};

//change brand status
export const updateBrandStatus = async (req = request, res = response) => {
  try {

     const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const brand = await brandService.updateBrandStatus(id);

    res.status(200).json({
      message: `Brand status updated to ${brand.status}`,
      data: brand
    });

  } catch (error: any) {

    if (error.message === "Brand not found") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({
      message: "Error updating brand status",
      error: error.message
    });
  }
};
