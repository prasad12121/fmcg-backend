import { request, response } from "express";
import beatService from "../services/beat.service";

const distId = (req: typeof request): string | null =>
  req.user?.role === "Distributor" && req.user.distributor_id
    ? req.user.distributor_id
    : null;

export const createBeat = async (req = request, res = response) => {
  try {
    const data = { ...req.body };
    const did = distId(req);
    if (did) data.distributor_id = did;
    const beat = await beatService.createBeat(data);
    res.status(201).json(beat);
  } catch (error: any) {
    if (error.code === 11000)
      return res.status(409).json({ message: "Beat name already exists in this area for your distributor." });
    res.status(500).json({ message: "Error creating beat", error: error.message });
  }
};

export const getBeats = async (req = request, res = response) => {
  try {
    const search = req.query.search?.toString() || "";
    const area_id = req.query.area_id?.toString();
    const city_id = req.query.city_id?.toString();
    const filter: Record<string, any> = search
      ? { name: { $regex: search, $options: "i" } }
      : {};
    if (area_id) filter.area_id = area_id;
    else if (city_id) filter.city_id = city_id;
    const did = distId(req);
    if (did) filter.distributor_id = did;
    else if (req.query.distributor_id) filter.distributor_id = req.query.distributor_id;
    const beats = await beatService.getBeats(filter);
    res.status(200).json(beats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching beats" });
  }
};

export const getBeatById = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const beat = await beatService.getBeat(id);
    if (!beat) return res.status(404).json({ message: "Beat not found" });
    const did = distId(req);
    if (did && String((beat as any).distributor_id) !== did)
      return res.status(403).json({ message: "Forbidden" });
    res.status(200).json(beat);
  } catch (error) {
    res.status(500).json({ message: "Error fetching beat", error });
  }
};

export const updateBeat = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const did = distId(req);
    if (did) {
      const existing = await beatService.getBeat(id);
      if (!existing) return res.status(404).json({ message: "Beat not found" });
      if (String((existing as any).distributor_id) !== did)
        return res.status(403).json({ message: "You can only edit your own beats" });
      delete req.body.distributor_id;
    }
    const beat = await beatService.updateBeat(id, req.body);
    if (!beat) return res.status(404).json({ message: "Beat not found" });
    res.status(200).json(beat);
  } catch (error: any) {
    if (error.code === 11000)
      return res.status(409).json({ message: "Beat name already exists in this area for your distributor." });
    res.status(500).json({ message: "Error updating beat", error: error.message });
  }
};

export const deleteBeat = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const did = distId(req);
    if (did) {
      const existing = await beatService.getBeat(id);
      if (!existing) return res.status(404).json({ message: "Beat not found" });
      if (String((existing as any).distributor_id) !== did)
        return res.status(403).json({ message: "You can only delete your own beats" });
    }
    const beat = await beatService.deleteBeat(id);
    if (!beat) return res.status(404).json({ message: "Beat not found" });
    res.status(200).json({ message: "Beat deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting beat", error });
  }
};

export const updateBeatStatus = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const did = distId(req);
    if (did) {
      const existing = await beatService.getBeat(id);
      if (!existing) return res.status(404).json({ message: "Beat not found" });
      if (String((existing as any).distributor_id) !== did)
        return res.status(403).json({ message: "Forbidden" });
    }
    const beat = await beatService.updateBeatStatus(id);
    res.status(200).json({ message: `Beat status updated to ${beat.status}`, data: beat });
  } catch (error: any) {
    if (error.message === "Beat not found")
      return res.status(404).json({ message: error.message });
    res.status(500).json({ message: "Error updating beat status", error: error.message });
  }
};
