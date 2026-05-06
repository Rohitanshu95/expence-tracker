/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#F8FAFC", // Slate 50
          secondary: "#FFFFFF",
          card: "#FFFFFF",
        },
        primary: {
          DEFAULT: "#4F46E5", // Indigo 600
          hover: "#4338CA",
        },
        success: "#10B981", // Emerald 500
        danger: "#EF4444",  // Red 500
        text: {
          primary: "#0F172A", // Slate 900
          secondary: "#475569", // Slate 600
          muted: "#94A3B8",    // Slate 400
        },
        border: "#E2E8F0", // Slate 200
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
}
