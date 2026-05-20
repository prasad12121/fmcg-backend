import "express";

declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      role: "Distributor" | "outlet";
      email: string;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
