import express from "express";
import userRoutes from "./users.js";
import authRoutes from "./auth.js";
import topicRoutes from "./topics.js";

const router = express.Router();

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/topics", topicRoutes);

export default router;
