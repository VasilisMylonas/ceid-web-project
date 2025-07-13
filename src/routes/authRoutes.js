import express from "express";
import { login, logout } from "../controllers/authController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/login", login);
router.post("/logout", auth, logout);

export default router;
