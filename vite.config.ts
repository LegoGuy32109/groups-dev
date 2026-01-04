import { defineConfig } from "vite";
import { fresh } from "@fresh/plugin-vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  server: {
    allowedHosts: [
      "smallgroups--local.legoguy32109.deno.net",
      "groups-dev--local.legoguy32109.deno.net",
    ],
    cors: {
      origin: true,
    },
  },
  plugins: [fresh(), tailwindcss()],
});
