import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  deleteUser,
  getCurrentUser,
  getUserById,
  getUsers,
  updateCurrentUser,
  updateUserRole,
} from "../controllers/user.controller";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/role";
import { handleValidation } from "../middleware/validate";

const router = Router();

router.get("/me", authenticate, getCurrentUser);

router.put(
  "/me",
  [
    authenticate,
    body("name").optional().trim().notEmpty().withMessage("Name is required"),
    body("email")
      .optional()
      .isEmail()
      .withMessage("Valid email is required"),
    handleValidation,
  ],
  updateCurrentUser
);

router.get(
  "/",
  [
    authenticate,
    authorize("Distributor"),
    query("page").optional().isInt({ min: 1 }).withMessage("Invalid page"),
    query("limit").optional().isInt({ min: 1 }).withMessage("Invalid limit"),
    handleValidation,
  ],
  getUsers
);

router.get(
  "/:id",
  [
    authenticate,
    authorize("Distributor"),
    param("id").isMongoId().withMessage("Invalid user id"),
    handleValidation,
  ],
  getUserById
);

router.patch(
  "/:id/role",
  [
    authenticate,
    authorize("Distributor"),
    param("id").isMongoId().withMessage("Invalid user id"),
    body("role")
      .isIn(["Distributor", "outlet"])
      .withMessage("Role must be Distributor or outlet"),
    handleValidation,
  ],
  updateUserRole
);

router.delete(
  "/:id",
  [
    authenticate,
    authorize("Distributor"),
    param("id").isMongoId().withMessage("Invalid user id"),
    handleValidation,
  ],
  deleteUser
);

export default router;
