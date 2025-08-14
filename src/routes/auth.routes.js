import express from "express";
import { validate } from "../config/validation.js";
import { authenticate } from "../middleware/authentication.js";
import { loginSchema } from "../validators/auth.validators.js";
import { login, logout } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", validate(loginSchema), login);
router.post("/logout", authenticate, logout);

export default router;
