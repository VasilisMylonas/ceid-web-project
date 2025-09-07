import api from "./api.js";
import db from "./models/index.js";
import express from "express";
import seedDatabase from "./seeders/index.js";
import adminPanel from "./admin-panel.js";
import morgan from "morgan";
import path from "path";
import expressEjsLayouts from "express-ejs-layouts";
import AuthService from "./services/auth.service.js";
import cookieParser from "cookie-parser";
import { UserRole } from "./constants.js";
import { extractTokenFromRequest } from "./util.js";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const app = express();
app.use(morgan("dev")); // Logging middleware
app.use(expressEjsLayouts); // EJS layouts
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(cookieParser()); // Parse cookies

// API
app.use("/api", api);

// Admin panel
app.use("/admin", adminPanel);

// EJS templates
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

function getHomeRedirectPath(role) {
  switch (role) {
    case UserRole.PROFESSOR:
      return "/professor";
    case UserRole.STUDENT:
      return "/student";
    case UserRole.SECRETARY:
      return "/secretary";
    default:
      return "/login";
  }
}

app.get("/login", async (req, res) => {
  const token = extractTokenFromRequest(req);
  const user = await AuthService.verifyToken(token);

  // User already logged in
  if (user) {
    return res.redirect(getHomeRedirectPath(user.role));
  }

  res.render("pages/login", { title: "Σύνδεση", error: null });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const token = await AuthService.login(username, password);

  if (!token) {
    return res.render("pages/login", {
      title: "Σύνδεση",
      error: "Σφάλμα σύνδεσης. Δοκιμάστε ξανά.",
    });
  }

  // Set HTTP-only cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 1000, // 1 hour (3600 seconds)
  });

  const user = await AuthService.verifyToken(token);
  res.redirect(getHomeRedirectPath(user.role));
});

if (process.env.NODE_ENV === "development") {
  // Serve static files. In production, these will be served by Nginx
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
