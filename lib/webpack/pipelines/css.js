const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = function createCssPipeline(
    { isDevServer, isProduction },
    { test = /\.css$/, use = [], ...rest } = {}
) {
    return {
        test,
        use: [
            {
                loader: MiniCssExtractPlugin.loader,
                options: {
                    hmr: isDevServer,
                    reloadAll: false
                },
            },
            { loader: 'css-loader' },
            ...use
        ],
        ...rest
    }
};
