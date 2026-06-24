import { NextFunction, Request, Response } from "express";

export const authorize =
  (...roles: Array<"SuperAdmin" | "Distributor" | "outlet">) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };

export const role = authorize;
