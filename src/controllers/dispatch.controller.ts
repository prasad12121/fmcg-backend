//create a controller for dispatch model

import { request, response } from "express";
import mongoose from "mongoose";

import dispatchService from "../services/dispatch.service";

export const createDispatch = async (req = request, res = response) => {
    try {
        const newDispatch = await dispatchService.createDispatch(req.body);
        res.status(201).json(newDispatch);
    } catch (error) {
        res.status(500).json({ message: "Error creating dispatch", error });
    }
};

export const getDispatches = async (req = request, res = response) => {
    try {
        const beat_id = typeof req.query.beat_id === "string" ? req.query.beat_id : undefined;
        const outlet_id = typeof req.query.outlet_id === "string" ? req.query.outlet_id : undefined;
        const status = typeof req.query.status === "string" ? req.query.status : undefined;
        const search = typeof req.query.search === "string" ? req.query.search : undefined;

        const dispatches = await dispatchService.getDispatchesForTable({
            beat_id,
            outlet_id,
            status,
            search,
        });
        res.status(200).json(dispatches);
    } catch (error) {

        res.status(500).json({ message: "Error fetching dispatches", error });
    }
};

export const getDispatchItems = async (req = request, res = response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        console.log("[dispatch-items] id=", id, "db=", mongoose.connection.name, "host=", mongoose.connection.host);
        const items = await dispatchService.getDispatchItems(id);
        console.log(items);
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: "Error fetching dispatch items", error });
    }
};

export const getDispatch = async (req = request, res = response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const dispatch = await dispatchService.getDispatch(id);
        res.status(200).json(dispatch);
    } catch (error) {
        res.status(500).json({ message: "Error fetching dispatch", error });
    }
};

export const updateDispatch = async (req = request, res = response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const dispatch = await dispatchService.updateDispatch(id, req.body);
        res.status(200).json(dispatch);
    } catch (error) {
        res.status(500).json({ message: "Error updating dispatch", error });
    }
};

export const deleteDispatch = async (req = request, res = response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const dispatch = await dispatchService.deleteDispatch(id);
        res.status(200).json(dispatch);
    } catch (error) {
        res.status(500).json({ message: "Error deleting dispatch", error });
    }
};

export const updateDispatchStatus = async (req = request, res = response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const dispatch = await dispatchService.updateDispatchStatus(id);
        res.status(200).json(dispatch);
    } catch (error) {

        res.status(500).json({ message: "Error updating dispatch status", error });
    }
};

export const confirmDelivery = async (req = request, res = response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const dispatch = await dispatchService.confirmDelivery(id, req.body);
        res.status(200).json(dispatch);
    } catch (error) {
        res.status(500).json({ message: "Error confirming delivery", error });
    }
};
