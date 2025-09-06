import api from "./api/index.js";
import db from "./api/models/index.js";
import express from "express";
import seedDatabase from "./api/seeders/index.js";
import adminPanel from "./admin-panel.js";
import { createProxyMiddleware } from "http-proxy-middleware";
import morgan from "morgan";

const app = express();
app.use(morgan("dev")); // Logging middleware
app.use("/api", api);
app.use("/admin", adminPanel);

if (process.env.NODE_ENV === "development") {
  // Serve static files
  app.use(express.static("public"));

  // Proxy assets to vite server
  // app.use(
  //   "/assets",
  //   createProxyMiddleware({
  //     target: "http://localhost:5173", // vite url
  //     changeOrigin: true, // change Host header
  //     ws: true, // (web sockets) hot reload support
  //   })
  // );
}

app.set("view engine", "ejs");
app.set("views", "views");

// app.get("/", (req, res) => {
// TODO
// if (!req.cookies || !req.cookies.user) {
// return res.redirect("/login");
// }
// });

app.get("/login", (req, res) => {
  res.render("login", {});
});

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
