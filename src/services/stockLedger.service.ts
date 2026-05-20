import stockLedgerRepository from "../repositories/stockLedger.repository";

interface CreateStockEntryParams {
  distributor_id: string;
  variant_id: string;
  type:
    | "stock_in"
    | "order_dispatch"
    | "delivery_confirmed"
    | "sales_return"
    | "sales_return_damaged"
    | "purchase_return"
    | "adjustment";
  quantity: number;
  reference_id?: string;
  note?: string;
}

class StockLedgerService {

  async createStockEntry({
    distributor_id,
    variant_id,
    type,
    quantity,
    reference_id,
    note,
  }: CreateStockEntryParams) {

    let finalQty = quantity;

    if (type === "order_dispatch" || type === "delivery_confirmed" || type === "purchase_return") {
      finalQty = -Math.abs(quantity);
    }

    if (type === "stock_in" || type === "sales_return") {
      finalQty = Math.abs(quantity);
    }

    if (type === "sales_return_damaged" || type === "adjustment") {
      finalQty = quantity;
    }

    return await stockLedgerRepository.create({
      distributor_id,
      variant_id,
      type,
      quantity: finalQty,
      reference_id,
      note,
    });
  }

  async getStockBalance(distributor_id: string, variant_id: string) {
    return await stockLedgerRepository.getStockBalance(distributor_id, variant_id);
  }

  async getEntries(filter: Record<string, any> = {}) {
    return await stockLedgerRepository.getEntries(filter);
  }
}

export default new StockLedgerService();
