//create a repository for dispatch model

import mongoose from "mongoose";

import BaseRepository from "./base.repository";
import dispatchModel from "../models/dispatch.model";

class DispatchRepository extends BaseRepository<any> {
    constructor() {
        super(dispatchModel);
    }

    async getDispatchesForTable(filters: {
        beat_id?: string;
        outlet_id?: string;
        status?: string;
        search?: string;
    } = {}) {
        const pipeline: any[] = [
            {
                $lookup: {
                    from: "orders",
                    localField: "order_id",
                    foreignField: "_id",
                    as: "order",
                },
            },
            {
                $unwind: {
                    path: "$order",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "invoices",
                    localField: "invoice_id",
                    foreignField: "_id",
                    as: "invoice",
                },
            },
            {
                $unwind: {
                    path: "$invoice",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "outlets",
                    localField: "order.outlet_id",
                    foreignField: "_id",
                    as: "outlet",
                },
            },
            {
                $unwind: {
                    path: "$outlet",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "beats",
                    localField: "outlet.beat_id",
                    foreignField: "_id",
                    as: "beat",
                },
            },
            {
                $unwind: {
                    path: "$beat",
                    preserveNullAndEmptyArrays: true,
                },
            },
        ];

        const matchStage: Record<string, any> = {};

        if (filters.beat_id && mongoose.Types.ObjectId.isValid(filters.beat_id)) {
            matchStage["outlet.beat_id"] = new mongoose.Types.ObjectId(filters.beat_id);
        }

        if (filters.outlet_id && mongoose.Types.ObjectId.isValid(filters.outlet_id)) {
            matchStage["order.outlet_id"] = new mongoose.Types.ObjectId(filters.outlet_id);
        }

        if (filters.status) {
            matchStage.status = filters.status;
        }

        if (Object.keys(matchStage).length) {
            pipeline.push({ $match: matchStage });
        }

        pipeline.push(
            {
                $project: {
                    order_id: 1,
                    invoice_id: 1,
                    dispatch_date: 1,
                    vehicle_number: 1,
                    driver_name: 1,
                    receiver_name: 1,
                    status: 1,
                    order_number: "$order.order_number",
                    invoice_number: "$invoice.invoice_number",
                    outlet_id: "$outlet._id",
                    outlet_name: "$outlet.name",
                    beat_id: "$beat._id",
                    beat_name: "$beat.name",
                    createdAt: 1,
                    updatedAt: 1,
                },
            },
            {
                $sort: {
                    createdAt: -1,
                },
            },
        );

        if (filters.search) {
            pipeline.push({
                $match: {
                    $or: [
                        { order_number: { $regex: filters.search, $options: "i" } },
                        { invoice_number: { $regex: filters.search, $options: "i" } },
                        { outlet_name: { $regex: filters.search, $options: "i" } },
                        { beat_name: { $regex: filters.search, $options: "i" } },
                        { vehicle_number: { $regex: filters.search, $options: "i" } },
                        { driver_name: { $regex: filters.search, $options: "i" } },
                    ],
                },
            });
        }

        return await this.model.aggregate(pipeline).exec();
    }
}

export default new DispatchRepository();
