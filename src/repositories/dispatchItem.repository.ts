import mongoose from "mongoose";

import BaseRepository from "./base.repository";
import dispatchItemModel from "../models/dispatchItem.model";

class DispatchItemRepository extends BaseRepository<any> {
  constructor() {
    super(dispatchItemModel);
  }

  async findByDispatchId(dispatchId: string) {
    if (mongoose.Types.ObjectId.isValid(dispatchId)) {
      return await this.model.find({ dispatch_id: new mongoose.Types.ObjectId(dispatchId) });
    }

    // Fallback in case the caller passes a non-ObjectId dispatch id.
    return await this.model.find({ dispatch_id: dispatchId });
  }

  async getDispatchItemsWithVariant(dispatchId: string) {
    if (!mongoose.Types.ObjectId.isValid(dispatchId)) {
      return [];
    }

    return await this.model.aggregate([
      {
        $match: {
          dispatch_id: new mongoose.Types.ObjectId(dispatchId),
        },
      },
      {
        $lookup: {
          from: "variants",
          localField: "variant_id",
          foreignField: "_id",
          as: "variant",
        },
      },
      {
        $unwind: {
          path: "$variant",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "outlets",
          localField: "outlet_id",
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
        $project: {
          _id: 1,
          order_id: 1,
          invoice_id: 1,
          outlet_id: 1,
          variant_id: 1,
          ordered_qty: 1,
          dispatched_qty: 1,
          delivered_qty: 1,
          short_qty: 1,
          returned_qty: 1,
          free_qty: 1,
          price: 1,
          status: 1,
          remarks: 1,
          variant_name: "$variant.name",
          sku_code: "$variant.sku_code",
          pack_size: "$variant.pack_size",
          outlet_name: "$outlet.name",
          order_number: "$order.order_number",
          invoice_number: "$invoice.invoice_number",
        },
      },
      {
        $sort: {
          createdAt: 1,
        },
      },
    ]);
  }
}

export default new DispatchItemRepository();
