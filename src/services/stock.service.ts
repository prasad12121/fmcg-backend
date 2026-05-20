import { populate } from "dotenv";
import stockRepository from "../repositories/stock.repository";
import stockLedgerRepository from "../repositories/stockLedger.repository";


class StockService {
  async addStock(data: any) {

   console.log("Adding Stock:", data);
    // 1️⃣ Add Ledger Entry
    await stockLedgerRepository.create({

      distributor_id: data.distributor_id,
      variant_id: data.variant_id,
      quantity: data.quantity,
      type: "stock_in",
      reference_id: data.reference_id,
    });

    // 2️⃣ Check Existing Stock
    const stock = await stockRepository.findByDistributorVariant(
      data.distributor_id,
      data.variant_id
    );

    if (stock) {

      // 3️⃣ Update Quantity
      stock.quantity += data.quantity;

      await stock.save();

    } else {

      // 4️⃣ Create New Stock
      await stockRepository.create({
        distributor_id: data.distributor_id,
        variant_id: data.variant_id,
        quantity: data.quantity,
      });

    }
  }

  async dispatchStock(data: any) {

    // 1️⃣ Add Ledger Entry
    await stockLedgerRepository.create({
      distributor_id: data.distributor_id,
      variant_id: data.variant_id,
      quantity: -data.quantity,
      type: "order_dispatch",
      reference_id: data.order_id,
    });

    // 2️⃣ Get Stock
    const stock = await stockRepository.findByDistributorVariant(
      data.distributor_id,
      data.variant_id
    );

    if (!stock) {
      throw new Error("Stock not found");
    }

    if (stock.quantity < data.quantity) {
      throw new Error("Insufficient Stock");
    }

    // 3️⃣ Deduct Quantity
    stock.quantity -= data.quantity;

    await stock.save();
  }


 async getStocks(distributor_id: string, variant_id: string) {
    return await stockRepository.find({
      distributor_id,
      variant_id,
    });
  }


  async updateStock(id: string, data: any) {
    return await stockRepository.update(id, data);
  }
  

async getStock(filter: Record<string, any> = {}) {
  const stocks = await stockRepository.find(filter, ["variant_id"]);

  return stocks.filter((item: any) =>
    item.variant_id?.name
      ?.toLowerCase()
      .includes(filter?.name?.$regex?.toLowerCase() || "")
  );
}

  async getStockLedgerEntries(filter: Record<string, any> = {}) {
    return await stockLedgerRepository.getEntries(filter);
  }

  
}

export default new StockService();
