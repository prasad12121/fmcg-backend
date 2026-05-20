import orderRepository from "../repositories/order.repository";
import orderItemRepository from "../repositories/orderItem.repository";
import schemeService from "./scheme.service";
import stockRepository from "../repositories/stock.repository";

import stockService from "./stock.service";

class OrderService {
  async createOrder(data: any) {
    const orderNumber = `ORD-${Date.now()}`;
    const order = await orderRepository.create({
      ...data,
      order_number: orderNumber,
    });

    for (const item of data.items) {
      const stock = await stockService.getStocks(
        data.distributor_id,
        item.variant_id,
      );
      
      if (stock.length === 0 || stock[0].quantity < item.quantity) {
        throw new Error(`Stock not sufficient for variant ${item.variant_id}`);
      }

      const schemaResult = await schemeService.applyScheme(
        item.variant_id,
        item.quantity,
      );
      if (!schemaResult) {
        throw new Error(`Stock not sufficient for variant ${item.variant_id}`);
      }

      await orderItemRepository.create({
        order_id: order._id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        free_quantity: schemaResult.freeQty,
        price: item.price,
      });
    }
    return order;
  }

  async getOrders(filter: Record<string, any> = {}) {
    return await orderRepository.find(filter, ["outlet_id"]);
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
    for (const item of order.items) {
      const stock = await stockRepository.findByVariant(item.variant_id);

      if (stock.quantity < item.quantity) {
        throw new Error(`Insufficient stock for variant ${item.variant_id}`);
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
