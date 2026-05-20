import { request, response } from "express";
import vehicleService from "../services/vehicle.service";



export const createVehicle = async (req = request, res = response) => {
    try {
        const newVehicle = await vehicleService.createVehicle(req.body);
        res.status(201).json(newVehicle);
    } catch (error) {
        res.status(500).json({ message: "Error creating vehicle", error });
    }
};

//create code for   getvehicles
export const getVehicles = async (req = request, res = response) => {
    try {
        const { search } = req.query;
        const filter = search
            ? { name: { $regex: String(search), $options: "i" } }
            : {};
        const vehicles = await vehicleService.getVehicles(filter);
        res.status(200).json(vehicles);
    } catch (error) {
        res.status(500).json({ message: "Error fetching vehicles", error });
    }
};



//update vehicle
export const updateVehicle = async (req = request, res = response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const vehicle = await vehicleService.updateVehicle(id, req.body);
        res.status(200).json(vehicle);
    } catch (error) {
        res.status(500).json({ message: "Error updating vehicle", error });
    }
};


//create code for getvehicle
export const getVehicle = async (req = request, res = response) => {
    try {
        
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const vehicle = await vehicleService.getVehicle(id);
        res.status(200).json(vehicle);
    } catch (error) {
        res.status(500).json({ message: "Error fetching vehicle", error });
    }
};

//create code for updateVehicle
export const updateVehicleStatus = async (req = request, res = response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const vehicle = await vehicleService.updateVehicleStatus(id);
        if (!vehicle) {
            return res.status(404).json({ message: "Vehicle not found" });
        }
        res.status(200).json({ message: "Vehicle status updated", vehicle });
    } catch (error) {
        res.status(500).json({ message: "Error updating vehicle status", error });
    }
};

