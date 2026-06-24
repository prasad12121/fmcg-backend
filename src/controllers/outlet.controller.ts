import { request, response } from "express";

import outletService from "../services/outlet.service";


export const createOutlet = async (req = request, res = response) => {
  try {
    const data = { ...req.body };

    // Auto-assign distributor_id from JWT when a Distributor creates an outlet
    if (req.user?.role === "Distributor" && req.user.distributor_id) {
      data.distributor_id = req.user.distributor_id;
    }

    const outlet = await outletService.createOutlet(data);
    res.status(201).json(outlet);
  } catch (error: any) {
    if (error.code === 11000) {
      const keyPattern = error.keyPattern || {};
      const fieldLabelMap: Record<string, string> = {
        outlet_number: "Outlet Code",
        email:         "Email",
        username:      "Username",
        open_time:     "Open Time",
        close_time:    "Close Time",
      };
      const conflictField = Object.keys(keyPattern)[0] ?? "";
      const label = fieldLabelMap[conflictField] || conflictField || "A field";
      return res.status(409).json({ message: `${label} already exists. Please use a unique value.` });
    }
    res.status(500).json({ message: "Error creating outlet", error: error.message });
  }
};


export const getOutlets = async (req = request, res = response) => {
  try {
    const search = req.query.search?.toString() || "";
    const beat_id = req.query.beat_id?.toString() || "";
    const distributor_id = req.query.distributor_id?.toString() || "";

    const filter: Record<string, any> = {};

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    if (beat_id) {
      filter.beat_id = beat_id;
    }

    if (req.user?.role === "Distributor" && req.user.distributor_id) {
      // Distributor always sees only their own outlets — ignore any query param
      filter.distributor_id = req.user.distributor_id;
    } else if (req.user?.role === "SuperAdmin" && distributor_id) {
      // SuperAdmin can optionally filter by a specific distributor
      filter.distributor_id = distributor_id;
    }

    const outlets = await outletService.getOutlets(filter);
    res.status(200).json(outlets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching outlets", error });
  }
};

// Get a single outlet by ID
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

// Update an outlet by ID
export const updateOutlet = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const body = { ...req.body };

    // Distributor: may only update outlets under their own account
    if (req.user?.role === "Distributor") {
      const existing = await outletService.getOutlet(id);
      if (!existing) {
        return res.status(404).json({ message: "Outlet not found" });
      }
      const existingDistId = String(
        (existing as any).distributor_id?._id ||
        (existing as any).distributor_id ||
        ""
      );
      if (!existingDistId || existingDistId !== req.user.distributor_id) {
        return res.status(403).json({ message: "You can only edit outlets belonging to your distributor account" });
      }
      // Distributor cannot reassign the outlet to a different distributor
      delete body.distributor_id;
    }

    const outlet = await outletService.updateOutlet(id, body);
    if (!outlet) {
      return res.status(404).json({ message: "Outlet not found" });
    }
    res.status(200).json(outlet);
  } catch (error: any) {
    // MongoDB duplicate key violation
    if (error.code === 11000) {
      const keyPattern = error.keyPattern || {};
      const fieldLabelMap: Record<string, string> = {
        outlet_number: "Outlet Code",
        email:         "Email",
        username:      "Username",
        open_time:     "Open Time",
        close_time:    "Close Time",
      };
      const conflictField = Object.keys(keyPattern)[0] ?? "";
      const label = fieldLabelMap[conflictField] || conflictField || "A field";
      return res.status(409).json({ message: `${label} already exists. Please use a unique value.` });
    }
    res.status(500).json({ message: "Error updating outlet", error: error.message });
  }
};

// Delete an outlet by ID
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

// Toggle outlet status
export const updateOutletStatus = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const outlet = await outletService.updateOutletStatus(id);

    res.status(200).json({
      message: `Outlet status updated to ${outlet.status}`,
      data: outlet,
    });
  } catch (error: any) {
    if (error.message === "Outlet not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Error updating outlet status", error: error.message });
  }
};
