import express from "express";
import userRoutes from "./user.js";
import authRoutes from "./auth.js";
import topicRoutes from "./topic.js";
import thesisRoutes from "./thesis.js";

const router = express.Router();

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/topics", topicRoutes);
router.use("/theses", thesisRoutes);

export default router;
