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
        // A delivery groups items from one or more orders/outlets. Build summary
        // fields (order/outlet counts and names) from the related dispatch items.
        const pipeline: any[] = [
            {
                $lookup: {
                    from: "dispatchitems",
                    localField: "_id",
                    foreignField: "dispatch_id",
                    as: "items",
                },
            },
            {
                $lookup: {
                    from: "orders",
                    localField: "items.order_id",
                    foreignField: "_id",
                    as: "orders",
                },
            },
            {
                $lookup: {
                    from: "outlets",
                    localField: "orders.outlet_id",
                    foreignField: "_id",
                    as: "outlets",
                },
            },
            {
                $addFields: {
                    order_ids: {
                        $setUnion: [
                            { $map: { input: "$items", as: "i", in: "$$i.order_id" } },
                            [],
                        ],
                    },
                    outlet_ids: {
                        $setUnion: [
                            { $map: { input: "$outlets", as: "o", in: "$$o._id" } },
                            [],
                        ],
                    },
                    order_numbers: {
                        $map: { input: "$orders", as: "o", in: "$$o.order_number" },
                    },
                    outlet_names: {
                        $map: { input: "$outlets", as: "o", in: "$$o.name" },
                    },
                },
            },
        ];

        const matchStage: Record<string, any> = {};

        if (filters.beat_id && mongoose.Types.ObjectId.isValid(filters.beat_id)) {
            matchStage.beat_id = new mongoose.Types.ObjectId(filters.beat_id);
        }

        if (filters.outlet_id && mongoose.Types.ObjectId.isValid(filters.outlet_id)) {
            matchStage["items.outlet_id"] = new mongoose.Types.ObjectId(filters.outlet_id);
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
                    dispatch_date: 1,
                    vehicle_number: 1,
                    driver_name: 1,
                    receiver_name: 1,
                    status: 1,
                    order_count: { $size: "$order_ids" },
                    outlet_count: { $size: "$outlet_ids" },
                    order_numbers: 1,
                    outlet_names: 1,
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
                        { order_numbers: { $regex: filters.search, $options: "i" } },
                        { outlet_names: { $regex: filters.search, $options: "i" } },
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
