/**
 * Outlet Portal Controller
 *
 * Dedicated endpoints for the Outlet role:
 *   GET /outlet-portal/my-info  — outlet + distributor info derived from JWT
 *   GET /outlet-portal/catalog  — variants with price + available stock for the outlet's distributor
 */

import mongoose from "mongoose";
import { Request, Response } from "express";
import Outlet from "../models/outlet.omodel";
import Distributor from "../models/distributor.model";
import Variant from "../models/variant.model";

// ── my-info ──────────────────────────────────────────────────────────────────
export const getMyInfo = async (req: Request, res: Response) => {
  try {
    const outletId = req.user?.outlet_id;
    if (!outletId) {
      return res.status(403).json({ message: "Outlet ID not found in token." });
    }

    const outlet = await Outlet.findById(outletId)
      .select("name email outlet_number address mobile_number1 distributor_id status beat_id")
      .lean();

    if (!outlet) {
      return res.status(404).json({ message: "Outlet not found." });
    }

    let distributor = null;
    const distributorId = (outlet as any).distributor_id;

    if (!distributorId) {
      // The outlet document has no distributor_id — likely created without one.
      console.error(
        `[getMyInfo] Outlet ${outletId} has no distributor_id in DB. ` +
        `A SuperAdmin must edit this outlet and assign a distributor.`
      );
    } else {
      distributor = await Distributor.findById(distributorId)
        .select("name email mobile_number1 address status")
        .lean();

      if (!distributor) {
        // distributor_id exists on the outlet but the Distributor document is missing.
        console.error(
          `[getMyInfo] Outlet ${outletId} references distributor_id=${distributorId} ` +
          `but no matching Distributor document was found. The distributor may have been ` +
          `deleted or the reference is stale.`
        );
      }
    }

    return res.json({
      outlet,
      distributor,
      has_distributor: !!distributor,
      // Surface the raw distributor_id so the frontend/admin can diagnose mismatches
      distributor_id_on_outlet: distributorId ? String(distributorId) : null,
    });
  } catch (error) {
    console.error("getMyInfo error:", error);
    return res.status(500).json({ message: "Failed to load outlet info." });
  }
};

// ── catalog ───────────────────────────────────────────────────────────────────
// Returns all active variants for the outlet's distributor, with
// retailer_price (from productprices) and available_stock (from stocks).
export const getCatalog = async (req: Request, res: Response) => {
  try {
    const outletId = req.user?.outlet_id;
    if (!outletId) {
      return res.status(403).json({ message: "Outlet ID not found in token." });
    }

    // Resolve distributor from outlet record
    const outlet = await Outlet.findById(outletId).select("distributor_id").lean();
    if (!outlet) {
      return res.status(404).json({ message: "Outlet not found." });
    }

    const distributorId = (outlet as any).distributor_id;
    if (!distributorId) {
      return res.status(400).json({
        message: "No distributor is assigned to your outlet. Please contact your distributor.",
      });
    }

    const distObjId = new mongoose.Types.ObjectId(String(distributorId));

    // Single aggregation: variants → prices → stocks
    const catalog = await Variant.aggregate([
      // Only active variants belonging to this distributor
      {
        $match: {
          distributor_id: distObjId,
          status: "active",
        },
      },
      // Join product name
      {
        $lookup: {
          from: "products",
          localField: "product_id",
          foreignField: "_id",
          as: "productDoc",
        },
      },
      { $unwind: { path: "$productDoc", preserveNullAndEmptyArrays: true } },
      // Join unit name
      {
        $lookup: {
          from: "units",
          localField: "unit_id",
          foreignField: "_id",
          as: "unitDoc",
        },
      },
      { $unwind: { path: "$unitDoc", preserveNullAndEmptyArrays: true } },
      // Join pricing
      {
        $lookup: {
          from: "productprices",
          localField: "_id",
          foreignField: "variant_id",
          as: "priceDoc",
        },
      },
      { $unwind: { path: "$priceDoc", preserveNullAndEmptyArrays: true } },
      // Join stock filtered by BOTH distributor AND variant
      {
        $lookup: {
          from: "stocks",
          let: { vid: "$_id", did: "$distributor_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$variant_id", "$$vid"] },
                    { $eq: ["$distributor_id", "$$did"] },
                  ],
                },
              },
            },
          ],
          as: "stockDoc",
        },
      },
      { $unwind: { path: "$stockDoc", preserveNullAndEmptyArrays: true } },
      // Project only what the outlet UI needs
      {
        $project: {
          _id: 1,
          name: 1,
          sku_code: 1,
          pack_size: 1,
          weight: 1,
          gst_rate: 1,
          uom_levels: 1,
          distributor_id: 1,
          product_name: { $ifNull: ["$productDoc.name", ""] },
          unit_name:    { $ifNull: ["$unitDoc.name", ""] },
          mrp:              { $ifNull: ["$priceDoc.mrp", 0] },
          retailer_price:   { $ifNull: ["$priceDoc.retailer_price", 0] },
          distributor_price:{ $ifNull: ["$priceDoc.distributor_price", 0] },
          available_stock:  { $ifNull: ["$stockDoc.quantity", 0] },
        },
      },
      { $sort: { name: 1 } },
    ]);

    return res.json(catalog);
  } catch (error) {
    console.error("getCatalog error:", error);
    return res.status(500).json({ message: "Failed to load product catalog." });
  }
};
