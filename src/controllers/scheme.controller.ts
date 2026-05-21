//generate all the controllers for the scheme routes

import { request, response } from "express";
import schemeService from "../services/scheme.service";

export const createScheme = async (req = request, res = response) => {
    try {
        const scheme = await schemeService.createScheme(req.body);
        res.status(201).json(scheme);
    } catch (error) {
        res.status(500).json({ message: "Error creating scheme", error });
    }
};

export const getSchemes = async (req = request, res = response) => {

    try {
        const schemes = await schemeService.getSchemes();
        res.status(200).json(schemes);
    } catch (error) {
        res.status(500).json({ message: "Error fetching schemes", error });
    }
};

export const getSchemeById = async (req = request, res = response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!id) {
            return res.status(400).json({ message: "Scheme ID is required" });
        }
        const scheme = await schemeService.getSchemeById(id);
        if (!scheme) {
            return res.status(404).json({ message: "Scheme not found" });
        }
        res.status(200).json(scheme);
    } catch (error) {
        res.status(500).json({ message: "Error fetching scheme", error });
    }
};

export const updateScheme = async (req = request, res = response) => {
    try {

        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const scheme = await schemeService.updateScheme(id, req.body);
        if (!scheme) {
            return res.status(404).json({ message: "Scheme not found" });
        }
        res.status(200).json(scheme);
    } catch (error) {
        res.status(500).json({ message: "Error updating scheme", error });
    }
};

export const deleteScheme = async (req = request, res = response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const scheme = await schemeService.deleteScheme(id);
        if (!scheme) {
            return res.status(404).json({ message: "Scheme not found" });
        }
        res.status(200).json(scheme);
    } catch (error) {
        res.status(500).json({ message: "Error deleting scheme", error });
    }
};


export const updateSchemeStatus = async (req = request, res = response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const scheme = await schemeService.updateSchemeStatus(id, req.body);
        if (!scheme) {
            return res.status(404).json({ message: "Scheme not found" });
        }
        res.status(200).json(scheme);
    } catch (error) {
        res.status(500).json({ message: "Error updating scheme status", error });
    }
};


    export default {
        createScheme,
        getSchemes,
        getSchemeById,
        updateScheme,
        deleteScheme,
        updateSchemeStatus
    }