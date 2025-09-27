import { defineConfig } from "vite";
import { fresh } from "@fresh/plugin-vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  server: {
    cors: {
      origin: true,
    },
  },
  plugins: [fresh(), tailwindcss()],
});
