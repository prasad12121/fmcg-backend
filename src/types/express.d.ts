import "express";

declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      role: "SuperAdmin" | "Distributor" | "outlet";
      email: string;
      distributor_id?: string | null;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
