import express from "express";
import { requireAuth } from "../middleware/authentication.js";
import { validate } from "../middleware/validation.js";
import resourceValidators from "../validators/resource.validators.js";
import ResourceController from "../controllers/resource.controller.js";

const router = express.Router();
router.use(requireAuth);

router.get("/:id", validate(resourceValidators.get), ResourceController.get);
router.put("/:id", validate(resourceValidators.put), ResourceController.put);
router.delete(
  "/:id",
  validate(resourceValidators.delete),
  ResourceController.delete
);

export default router;
