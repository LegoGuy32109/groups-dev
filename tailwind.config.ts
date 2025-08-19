import { type Config } from "tailwindcss";

export default {
  mode: "jit",
  content: [
    "{routes,islands,components}/**/*.{ts,tsx,js,jsx}",
  ],
} satisfies Config;
