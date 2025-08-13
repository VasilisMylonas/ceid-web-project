import express from "express";
import { validate } from "express-joi-validations";
import { authenticate } from "../middleware/authentication.js";
import { loginBodySchema } from "../schemas.js";
import { login, logout } from "../controllers/auth.js";

const router = express.Router();

router.post("/login", validate({ body: loginBodySchema }), login);
router.post("/logout", authenticate, logout);

export default router;
