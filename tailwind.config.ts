/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Indigo Night — the "always-there, no-signal-needed" base.
        indigo: {
          night: "#1B1F3B",
          deep: "#11142A",
        },
        // Marigold — the signature accent, the color of the connectivity dial.
        marigold: {
          DEFAULT: "#F2A93B",
          dim: "#C8862A",
        },
        // Per-persona accent colors.
        persona: {
          farmer: "#4F7942", // banana leaf green
          asha: "#C75D3D", // terracotta clay
          teacher: "#F2A93B", // marigold
        },
        slate: {
          soft: "#6B7280",
        },
      },
      fontFamily: {
        display: ["Fraunces", "Cambria", "serif"],
        body: [
          "IBM Plex Sans",
          "IBM Plex Sans Devanagari",
          "Calibri",
          "sans-serif",
        ],
        mono: ["IBM Plex Mono", "Courier New", "monospace"],
      },
      borderRadius: {
        dial: "50%",
      },
    },
  },
  plugins: [],
};
