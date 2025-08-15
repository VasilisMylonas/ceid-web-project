import express from "express";
import { validate } from "../config/validation.js";
import { authenticate } from "../middleware/authentication.js";
import { loginValidator } from "../validators/auth.validators.js";
import { login, logout, refresh } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", validate(loginValidator), login);
router.post("/logout", authenticate, logout);
router.post("/refresh", authenticate, refresh); // TODO

export default router;
