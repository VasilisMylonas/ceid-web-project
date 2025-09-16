import express from "express";
import v1routes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { expressJoiValidations } from "express-joi-validations";
import cookieParser from "cookie-parser";
import { wrapResponse } from "./middleware/responses.js";

const api = express();

api.use(express.json()); // JSON middleware
api.use(cookieParser()); // Parse cookies, for cookie-based login
api.use(wrapResponse()); // Wrap all responses in a standard format
api.use(expressJoiValidations({ throwErrors: true })); // Request validation
api.use("/v1", v1routes);
api.use(errorHandler); // Use error handler middleware

export default api;
