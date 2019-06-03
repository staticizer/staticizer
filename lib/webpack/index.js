const path = require('path');
const webpack = require('webpack');
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

module.exports = {
    build({ root, config }) {
        const pagesList = getPagesList(root);
        const webpackConfig = createWebpackConfig({
            root,
            pagesList,
            szConfig: config,
            mode: 'build'
        });

        // console.log(webpackConfig);

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
    }
};
