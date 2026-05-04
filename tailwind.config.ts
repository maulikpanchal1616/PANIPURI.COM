import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          saffron: "#FF6B2B",
          deep: "#1A0A00",
          cream: "#FFF8F0",
          gold: "#F59E0B",
        },
      },
    },
  },
  plugins: [],
};
export default config;
