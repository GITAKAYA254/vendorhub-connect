import { Router } from "express";
import {
  register,
  login,
  logout,
  currentUser,
} from "../controllers/authController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { registerSchema, loginSchema } from "../validators/authSchemas.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.post("/logout", logout);
router.get("/user", authenticate, currentUser);

export default router;
