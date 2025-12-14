/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0f172a", // Slate 900
                surface: "#1f2937", // Gray 800
                primary: "#6366f1", // Indigo 500
                secondary: "#8b5cf6", // Violet 500
                accent: "#10b981", // Emerald 500
                danger: "#ef4444", // Red 500
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'bounce-slow': 'bounce 3s infinite',
                'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            }
        },
    },
    plugins: [],
}
