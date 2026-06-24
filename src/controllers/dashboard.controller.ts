import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

import Distributor from "../models/distributor.model";
import Invoice from "../models/invoice.model";
import Order from "../models/order.model";
import Outlet from "../models/outlet.omodel";
import Return from "../models/return.model";
import Dispatch from "../models/dispatch.model";

/**
 * GET /api/dashboard/stats
 * Returns stats scoped by role:
 *   - SuperAdmin: all distributors + global counts
 *   - Distributor: counts scoped to their distributor_id
 */
export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const role = req.user?.role;
    const distributorId = req.user?.distributor_id
      ? new mongoose.Types.ObjectId(req.user.distributor_id)
      : null;

    if (role === "SuperAdmin") {
      const [
        totalDistributors,
        activeDistributors,
        totalOutlets,
        totalOrders,
        totalDispatches,
        totalReturns,
        totalInvoices,
      ] = await Promise.all([
        Distributor.countDocuments(),
        Distributor.countDocuments({ status: "active" }),
        Outlet.countDocuments(),
        Order.countDocuments(),
        Dispatch.countDocuments(),
        Return.countDocuments(),
        Invoice.countDocuments(),
      ]);

      res.json({
        role: "SuperAdmin",
        totalDistributors,
        activeDistributors,
        totalOutlets,
        totalOrders,
        totalDispatches,
        totalReturns,
        totalInvoices,
      });
      return;
    }

    if (role === "Distributor" && distributorId) {
      // Fetch all order IDs for this distributor (used for invoice + return lookups)
      const distributorOrders = await Order.find(
        { distributor_id: distributorId },
        { _id: 1 }
      ).lean();
      const orderIds = distributorOrders.map((o: any) => o._id);

      const [
        totalOutlets,
        totalOrders,
        totalInvoices,
        totalDispatches,
        totalReturns,
      ] = await Promise.all([
        Outlet.countDocuments({ distributor_id: distributorId }),
        Order.countDocuments({ distributor_id: distributorId }),
        Invoice.countDocuments({ order_id: { $in: orderIds } }),
        // Count dispatches that have at least one item belonging to this distributor's orders
        Dispatch.aggregate([
          {
            $lookup: {
              from: "dispatchitems",
              localField: "_id",
              foreignField: "dispatch_id",
              as: "items",
            },
          },
          {
            $match: {
              "items.order_id": { $in: orderIds },
            },
          },
          { $count: "total" },
        ]).then((r: any[]) => r[0]?.total ?? 0),
        // Returns scoped to this distributor's orders
        Return.countDocuments({ order_id: { $in: orderIds } }),
      ]);

      res.json({
        role: "Distributor",
        totalOutlets,
        totalOrders,
        totalInvoices,
        totalDispatches,
        totalReturns,
      });
      return;
    }

    res.status(403).json({ message: "Forbidden" });
  } catch (error) {
    next(error);
  }
};
