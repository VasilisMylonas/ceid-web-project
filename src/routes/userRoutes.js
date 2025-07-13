import express from "express";
import { getUserInfo } from "../controllers/userController.js";
import auth from "../middleware/auth.js";

const router = express.Router();
router.get("/me", auth, getUserInfo);
export default router;
