module.exports = function createJsPipeline(
    { isDevServer, isProduction },
    { test = /\.css$/, use = [], ...rest } = {}
) {
    return {
        test,
        use,
        ...rest
    };
};
