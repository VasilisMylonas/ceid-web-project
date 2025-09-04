import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  root: path.resolve(__dirname, "src"),
  server: {
    host: "0.0.0.0",
  },
});
