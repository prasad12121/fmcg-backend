import { Router } from "express";
import { body } from "express-validator";
import {
  login,
  register,
  resendCode,
  verifyCode,
} from "../controllers/auth.controller";
import { asyncHandler } from "../middleware/asyncHandler";
import { handleValidation } from "../middleware/validate";

const router = Router();

router.post(
  "/register",
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .isIn(["SuperAdmin", "Distributor", "outlet"])
    .withMessage("Role must be SuperAdmin, Distributor, or outlet"),
  handleValidation,
  asyncHandler(register)
);

router.post(
  "/login",
  // Accept `identifier` (email or username) OR legacy `email` field.
  // At least one must be a non-empty string of 3+ chars.
  body().custom((_, { req }) => {
    const id = String(req.body?.identifier || req.body?.email || "").trim();
    if (!id || id.length < 3) {
      throw new Error("Email or username is required (min 3 characters)");
    }
    return true;
  }),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidation,
  asyncHandler(login)
);

router.post(
  "/verify-code",
  body("email").isEmail().withMessage("Valid email is required"),
  body("authCode")
    .isLength({ min: 6, max: 6 })
    .withMessage("Verification code must be 6 digits"),
  handleValidation,
  asyncHandler(verifyCode)
);

router.post(
  "/resend-code",
  body("email").isEmail().withMessage("Valid email is required"),
  handleValidation,
  asyncHandler(resendCode)
);

export default router;
