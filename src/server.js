import express from "express";
import api from "./api.js";
import adminPanel from "./admin-panel.js";
import pages from "./pages.js";
import db from "./models/index.js";
import seedDatabase from "./seeders/index.js";
import morgan from "morgan";
import path from "path";
import process from "process";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const app = express();

// EJS templates
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(morgan("dev")); // Logging middleware
app.use("/api", api);
app.use("/admin", adminPanel);
app.use("/", pages);

if (process.env.NODE_ENV === "development") {
  // Serve static files. In production, these will be served by Nginx
  app.use(express.static("public"));
}

try {
  await db.sequelize.authenticate();
  // TODO
  // const userCount = await db.User.count();
  // if (userCount === 0) {
  // await seedDatabase();
  // }
  console.log("Database connected successfully");
} catch (error) {
  console.error("Database error:", error);
  process.exit(1);
}

// Start server
const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

export default server;
