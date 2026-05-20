import BaseRepository from "./base.repository";
import stockLedgerSchemaModel from "../models/stockLedgerSchema.model";
import { PipelineStage } from "mongoose";
import mongoose from "mongoose";

class StockLedgerRepository extends BaseRepository<any> {
  constructor() {
    super(stockLedgerSchemaModel);
  }

  async getStockBalance(distributor_id: string, variant_id: string) {
    const result = await this.aggregate([
      {
        $match: {
          distributor_id: new mongoose.Types.ObjectId(distributor_id),
          variant_id: new mongoose.Types.ObjectId(variant_id),
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$quantity" },
        },
      },
    ]) as Array<{ _id: null; total: number }>;

    return result.length ? result[0].total : 0;
  }

  async getEntries(filter: Record<string, any> = {}) {
    return await this.model
      .find(filter)
      .populate("variant_id", "name sku_code")
      .populate("distributor_id", "name")
      .sort({ createdAt: -1 });
  }
}

export default new StockLedgerRepository();
