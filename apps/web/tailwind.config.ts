import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        command: {
          bg: "var(--command-bg)",
          surface: "var(--command-surface)",
          border: "var(--command-border)",
          card: "var(--command-card)",
          hover: "var(--command-hover)",
          accent: "#0284C7",
          cyan: "var(--command-cyan)",
          green: "#10B981",
          amber: "#F59E0B",
          red: "#EF4444",
          muted: "var(--command-muted)",
          gold: "#FBBF24",
          text: "var(--command-text)",
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
