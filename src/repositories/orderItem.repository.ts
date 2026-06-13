
import mongoose from "mongoose";

import BaseRepository from "./base.repository";
import orderItemsModel from "../models/orderItems.model";

class OrderItemRepository extends BaseRepository<any> {
  constructor() {
    super(orderItemsModel);
  }

  async findByOrderIds(orderIds: string[]) {
    const validOrderIds = orderIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    if (!validOrderIds.length) {
      return [];
    }

    return await orderItemsModel
      .find({ order_id: { $in: validOrderIds } })
      .populate({
        path: "variant_id",
        select: "name sku_code pack_size unit_id weight status",
      })
      .select("order_id variant_id quantity base_quantity uom_quantities free_quantity price discount gst_rate tax total")
      .sort({ createdAt: -1 })
      .lean();
  }
}

export default new OrderItemRepository();
