import { Request, Response } from "express";
import countryService from "../services/country.service";


export const createCountry = async (req: Request, res: Response) => {
  try {
    const country = await countryService.createCountry(req.body);
    res.status(201).json(country);
  } catch (error) {
    res.status(500).json({ message: "Error creating country", error });
  }
};

export const getCountries = async (req: Request, res: Response) => {
  try {
    const search = req.query.search?.toString() || "";

    const filter = search
      ? { name: { $regex: search, $options: "i" } }
      : {};

    const states = await countryService.getCountries(filter);

    res.status(200).json(states);
  } catch (error) {
    res.status(500).json({ message: "Error fetching states" });
  }
};

export const getCountryById = async (req: Request, res: Response) => {
  try {
     const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const country = await countryService.getCountry(id);
    if (!country) {
      return res.status(404).json({ message: "Country not found" });
    }
    res.status(200).json(country);
  } catch (error) {
    res.status(500).json({ message: "Error fetching country", error });
  }
};

export const updateCountry = async (req: Request, res: Response) => {
  try {
     const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const country = await countryService.updateCountry(id, req.body);
    if (!country) {
      return res.status(404).json({ message: "Country not found" });
    }
    res.status(200).json(country);
  } catch (error) {
    res.status(500).json({ message: "Error updating country", error });
  }
};

export const deleteCountry = async (req: Request, res: Response) => {
  try {
     const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const country = await countryService.deleteCountry(id);

    if (!country) {
      return res.status(404).json({ message: "Country not found" });
    }
    res.status(200).json({ message: "Country deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting country", error });
  }
};

export const updateCountryStatus = async (req: Request, res: Response) => {
  try {
     const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const country = await countryService.updateCountryStatus(id);

    if (!country) {
      return res.status(404).json({ message: "Country not found" });
    }
    country.status = country.status === "active" ? "inactive" : "active";
    await country.save();
    res.status(200).json(country);
  } catch (error) {
    res.status(500).json({ message: "Error updating country status", error });
  }
};
