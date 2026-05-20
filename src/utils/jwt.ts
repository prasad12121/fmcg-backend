import jwt from "jsonwebtoken";
import { UserDocument } from "../models/user.model";

export const signAuthToken = (user: UserDocument) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
    },
    secret,
    {
      expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as any,
    }
  );
};
