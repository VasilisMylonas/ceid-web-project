import express from "express";
import { authenticate } from "../middleware/authentication.js";
import { manageResource } from "../middleware/specific.js";
import { validate } from "../config/validation.js";
import {
  deleteResourceValidator,
  getResourceValidator,
  patchResourceValidator,
} from "../validators/resource.validators.js";
import {
  getResource,
  patchResource,
  deleteResource,
} from "../controllers/resource.controller.js";

const router = express.Router();

router.get(
  "/:id",
  authenticate,
  validate(getResourceValidator),
  manageResource,
  getResource
);
router.patch(
  "/:id",
  authenticate,
  validate(patchResourceValidator),
  manageResource,
  patchResource
);
router.delete(
  "/:id",
  authenticate,
  validate(deleteResourceValidator),
  manageResource,
  deleteResource
);

export default router;
