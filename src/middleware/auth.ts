import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

export const authenticate = (
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
    next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const auth = authenticate;
