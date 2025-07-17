import express from "express";
import userRoutes from "./userRoutes.js";
import authRoutes from "./authRoutes.js";
import topicRoutes from "./topicRoutes.js";
import thesisRoutes from "./thesisRoutes.js";

const router = express.Router();

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/topics", topicRoutes);
router.use("/theses", thesisRoutes);

export default router;
