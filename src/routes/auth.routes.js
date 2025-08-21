import express from "express";
import { validate } from "../config/validation.js";
import { requireAuth } from "../middleware/authentication.js";
import { loginValidator } from "../validators/auth.validators.js";
import { login, logout, refresh } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", validate(loginValidator), login);
router.post("/logout", requireAuth, logout);
router.post("/refresh", requireAuth, refresh);

export default router;
