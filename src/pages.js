import express from "express";
import expressEjsLayouts from "express-ejs-layouts";

import cookieParser from "cookie-parser";
import rolePages from "./role.pages.js";
import authPages from "./auth.pages.js";
import path from "path";
import { setPage } from "./middleware/pages.js";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const pages = express();

// EJS templates
pages.set("view engine", "ejs");
pages.set("views", path.join(__dirname, "views"));

pages.use(expressEjsLayouts); // EJS layouts
pages.use(express.urlencoded({ extended: true })); // Parse form data
pages.use(cookieParser()); // Parse cookies
pages.use(setPage());
pages.use("/", authPages);
pages.use("/", rolePages);
