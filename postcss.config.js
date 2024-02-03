module.exports = {
    plugins: {
        tailwindcss: {},
        autoprefixer: {},
        'postcss-preset-env': {
            browsers: 'chrome >= 50', // configure a compatible browser version
        },
    },
};