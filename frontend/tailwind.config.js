/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                agro: {
                    dark: '#2d4a1e',
                    medium: '#4a7c3f',
                    olive: '#6b8c3e',
                    light: '#8fae5a',
                    cream: '#f5f0e0',
                    yellow: '#d4a843',
                    gray: '#6b6560',
                    dark2: '#3d3530',
                }
            }
        }
    },
    plugins: [],
}