const path = require('path');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const { tree } = require('../utils');
const createWebpackConfig = require('./config');

function getPagesList(root) {
    const dir = path.resolve(root, 'src', 'pages');
    const result = [];

    tree(dir, file => {
        result.push(path.relative(dir, file.filepath));
    });
    return result;
}

function createConfig({ root, config, mode }) {
    const pagesList = getPagesList(root);
    const webpackConfig = createWebpackConfig({
        root,
        pagesList,
        szConfig: config,
        mode
    });
    return webpackConfig;
}

module.exports = {
    build({ root, config }) {
        const webpackConfig = createConfig({
            mode: 'build',
            config,
            root
        });

        const compiler = webpack(webpackConfig);
        compiler.run((err, stats) => {
            if (err) {
                console.error(err);
            } else {
                console.log(stats.toString({
                    colors: true
                }));
                if (stats.hasErrors()) {
                    process.exit(1);
                }
            }
        })
    },

    devServer({ root, config }) {
        const webpackConfig = createConfig({
            mode: 'dev',
            root,
            config
        });
        const compiler = webpack(webpackConfig);

        const server = new WebpackDevServer(compiler, config.getWDSOptions());
        const { port, host } = config.devServer;

        server.listen(port, host, err => {
            if (err) {
                console.error(err);
            }
        });
    }
};
