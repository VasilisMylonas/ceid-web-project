import express from "express";
import v1routes from "./routes/index.js";

const api = express.Router();

api.use("/v1", v1routes);

export default api;
