import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  publicDir: path.resolve(__dirname, "public"),
  root: "./views",
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
});
