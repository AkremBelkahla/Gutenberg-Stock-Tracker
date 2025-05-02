const defaultConfig = require('@wordpress/scripts/config/webpack.config');

module.exports = {
    ...defaultConfig,
    entry: {
        index: './src/index.js',
        frontend: './src/frontend.js',
        'currency-index': './src/currency-index.js',
        'currency-frontend': './src/currency-frontend.js',
    },
};
