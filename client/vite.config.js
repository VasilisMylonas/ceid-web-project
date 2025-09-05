import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  publicDir: path.resolve(__dirname, "public"),
  root: path.resolve(__dirname, "src"),
  server: {
    host: "0.0.0.0",
  },
});
