import express from "express";
import routes from "./routes.js";

import dotenv from "dotenv";
import { setupDatabase } from "./setup.js";

dotenv.config(); // Load .env

// Express.js app setup
export const app = express();
app.use(express.json());
app.use("/api", routes);

await setupDatabase();

export const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
