import { request, response } from "express";
import schemeService from "../services/scheme.service";

const distId = (req: typeof request): string | null =>
  req.user?.role === "Distributor" && req.user.distributor_id
    ? req.user.distributor_id
    : null;

export const createScheme = async (req = request, res = response) => {
  try {
    const data = { ...req.body };
    const did = distId(req);
    if (did) data.distributor_id = did;
    const scheme = await schemeService.createScheme(data);
    res.status(201).json(scheme);
  } catch (error: any) {
    res.status(500).json({ message: "Error creating scheme", error: error.message });
  }
};

export const getSchemes = async (req = request, res = response) => {
  try {
    const filter: Record<string, any> = {};
    const did = distId(req);
    if (did) filter.distributor_id = did;
    else if (req.query.distributor_id) filter.distributor_id = req.query.distributor_id;
    const schemes = await schemeService.getSchemes(filter);
    res.status(200).json(schemes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching schemes", error });
  }
};

export const getSchemeById = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) return res.status(400).json({ message: "Scheme ID is required" });
    const scheme = await schemeService.getSchemeById(id);
    if (!scheme) return res.status(404).json({ message: "Scheme not found" });
    const did = distId(req);
    if (did && String((scheme as any).distributor_id) !== did)
      return res.status(403).json({ message: "Forbidden" });
    res.status(200).json(scheme);
  } catch (error) {
    res.status(500).json({ message: "Error fetching scheme", error });
  }
};

export const updateScheme = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const did = distId(req);
    if (did) {
      const existing = await schemeService.getSchemeById(id);
      if (!existing) return res.status(404).json({ message: "Scheme not found" });
      if (String((existing as any).distributor_id) !== did)
        return res.status(403).json({ message: "You can only edit your own schemes" });
      delete req.body.distributor_id;
    }
    const scheme = await schemeService.updateScheme(id, req.body);
    if (!scheme) return res.status(404).json({ message: "Scheme not found" });
    res.status(200).json(scheme);
  } catch (error: any) {
    res.status(500).json({ message: "Error updating scheme", error: error.message });
  }
};

export const deleteScheme = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const did = distId(req);
    if (did) {
      const existing = await schemeService.getSchemeById(id);
      if (!existing) return res.status(404).json({ message: "Scheme not found" });
      if (String((existing as any).distributor_id) !== did)
        return res.status(403).json({ message: "You can only delete your own schemes" });
    }
    const scheme = await schemeService.deleteScheme(id);
    if (!scheme) return res.status(404).json({ message: "Scheme not found" });
    res.status(200).json(scheme);
  } catch (error: any) {
    res.status(500).json({ message: "Error deleting scheme", error: error.message });
  }
};

export const updateSchemeStatus = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const did = distId(req);
    if (did) {
      const existing = await schemeService.getSchemeById(id);
      if (!existing) return res.status(404).json({ message: "Scheme not found" });
      if (String((existing as any).distributor_id) !== did)
        return res.status(403).json({ message: "Forbidden" });
    }
    const scheme = await schemeService.updateSchemeStatus(id, req.body);
    if (!scheme) return res.status(404).json({ message: "Scheme not found" });
    res.status(200).json(scheme);
  } catch (error: any) {
    res.status(500).json({ message: "Error updating scheme status", error: error.message });
  }
};

export default { createScheme, getSchemes, getSchemeById, updateScheme, deleteScheme, updateSchemeStatus };
