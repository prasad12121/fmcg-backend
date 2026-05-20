import dispatchItemRepository from "../repositories/dispatchItem.repository";
import dispatchRepository from "../repositories/dispatch.repository";
import orderRepository from "../repositories/order.repository";
import returnsRepository from "../repositories/returns.repository";
import stockLedgerService from "./stockLedger.service";
import stockRepository from "../repositories/stock.repository";


class ReturnsService {

  async createReturn(data: any = {}) {

    type ReturnType = "good" | "damaged" | "expired";
    interface ReturnItemInput {
      dispatch_item_id: string;
      return_qty: number;
      return_type?: ReturnType;
      remark?: string;
    }

    const items: ReturnItemInput[] = Array.isArray(data?.items)
      ? (data.items as ReturnItemInput[]).filter((item: ReturnItemInput) => Number(item.return_qty) > 0)
      : [];

    if (!data.dispatch_id || !items.length) {
      throw new Error("dispatch_id and at least one return item are required");
    }

    const dispatch = await dispatchRepository.findById(data.dispatch_id);

    if (!dispatch) {
      throw new Error("Dispatch not found");
    }

    const order = await orderRepository.findById(String(dispatch.order_id));

    if (!order) {
      throw new Error("Order not found");
    }

    const resolvedItems: Array<{
      input: ReturnItemInput;
      dispatchItem: any;
      returnQty: number;
    }> = [];

    const returnItemsForDoc: any[] = [];

    console.log("items in createReturn", items);

    for (const item of items) {
      const dispatchItem = await dispatchItemRepository.findById(String(item.dispatch_item_id));
    

      if (!dispatchItem) {
        throw new Error(`Dispatch item not found: ${item.dispatch_item_id}`);
      }

      const returnQty = Number(item.return_qty);
      const deliveredQty = Number(dispatchItem.delivered_qty || 0);
      const returnedQty = Number(dispatchItem.returned_qty || 0);
      const allowedQty = deliveredQty - returnedQty;

      if (deliveredQty <= 0) {
        throw new Error("Delivery not confirmed for this dispatch item. Confirm delivery before creating returns.");
      }



      if (returnQty > allowedQty) {
        throw new Error(`Return quantity exceeds delivered quantity for variant ${dispatchItem.variant_id}`);
      }

      resolvedItems.push({ input: item, dispatchItem, returnQty });
      returnItemsForDoc.push({
        dispatch_item_id: dispatchItem._id,
        variant_id: dispatchItem.variant_id,
        delivered_qty: dispatchItem.delivered_qty,
        return_qty: returnQty,
        unit_price: dispatchItem.price || 0,
        return_type: item.return_type || "good",
        remark: item.remark || "",
      });
    }

    // Create exactly one Return doc with embedded items (return.model.ts expects return_items[]).
    
    const returnEntry = await returnsRepository.create({
      dispatch_id: dispatch._id,
      order_id: dispatch.order_id,
      invoice_id: dispatch.invoice_id,
      outlet_id: dispatch.outlet_id || order.outlet_id,
      return_number: `RET-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`,
      return_date: new Date(),
      reason: data.reason || "",
      note: data.note || "",
      status: "processed",
      return_items: returnItemsForDoc,
      timeline: [
        {
          status: "processed",
          changed_by_role: "system",
          note: data.note || "",
          timestamp: new Date(),
        },
      ],
    });

    for (const { input, dispatchItem, returnQty } of resolvedItems) {

      await dispatchItemRepository.update(String(dispatchItem._id), {
        returned_qty: Number(dispatchItem.returned_qty || 0) + returnQty,
        status: "returned",
      });

      if (input.return_type === "good" || !input.return_type) {
        await stockLedgerService.createStockEntry({
          distributor_id: String(order.distributor_id),
          variant_id: String(dispatchItem.variant_id),
          type: "sales_return",
          quantity: returnQty,
          reference_id: String(returnEntry._id),
          note: `Sales return for dispatch ${dispatch._id}`,
        });

        let stock = await stockRepository.findByDistributorVariant(
          String(order.distributor_id),
          String(dispatchItem.variant_id),
        );

        if (!stock) {
          stock = await stockRepository.create({
            distributor_id: String(order.distributor_id),
            variant_id: String(dispatchItem.variant_id),
            quantity: 0,
          });
        }

        stock.quantity += returnQty;
        await stock.save();
      } else {
        await stockLedgerService.createStockEntry({
          distributor_id: String(order.distributor_id),
          variant_id: String(dispatchItem.variant_id),
          type: "sales_return_damaged",
          quantity: 0,
          reference_id: String(returnEntry._id),
          note: `Non-saleable return (${input.return_type}) for dispatch ${dispatch._id}`,
        });
      }
    }

    await dispatchRepository.update(String(dispatch._id), {
      status: "returned",
    });

    return returnEntry;
  }

  async getReturns(filter: Record<string, any> = {}) {
    return await returnsRepository.find(filter);
  }

  async getReturn(id: string) {
    return await returnsRepository.findById(id);
  }
}


export default new ReturnsService();
