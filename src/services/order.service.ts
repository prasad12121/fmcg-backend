import mongoose from "mongoose";
import orderRepository from "../repositories/order.repository";
import orderItemRepository from "../repositories/orderItem.repository";
import schemeService from "./scheme.service";
import stockRepository from "../repositories/stock.repository";
import variantRepository from "../repositories/variant.repository";

import stockService from "./stock.service";

const normalizeVariantId = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "_id" in value) {
    return String((value as { _id: unknown })._id);
  }
  return String(value);
};

const variantDisplayName = (
  variant: { name?: string; sku_code?: string } | null,
  fallbackId: string
) => {
  const name = variant?.name?.trim();
  if (name) return name;
  const sku = variant?.sku_code?.trim();
  if (sku) return sku;
  return fallbackId;
};

const buildVariantLabelMap = async (
  rawIds: unknown[]
): Promise<Map<string, string>> => {
  const ids = [
    ...new Set(
      rawIds
        .map(normalizeVariantId)
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
    ),
  ];

  const labels = new Map<string, string>();
  for (const id of ids) {
    labels.set(id, id);
  }

  if (!ids.length) {
    return labels;
  }

  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
  const variants = await variantRepository.find({ _id: { $in: objectIds } });

  for (const variant of variants) {
    const id = String((variant as { _id: unknown })._id);
    labels.set(id, variantDisplayName(variant, id));
  }

  return labels;
};

/** Map of variant_id -> GST rate (%) from the variant master. */
const buildVariantGstMap = async (
  rawIds: unknown[]
): Promise<Map<string, number>> => {
  const ids = [
    ...new Set(
      rawIds
        .map(normalizeVariantId)
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
    ),
  ];

  const map = new Map<string, number>();
  if (!ids.length) return map;

  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
  const variants = await variantRepository.find({ _id: { $in: objectIds } });

  for (const variant of variants) {
    const id = String((variant as { _id: unknown })._id);
    map.set(id, Number((variant as { gst_rate?: number }).gst_rate ?? 0));
  }

  return map;
};

class OrderService {
  async createOrder(data: any) {
    if (!data?.outlet_id) {
      throw new Error("outlet_id is required");
    }
    if (!data?.distributor_id) {
      throw new Error("distributor_id is required");
    }
    if (!Array.isArray(data.items) || data.items.length === 0) {
      throw new Error("items must be a non-empty array");
    }

    const orderNumber = `ORD-${Date.now()}`;
    const order = await orderRepository.create({
      outlet_id: data.outlet_id,
      distributor_id: data.distributor_id,
      subtotal: data.subtotal,
      total_discount: data.total_discount ?? 0,
      total_tax: data.total_tax ?? data.gst ?? 0,
      gst: data.gst ?? data.total_tax ?? 0,
      grand_total: data.grand_total,
      status: data.status ?? "pending",
      order_number: orderNumber,
    });

    const variantLabels = await buildVariantLabelMap(
      data.items.map((item: { variant_id?: unknown }) => item.variant_id)
    );
    const variantGstMap = await buildVariantGstMap(
      data.items.map((item: { variant_id?: unknown }) => item.variant_id)
    );
    const labelFor = (variantId: unknown) =>
      variantLabels.get(normalizeVariantId(variantId)) ??
      normalizeVariantId(variantId);

    let computedSubtotal = 0;
    let computedDiscount = 0;
    let computedTax = 0;

    for (const item of data.items) {
      if (!item?.variant_id) {
        throw new Error("Each item must include variant_id");
      }

      const variantLabel = labelFor(item.variant_id);
      const quantity = Number(item.quantity);
      if (!Number.isFinite(quantity) || quantity < 1) {
        throw new Error(`Invalid quantity for ${variantLabel}`);
      }

      const stock = await stockService.getStocks({
        distributor_id: data.distributor_id,
        variant_id: item.variant_id,
      });

      if (stock.length === 0 || stock[0].quantity < quantity) {
        const available = stock[0]?.quantity ?? 0;
        throw new Error(
          `Insufficient stock for ${variantLabel}: requested ${quantity}, available ${available}`
        );
      }

      const schemaResult = await schemeService.applyScheme(
        item.variant_id,
        quantity,
      );

      // Per-line GST from the variant master (defaults to 0 when unset).
      const gstRate =
        variantGstMap.get(normalizeVariantId(item.variant_id)) ?? 0;
      const price = Number(item.price) || 0;
      const discount = Number(item.discount ?? 0) || 0;
      const lineAmount = price * quantity;
      const lineTaxable = Math.max(lineAmount - discount, 0);
      const lineTax = Number(((lineTaxable * gstRate) / 100).toFixed(2));

      computedSubtotal += lineAmount;
      computedDiscount += discount;
      computedTax += lineTax;

      await orderItemRepository.create({
        order_id: order._id,
        variant_id: item.variant_id,
        quantity,
        base_quantity: Number(item.base_quantity ?? quantity),
        uom_quantities: Array.isArray(item.uom_quantities)
          ? item.uom_quantities
          : [],
        free_quantity:
          item.free_quantity ?? schemaResult?.freeQty ?? 0,
        price,
        discount,
        gst_rate: gstRate,
        tax: lineTax,
        total: Number((lineAmount - discount).toFixed(2)),
      });
    }

    // Recompute order totals server-side so tax reflects per-variant GST
    // rather than any flat rate sent by the client.
    const finalSubtotal = Number(computedSubtotal.toFixed(2));
    const finalDiscount = Number(computedDiscount.toFixed(2));
    const finalTax = Number(computedTax.toFixed(2));
    const finalGrandTotal = Number(
      (finalSubtotal - finalDiscount + finalTax).toFixed(2)
    );

    const updatedOrder = await orderRepository.update(order._id, {
      subtotal: finalSubtotal,
      total_discount: finalDiscount,
      total_tax: finalTax,
      gst: finalTax,
      grand_total: finalGrandTotal,
    });

    return updatedOrder ?? order;
  }

  async getOrders(filter: Record<string, any> = {}) {
    return await orderRepository.findOrdersWithInvoice(filter);
  }

  async getOrder(id: string) {
    const result = await orderRepository.getOrderWithItems(id);
    return result[0] || null; // aggregation returns array
  }

  async updateOrder(id: string, data: any) {
    return await orderRepository.update(id, data);
  }

  //update order with order items
  async updateOrderWithOrderItems(id: string, data: any) {
    return await orderRepository.updateOrderWithOrderItems(id, data);
  }

  async deleteOrder(id: string) {
    return await orderRepository.delete(id);
  }

  async updateOrderStatus(id: string) {
    const order = await orderRepository.findById(id);

    if (!order) {
      throw new Error("Order not found");
    }

    let nextStatus = order.status;

    switch (order.status) {
      case "pending":
        nextStatus = "approved";
        break;

      case "approved":
        nextStatus = "invoiced";
        break;

      case "invoiced":
        nextStatus = "dispatched";
        break;

      case "dispatched":
        nextStatus = "delivered";
        break;

      default:
        throw new Error("Order status cannot be updated");
    }

    return await orderRepository.update(id, { status: nextStatus });
  }

  async cancelOrder(id: string) {
    const order = await orderRepository.findById(id);

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status === "delivered") {
      throw new Error("Delivered order cannot be cancelled");
    }

    return await orderRepository.update(id, { status: "cancelled" });
  }

  async approveOrder(id: string) {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status !== "pending") {
      throw new Error("Only pending orders can be approved");
    }

    return await orderRepository.update(id, { status: "approved" });
  }

  async dispatchOrder(id: string) {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status !== "invoiced") {
      throw new Error("Only invoiced orders can be dispatched");
    }

    const orderItems = Array.isArray(order.items) ? order.items : [];
    const variantLabels = await buildVariantLabelMap(
      orderItems.map((item: { variant_id?: unknown }) => item.variant_id)
    );
    const labelFor = (variantId: unknown) =>
      variantLabels.get(normalizeVariantId(variantId)) ??
      normalizeVariantId(variantId);

    for (const item of orderItems) {
      const stock = await stockRepository.findByVariant(item.variant_id);

      if (stock.quantity < item.quantity) {
        throw new Error(
          `Insufficient stock for ${labelFor(item.variant_id)}: requested ${item.quantity}, available ${stock.quantity}`
        );
      }
      await stockRepository.update(stock._id, {
        quantity: stock.quantity - item.quantity,
        status:
          stock.quantity - item.quantity > 0 ? "available" : "out_of_stock",
      });
    }

    return await orderRepository.update(id, { status: "dispatched" });
  }

  async deliverOrder(id: string) {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status !== "dispatched") {
      throw new Error("Only dispatched orders can be delivered");
    }

    return await orderRepository.update(id, { status: "delivered" });
  }

  async getOrderByOrderNumber(orderNumber: string) {
    return await orderRepository.getOrderWithItems(orderNumber);
  }

  async getProductsInOrder(id: string) {
    return await orderRepository.getProductsInOrder(id);
  }

  async getItemsByOrderIds(orderIds: string[]) {
    return await orderItemRepository.findByOrderIds(orderIds);
  }

  async getDispatchReadyOrders(filters: {
    beat_id?: string;
    outlet_id?: string;
  } = {}) {
    return await orderRepository.getDispatchReadyOrders(filters);
  }
}


export default new OrderService();
