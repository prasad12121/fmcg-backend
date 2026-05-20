import { request, response } from "express";

import beatService from "../services/beat.service";


export const createBeat = async (req = request, res = response) => {
  try {
    const beat = await beatService.createBeat(req.body);
    res.status(201).json(beat);
  } catch (error) {
    res.status(500).json({ message: "Error creating beat", error });
  }
};


export const getBeats = async (req = request, res = response) => {
  try {

    const search = req.query.search?.toString() || "";

    const filter = search
      ? { name: { $regex: search, $options: "i" } }
      : {};

    const beats = await beatService.getBeats(filter);
    res.status(200).json(beats);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching beats" });
  }
};

//Get a single beat by ID
export const getBeatById = async (req = request, res = response) => {
  try {
     const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const beat = await beatService.getBeat(id);
    if (!beat) {
      return res.status(404).json({ message: "Beat not found" });
    }
    res.status(200).json(beat);
  } catch (error) {
    res.status(500).json({ message: "Error fetching beat", error });
  }
};

//Update a beat by ID
export const updateBeat = async (req = request, res = response) => {
  try {

     const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const beat = await beatService.updateBeat(id, req.body);
    if (!beat) {
      return res.status(404).json({ message: "Beat not found" });
    }
    res.status(200).json(beat);
  } catch (error) {
    res.status(500).json({ message: "Error updating beat", error });
  }
};

//Delete a beat by ID
export const deleteBeat = async (req = request, res = response) => {
  try {

     const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const beat = await beatService.deleteBeat(id);
    if (!beat) {
      return res.status(404).json({ message: "Beat not found" });
    }

    res.status(200).json({ message: "Beat deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting beat", error });
  }
};

//change beat status
export const updateBeatStatus = async (req = request, res = response) => {
  try {


     const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const beat = await beatService.updateBeatStatus(id);

    res.status(200).json({
      message: `Beat status updated to ${beat.status}`,
      data: beat
    });

  } catch (error: any) {

    if (error.message === "Beat not found") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({
      message: "Error updating beat status",
      error: error.message
    });
  }
};
