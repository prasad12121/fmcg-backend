import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import User from "../models/user.model";
import Distributor from "../models/distributor.model";
import Outlet from "../models/outlet.omodel";
import { signAuthToken } from "../utils/jwt";
import { sendOtpEmail } from "../utils/mailer";
import { generateOtp, generateOtpExpiry } from "../utils/otp";

const sanitizeUser = (user: any) => ({
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

const getComparableCode = (value: unknown) =>
  typeof value === "string" ? value : "";

const getComparableDate = (value: unknown) =>
  value instanceof Date ? value : null;

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail }).select(
      "+passwordHash +authCode +authCodeExpiry"
    );
    const passwordHash = await bcrypt.hash(password, 12);
    const authCode = generateOtp();
    const authCodeExpiry = generateOtpExpiry();

    if (existingUser?.isVerified) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists" });
    }

    const user = existingUser
      ? await User.findByIdAndUpdate(
          existingUser._id,
          {
            name,
            email: normalizedEmail,
            passwordHash,
            role,
            authCode,
            authCodeExpiry,
            isVerified: false,
          },
          { returnDocument: "after", runValidators: true }
        )
      : await User.create({
          name,
          email: normalizedEmail,
          passwordHash,
          role,
          authCode,
          authCodeExpiry,
          isVerified: false,
        });

    if (!user) {
      throw new Error("Unable to create user");
    }

    await sendOtpEmail(normalizedEmail, name, authCode);

    const devHint =
      process.env.NODE_ENV !== "production"
        ? " Check the backend console for the verification code."
        : "";

    return res.status(existingUser ? 200 : 201).json({
      message: `Registration successful. Verification code sent to email.${devHint}`,
      email: normalizedEmail,
      expiresInMinutes: 15,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Registration failed:", error);

    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    return res.status(500).json({
      message: error instanceof Error ? error.message : "Registration failed",
    });
  }
};

export const verifyCode = async (req: Request, res: Response) => {
  try {
    const { email, authCode } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+authCode +authCodeExpiry"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Account is already verified" });
    }

    if (
      !getComparableCode(user.authCode) ||
      getComparableCode(user.authCode) !== authCode ||
      !getComparableDate(user.authCodeExpiry) ||
      getComparableDate(user.authCodeExpiry)!.getTime() < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    user.isVerified = true;
    user.authCode = null;
    user.authCodeExpiry = null;
    await user.save();

    const token = signAuthToken(user as any);

    return res.json({
      message: "Account verified successfully",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Verification failed",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    // Accept `identifier` (email or username) or legacy `email` field
    const identifier = String(req.body.identifier || req.body.email || "").trim();
    const password   = String(req.body.password || "");

    if (!identifier || !password) {
      return res.status(400).json({ message: "Email/username and password are required" });
    }

    const normalizedIdentifier = identifier.toLowerCase();

    console.log(`[Login] identifier="${normalizedIdentifier}"`);

    // ── Step 1: Direct User lookup by email ──────────────────────────────────
    let user = await User.findOne({ email: normalizedIdentifier }).select("+passwordHash");

    // ── Step 2: Username / email fallback through Outlet collection ───────────
    // Handles: outlet has username that isn't email-format, or a User record
    // was created with a different email casing than what's stored on the Outlet.
    if (!user) {
      console.log(`[Login] No User by email — trying outlet username/email lookup`);
      const outletDoc = await Outlet.findOne({
        $or: [
          { username: identifier },
          { username: normalizedIdentifier },
          { email: normalizedIdentifier },
        ],
      }).select("_id email username").lean();

      if (outletDoc) {
        console.log(`[Login] Outlet found (id=${(outletDoc as any)._id}) — looking up linked User`);
        user = await User.findOne({ outlet_id: (outletDoc as any)._id }).select("+passwordHash");
        if (!user) {
          console.error(
            `[Login] Outlet ${(outletDoc as any)._id} has no linked User record. ` +
            `Restart the backend to trigger migrateOutletUsers(), or recreate the outlet.`
          );
        }
      }
    }

    if (!user) {
      console.log(`[Login] Authentication failed — no user found for identifier="${normalizedIdentifier}"`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log(`[Login] User found: id=${user._id} email=${user.email} role=${user.role}`);

    const passwordMatches = await bcrypt.compare(password, String(user.passwordHash));
    console.log(`[Login] Password match: ${passwordMatches}`);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your account before logging in",
        code: "ACCOUNT_NOT_VERIFIED",
      });
    }

    // ── Status check: block inactive Distributors ────────────────────────────
    if (user.role === "Distributor" && (user as any).distributor_id) {
      const distributor = await Distributor.findById(
        (user as any).distributor_id
      ).select("status").lean();
      if (!distributor || (distributor as any).status !== "active") {
        return res.status(403).json({
          message: "Your account has been deactivated. Please contact the administrator.",
          code: "ACCOUNT_DEACTIVATED",
        });
      }
    }

    // ── Status check: block inactive Outlets ─────────────────────────────────
    if (user.role === "outlet" && (user as any).outlet_id) {
      const outlet = await Outlet.findById(
        (user as any).outlet_id
      ).select("status").lean();
      if (!outlet || (outlet as any).status !== "active") {
        return res.status(403).json({
          message: "Your account has been deactivated. Please contact the administrator.",
          code: "ACCOUNT_DEACTIVATED",
        });
      }
    }

    const token = signAuthToken(user as any);

    return res.json({
      message: "Login successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("[Login] Unexpected error:", error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Login failed",
    });
  }
};

export const resendCode = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+authCode +authCodeExpiry"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Account is already verified" });
    }

    const authCode = generateOtp();
    const authCodeExpiry = generateOtpExpiry();

    user.authCode = authCode;
    user.authCodeExpiry = authCodeExpiry;
    await user.save();

    await sendOtpEmail(String(user.email), String(user.name), authCode);

    return res.json({
      message: "A new verification code has been sent",
      email: user.email,
      expiresInMinutes: 15,
    });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Unable to resend code",
    });
  }
};
