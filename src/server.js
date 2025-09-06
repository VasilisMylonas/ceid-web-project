import api from "./api.js";
import db from "./models/index.js";
import express from "express";
import seedDatabase from "./seeders/index.js";
import adminPanel from "./admin-panel.js";
import morgan from "morgan";
import path from "path";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const app = express();
app.use(morgan("dev")); // Logging middleware

// API
app.use("/api", api);

// Admin panel
app.use("/admin", adminPanel);

// EJS templates
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/login", (req, res) => {
  res.render("login", {});
});

if (process.env.NODE_ENV === "development") {
  // Serve static files
  app.use(express.static("public"));
}

// app.get("/", (req, res) => {
// TODO
// if (!req.cookies || !req.cookies.user) {
// return res.redirect("/login");
// }
// });

try {
  await db.sequelize.authenticate();
  // await seedDatabase();
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
