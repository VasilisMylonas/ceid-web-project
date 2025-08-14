import express from "express";
import { validate } from "../config/validation.js";
import { authenticate } from "../middleware/authentication.js";
import { loginSchema } from "../schemas.js";
import { login, logout } from "../controllers/auth.js";

const router = express.Router();

router.post("/login", validate(loginSchema), login);
router.post("/logout", authenticate, logout);

export default router;
