const colors = require('tailwindcss/colors')

module.exports = {
    content: [
        "./src/*.{html,js,css}",
        "./templates/*.ejs",
        "./templates/partials/*.ejs",
        "./templates/errors/*.ejs"
    ],
    theme: {
        extend: {},
        colors: {
            accent: '#4b53eb',
            white: '#ffffff',
            gray: colors.neutral,
            blue: colors.sky,
            purple: colors.purple,
        },
        fontFamily: {
            sans: ['Nunito', 'sans-serif'],
        }
    },
    plugins: [
        {
            tailwindcss: {},
            autoprefixer: {},
        },
    ],
};