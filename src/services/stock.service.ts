import stockRepository from "../repositories/stock.repository";
import stockLedgerRepository from "../repositories/stockLedger.repository";

class StockService {
  async addStock(data: any) {
    console.log("Adding Stock:", data);

    await stockLedgerRepository.create({
      distributor_id: data.distributor_id,
      variant_id: data.variant_id,
      quantity: data.quantity,
      type: "stock_in",
      reference_id: data.reference_id,
    });

    const stock = await stockRepository.findByDistributorVariant(
      data.distributor_id,
      data.variant_id
    );

    if (stock) {
      stock.quantity += data.quantity;
      await stock.save();
    } else {
      await stockRepository.create({
        distributor_id: data.distributor_id,
        variant_id: data.variant_id,
        quantity: data.quantity,
      });
    }
  }

  async dispatchStock(data: any) {
    await stockLedgerRepository.create({
      distributor_id: data.distributor_id,
      variant_id: data.variant_id,
      quantity: -data.quantity,
      type: "order_dispatch",
      reference_id: data.order_id,
    });

    const stock = await stockRepository.findByDistributorVariant(
      data.distributor_id,
      data.variant_id
    );

    if (!stock) throw new Error("Stock not found");
    if (stock.quantity < data.quantity) throw new Error("Insufficient Stock");

    stock.quantity -= data.quantity;
    await stock.save();
  }

  /** List stocks with optional distributor / variant filter + populate */
  async getStocks(filter: Record<string, any> = {}) {
    const cleanFilter: Record<string, any> = {};
    for (const [k, v] of Object.entries(filter)) {
      if (v !== "" && v !== null && v !== undefined) cleanFilter[k] = v;
    }
    return stockRepository.find(cleanFilter, ["variant_id", "distributor_id"]);
  }

  async updateStock(id: string, data: any) {
    return stockRepository.update(id, data);
  }

  async getStock(filter: Record<string, any> = {}) {
    const stocks = await stockRepository.find(filter, ["variant_id", "distributor_id"]);
    return stocks.filter((item: any) =>
      item.variant_id?.name
        ?.toLowerCase()
        .includes(filter?.name?.$regex?.toLowerCase() || "")
    );
  }

  async getStockLedgerEntries(filter: Record<string, any> = {}) {
    return stockLedgerRepository.getEntries(filter);
  }
}

export default new StockService();
