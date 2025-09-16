import express from "express";
import v1routes from "./routes/index.js";

const api = express();

api.use("/v1", v1routes);

export default api;
