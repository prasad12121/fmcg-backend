import { Request, Response } from "express";
import mongoose from "mongoose";
import stateService from "../services/state.service";


export const createState = async (req: Request, res: Response) => {
  try {
    const state = await stateService.createState(req.body);
    res.status(201).json(state);
  } catch (error) {
    res.status(500).json({ message: "Error creating state", error });
  }
};

export const getStates = async (req: Request, res: Response) => {
  try {

    console.log("Query parameters:", req.query); // Debugging line to check query parameters
    const search = req.query.search?.toString() || "";
    const country_id = req.query.country_id?.toString();

    const filter: any = {};

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    if (country_id && mongoose.Types.ObjectId.isValid(country_id)) {
      filter.country_id = new mongoose.Types.ObjectId(country_id);
    }

    const states = await stateService.getStates(filter);

    res.status(200).json(states);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching states" });
  }
};

export const getState = async (req: Request, res: Response) => {
  try {

     const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const state = await stateService.getState(id, "country_id");

    if (!state) {
      return res.status(404).json({ message: "State not found" });
    }

    res.status(200).json(state);
  } catch (error) {
    res.status(500).json({ message: "Error fetching state" });
  }
};
export const updateState = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const state = await stateService.updateState(id, req.body);
    if (!state) {
      return res.status(404).json({ message: "State not found" });
    }
    res.status(200).json(state);
  } catch (error) {
    res.status(500).json({ message: "Error updating state", error });
  }
};

export const deleteState = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const state = await stateService.deleteState(id);

    if (!state) {
      return res.status(404).json({ message: "State not found" });
    }
    res.status(200).json({ message: "State deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting state", error });
  }
};

export const updateStateStatus = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const state = await stateService.updateStateStatus(id);

    if (!state) {
      return res.status(404).json({ message: "State not found" });
    }
    res.status(200).json(state);
  } catch (error) {
    res.status(500).json({ message: "Error updating state status", error });
  }
};
