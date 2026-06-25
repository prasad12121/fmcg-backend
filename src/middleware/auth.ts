import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import Distributor from "../models/distributor.model";
import Outlet from "../models/outlet.omodel";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }

    req.user = jwt.verify(token, secret) as Express.UserPayload;

    // ── Mid-session status check: Distributor ────────────────────────────────
    // Runs on every authenticated request so a deactivation takes effect
    // immediately without waiting for the JWT to expire.
    if (req.user.role === "Distributor" && req.user.distributor_id) {
      const distributor = await Distributor.findById(req.user.distributor_id)
        .select("status")
        .lean();
      if (!distributor || (distributor as any).status !== "active") {
        return res.status(401).json({
          message: "Account deactivated by administrator.",
          code: "ACCOUNT_DEACTIVATED",
        });
      }
    }

    // ── Mid-session status check: Outlet ─────────────────────────────────────
    if (req.user.role === "outlet" && req.user.outlet_id) {
      const outlet = await Outlet.findById(req.user.outlet_id)
        .select("status")
        .lean();
      if (!outlet || (outlet as any).status !== "active") {
        return res.status(401).json({
          message: "Account deactivated by administrator.",
          code: "ACCOUNT_DEACTIVATED",
        });
      }
    }

    next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const auth = authenticate;
