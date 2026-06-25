import { request, response } from "express";
import mongoose from "mongoose";

import orderService from "../services/order.service";
import OrderItem from "../models/orderItems.model";
import Outlet from "../models/outlet.omodel";

export const createOrder = async (req = request, res = response) => {
  try {
    // ── SuperAdmin: validate outlet belongs to the selected distributor ───────
    // Distributors can only create orders for their own outlets (enforced via JWT
    // distributor_id stamp in the service layer), so this guard is Admin-only.
    if (req.user?.role === "SuperAdmin") {
      const { outlet_id, distributor_id } = req.body;

      if (!outlet_id || !distributor_id) {
        return res.status(400).json({ message: "outlet_id and distributor_id are required." });
      }

      const outlet = await Outlet.findById(outlet_id).select("distributor_id").lean();
      if (!outlet) {
        return res.status(400).json({ message: "Outlet not found." });
      }

      const outletDistId = String((outlet as any).distributor_id ?? "");
      const orderDistId  = String(distributor_id);

      if (!outletDistId || outletDistId !== orderDistId) {
        return res.status(400).json({
          message: "Outlet does not belong to the selected distributor. Please select a valid outlet.",
        });
      }
    }

    const order = await orderService.createOrder(req.body);
    res.status(201).json(order);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error creating order";
    const isClientError =
      message.includes("required") ||
      message.includes("items must") ||
      message.includes("Insufficient stock") ||
      message.includes("Invalid quantity") ||
      message.includes("variant_id");

    res.status(isClientError ? 400 : 500).json({ message });
  }
};

export const getOrders = async (req = request, res = response) => {
  try {
    const search = req.query.search?.toString() || "";
    const distributor_id = req.query.distributor_id?.toString() || "";

    const filter: Record<string, any> = {};

    if (search && mongoose.Types.ObjectId.isValid(search)) {
      filter._id = new mongoose.Types.ObjectId(search);
    }

    // Distributor sees only their own orders
    if (req.user?.role === "Distributor" && req.user.distributor_id) {
      filter.distributor_id = new mongoose.Types.ObjectId(req.user.distributor_id);
    }

    // SuperAdmin can optionally filter by a specific distributor
    if (req.user?.role === "SuperAdmin" && distributor_id && mongoose.Types.ObjectId.isValid(distributor_id)) {
      filter.distributor_id = new mongoose.Types.ObjectId(distributor_id);
    }

    const orders = await orderService.getOrders(filter);

    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching orders", error });
  }
};

//Get a single order by ID
export const getOrder = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const order = await orderService.getOrder(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Error fetching order", error });
  }
};


//get all products in an order
export const getProductsInOrder = async (req = request, res = response) => {
  try {
    const orderNumber = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const products = await orderService.getProductsInOrder(orderNumber);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products in order", error });
  }
};

export const getItemsByOrderIds = async (req = request, res = response) => {
  try {
    const bodyOrderIds = Array.isArray(req.body?.order_ids) ? req.body.order_ids : [];
    const queryOrderIds = typeof req.query.order_ids === "string"
      ? req.query.order_ids.split(",")
      : Array.isArray(req.query.order_ids)
        ? req.query.order_ids
        : [];

    // Convert the param order id(s) to an array
    const paramOrderIds = typeof req.params.id === "string"
      ? req.params.id.split(",")
      : Array.isArray(req.params.id)
        ? req.params.id.flatMap((id) => id.split(","))
        : [];

    const rawOrderIds = [...bodyOrderIds, ...queryOrderIds, ...paramOrderIds]
      .filter((id): id is string => typeof id === "string" && id.trim().length > 0);

    if (!rawOrderIds.length) {
      return res.status(400).json({ message: "order_ids must be a non-empty array" });
    }

    const validOrderIds = rawOrderIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    if (!validOrderIds.length) {
      return res.status(400).json({ message: "No valid order IDs provided" });
    }

    const groupedItems = await OrderItem.aggregate([
      {
        $match: {
          order_id: { $in: validOrderIds },
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
        $group: {
          _id: "$order_id",
          items: {
            $push: {
              _id: "$_id",
              order_id: "$order_id",
              variant_id: "$variant_id",
              variant: "$variant",
              quantity: "$quantity",
              free_quantity: "$free_quantity",
              price: "$price",
              discount: "$discount",
              tax: "$tax",
              total: "$total",
              createdAt: "$createdAt",
              updatedAt: "$updatedAt",
            },
          },
        },
      },
    ]);

    const items = groupedItems.flatMap((group) => group.items);
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching order items", error });
  }
};

export const getDispatchReadyOrders = async (req = request, res = response) => {
  try {
    const beat_id = typeof req.query.beat_id === "string" ? req.query.beat_id : undefined;
    const outlet_id = typeof req.query.outlet_id === "string" ? req.query.outlet_id : undefined;

    const orders = await orderService.getDispatchReadyOrders({ beat_id, outlet_id });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching dispatch-ready orders", error });
  }
};


//Update an order by ID
export const updateOrder = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const order = await orderService.updateOrder(id, req.body);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Error updating order", error });
  }
};

//Delete an order by ID
export const deleteOrder = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const order = await orderService.deleteOrder(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting order", error });
  }
};

export const updateOrderStatus = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const order = await orderService.updateOrderStatus(id);

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Error updating order status", error });
  }
};

export const approveOrder = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const order = await orderService.approveOrder(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Error approving order", error });
  }
};

export const cancelOrder = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const order = await orderService.cancelOrder(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Error cancelling order", error });
  }
};

export const dispatchOrder = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const order = await orderService.dispatchOrder(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Error dispatching order", error });
  }
};

export const deliverOrder = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const order = await orderService.deliverOrder(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Error delivering order", error });
  }
};

export const updateOrderWithOrderItems = async (req = request, res = response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const order = await orderService.updateOrderWithOrderItems(id, req.body);
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Error updating order with order items", error });
  }
};
