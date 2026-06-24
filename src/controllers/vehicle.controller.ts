import { request, response } from "express";
import vehicleService from "../services/vehicle.service";

const distId = (req: typeof request): string | null =>
  req.user?.role === "Distributor" && req.user.distributor_id
    ? req.user.distributor_id
    : null;

export const createVehicle = async (req = request, res = response) => {
  try {
    const data = { ...req.body };
    const did = distId(req);
    if (did) data.distributor_id = did;
    const newVehicle = await vehicleService.createVehicle(data);
    res.status(201).json(newVehicle);
  } catch (error: any) {
    if (error.code === 11000)
      return res.status(409).json({ message: "Vehicle number already exists for this distributor." });
    res.status(500).json({ message: "Error creating vehicle", error: error.message });
  }
};

export const getVehicles = async (req = request, res = response) => {
  try {
    const search = req.query.search?.toString() || "";
    const filter: Record<string, any> = search
      ? { vehicle_number: { $regex: search, $options: "i" } }
      : {};
    const did = distId(req);
    if (did) filter.distributor_id = did;
    const vehicles = await vehicleService.getVehicles(filter);
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: "Error fetching vehicles", error });
  }
};

export const getVehicle = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const vehicle = await vehicleService.getVehicle(id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    const did = distId(req);
    if (did && String((vehicle as any).distributor_id) !== did)
      return res.status(403).json({ message: "Forbidden" });
    res.status(200).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: "Error fetching vehicle", error });
  }
};

export const updateVehicle = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const did = distId(req);
    if (did) {
      const existing = await vehicleService.getVehicle(id);
      if (!existing) return res.status(404).json({ message: "Vehicle not found" });
      if (String((existing as any).distributor_id) !== did)
        return res.status(403).json({ message: "You can only edit your own vehicles" });
      delete req.body.distributor_id;
    }
    const vehicle = await vehicleService.updateVehicle(id, req.body);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    res.status(200).json(vehicle);
  } catch (error: any) {
    if (error.code === 11000)
      return res.status(409).json({ message: "Vehicle number already exists for this distributor." });
    res.status(500).json({ message: "Error updating vehicle", error: error.message });
  }
};

export const updateVehicleStatus = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const did = distId(req);
    if (did) {
      const existing = await vehicleService.getVehicle(id);
      if (!existing) return res.status(404).json({ message: "Vehicle not found" });
      if (String((existing as any).distributor_id) !== did)
        return res.status(403).json({ message: "Forbidden" });
    }
    const vehicle = await vehicleService.updateVehicleStatus(id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    res.status(200).json({ message: "Vehicle status updated", vehicle });
  } catch (error) {
    res.status(500).json({ message: "Error updating vehicle status", error });
  }
};
