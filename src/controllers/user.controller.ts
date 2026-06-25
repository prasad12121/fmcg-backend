import { Request, Response } from "express";
import User from "../models/user.model";
import { generateOtp, generateOtpExpiry } from "../utils/otp";
import { sendOtpEmail } from "../utils/mailer";

const getPublicUser = (user: any) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  distributor_id: user.distributor_id ?? null,
  outlet_id: user.outlet_id ?? null,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const getCurrentUser = async (req: Request, res: Response) => {
  const user = await User.findById(req.user?.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({ user: getPublicUser(user) });
};

export const updateCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select(
      "+authCode +authCodeExpiry"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, email } = req.body;
    const previousEmail = user.email;
    const normalizedEmail = email?.toLowerCase().trim();

    if (normalizedEmail && normalizedEmail !== user.email) {
      const emailInUse = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: user._id },
      });

      if (emailInUse) {
        return res.status(409).json({ message: "Email is already in use" });
      }

      user.email = normalizedEmail;
      user.isVerified = false;
      user.authCode = generateOtp();
      user.authCodeExpiry = generateOtpExpiry();
    }

    if (name) {
      user.name = name;
    }

    await user.save();

    if (normalizedEmail && normalizedEmail !== previousEmail && user.authCode) {
      await sendOtpEmail(
        String(user.email),
        String(user.name),
        String(user.authCode)
      );
    }

    return res.json({
      message:
        normalizedEmail && normalizedEmail !== previousEmail
          ? "Profile updated. Please verify your new email address."
          : "Profile updated successfully",
      user: getPublicUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Profile update failed",
    });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const sortBy = String(req.query.sortBy || "createdAt");
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
  const role = req.query.role ? String(req.query.role) : undefined;
  const search = req.query.search ? String(req.query.search).trim() : "";

  const filter: Record<string, unknown> = {};

  if (role && ["Distributor", "outlet"].includes(role)) {
    filter.role = role;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const [users, total, totalUsers, verifiedUsers, distributorCount, outletCount] =
    await Promise.all([
      User.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(filter),
      User.countDocuments(),
      User.countDocuments({ isVerified: true }),
      User.countDocuments({ role: "Distributor" }),
      User.countDocuments({ role: "outlet" }),
    ]);

  return res.json({
    data: users.map(getPublicUser),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      stats: {
        totalUsers,
        verifiedUsers,
        pendingVerification: totalUsers - verifiedUsers,
        distributors: distributorCount,
        outlets: outletCount,
      },
    },
  });
};

export const getUserById = async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({ user: getPublicUser(user) });
};

export const updateUserRole = async (req: Request, res: Response) => {
  const { role } = req.body;

  if (!["Distributor", "outlet"].includes(role)) {
    return res.status(400).json({ message: "Invalid role selected" });
  }

  if (req.user?.id === req.params.id && role !== "Distributor") {
    return res
      .status(400)
      .json({ message: "Distributor cannot demote their own account" });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({
    message: "User role updated successfully",
    user: getPublicUser(user),
  });
};

export const deleteUser = async (req: Request, res: Response) => {
  if (req.user?.id === req.params.id) {
    return res
      .status(400)
      .json({ message: "Distributor cannot delete their own account" });
  }

  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({ message: "User deleted successfully" });
};
