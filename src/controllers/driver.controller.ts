//create a controller for driver model and driver service

import { request, response } from "express";
import driverService from "../services/driver.service";

export const createDriver = async (req = request, res = response) => {
    try {
        const newDriver = await driverService.createDriver(req.body);
        res.status(201).json(newDriver);
    } catch (error) {
        res.status(500).json({ message: "Error creating driver", error });
    }
};

//getdrivers
export const getDrivers = async (req = request, res = response) => {
    try {
        const drivers = await driverService.getDrivers(req.query);
        res.status(200).json(drivers);
    } catch (error) {
        res.status(500).json({ message: "Error fetching drivers", error });
    }
};

//getdriver
export const getDriver = async (req = request, res = response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const driver = await driverService.getDriver(id);
        res.status(200).json(driver);
    } catch (error) {
        res.status(500).json({ message: "Error fetching driver", error });
    }
};


//update driver

export const updateDriverStatus = async (req = request, res = response) => {

    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const driver = await driverService.updateDriverStatus(id);
        res.status(200).json(driver);
    } catch (error) {
        res.status(500).json({ message: "Error updating driver status", error });
    }
};

//delete driver
export const deleteDriver = async (req = request, res = response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const driver = await driverService.deleteDriver(id);
        res.status(200).json(driver);
    } catch (error) {
        res.status(500).json({ message: "Error deleting driver", error });
    }
};
