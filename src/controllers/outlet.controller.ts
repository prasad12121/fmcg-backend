import { request, response } from "express";

import outletService from "../services/outlet.service";
import distributorService from "../services/distributor.service";


export const createOutlet = async (req = request, res = response) => {
  try {
    const outlet = await outletService.createOutlet(req.body);
    res.status(201).json(outlet);
  } catch (error) {
    res.status(500).json({ message: "Error creating outlet", error });
  }
};


export const getOutlets = async (req = request, res = response) => {
  try {

    const search = req.query.search?.toString() || "";
    const beat_id = req.query.beat_id?.toString() || "";

    const filter: Record<string, any> = {};

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    if (beat_id) {
      filter.beat_id = beat_id;
    }

    const outlets = await outletService.getOutlets(filter);
    res.status(200).json(outlets);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching outlets", error });
  }
};

//Get a single outlet by ID
export const getOutlet = async (req = request, res = response) => {
  try {
     const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const outlet = await outletService.getOutlet(id);
    if (!outlet) {
      return res.status(404).json({ message: "Outlet not found" });
    }
    res.status(200).json(outlet);
  } catch (error) {
    res.status(500).json({ message: "Error fetching outlet", error });
  }
};

//Update an outlet by ID
export const updateOutlet = async (req = request, res = response) => {
  try {

     const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const outlet = await outletService.updateOutlet(id, req.body);
    if (!outlet) {
      return res.status(404).json({ message: "Outlet not found" });
    }
    res.status(200).json(outlet);
  } catch (error) {
    res.status(500).json({ message: "Error updating outlet", error });
  }
};

//Delete an outlet by ID
export const deleteOutlet = async (req = request, res = response) => {
  try {

     const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const outlet = await outletService.deleteOutlet(id);
    if (!outlet) {
      return res.status(404).json({ message: "Outlet not found" });
    }

    res.status(200).json({ message: "Outlet deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting outlet", error });
  }
};

//change outlet status
export const updateOutletStatus = async (req = request, res = response) => {
  try {


     const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const outlet = await outletService.updateOutletStatus(id);

    res.status(200).json({
      message: `Outlet status updated to ${outlet.status}`,
      data: outlet
    });

  } catch (error: any) {

    if (error.message === "Outlet not found") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({
      message: "Error updating outlet status",
      error: error.message
    });
  }
};
