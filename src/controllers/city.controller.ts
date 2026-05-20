import { Request, Response } from "express";
import cityService from "../services/city.service";


export const createCity = async (req: Request, res: Response) => {
  try {
    const city = await cityService.createCity(req.body);
    res.status(201).json(city);
  } catch (error) {
    res.status(500).json({ message: "Error creating city", error });
  }
};

export const getCities = async (req: Request, res: Response) => {
 try {

    const search = req.query.search?.toString() || "";
    const state_id = req.query.state_id?.toString();

    const filter: any = {};

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    if (state_id) {
      filter.state_id = state_id;
    }

    const cities = await cityService.getCities(filter);

    res.status(200).json(cities);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching cities" });
  }
};

export const getCityById = async (req: Request, res: Response) => {
  try {
     const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const city = await cityService.getCity(id);
    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }
    res.status(200).json(city);
  } catch (error) {
    res.status(500).json({ message: "Error fetching city", error });
  }
};

export const updateCity = async (req: Request, res: Response) => {
  try {
     const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const city = await cityService.updateCity(id, req.body);
    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }
    res.status(200).json(city);
  } catch (error) {
    res.status(500).json({ message: "Error updating city", error });
  }
};

export const deleteCity = async (req: Request, res: Response) => {
  try {
     const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const city = await cityService.deleteCity(id);

    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }
    res.status(200).json({ message: "City deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting city", error });
  }
};

export const updateCityStatus = async (req: Request, res: Response) => {
  try {
     const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const city = await cityService.updateCityStatus(id);

    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }
    res.status(200).json(city);
  } catch (error) {
    res.status(500).json({ message: "Error updating city status", error });
  }
};
