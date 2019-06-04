const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const SzPlugin = require('./plugin');
const createCssPipeline = require('./pipelines/css');
const createJsPipeline = require('./pipelines/js');

function createWebpackConfig({ root, pagesList, szConfig, mode }) {
    const src = path.resolve(root, 'src');
    const dist = path.resolve(root, 'dist');

    const entry = {};
    for (let i = 0; i < pagesList.length; i++) {
        const moduleName = pagesList[i].replace(/\.hbs$/, '');
        entry[moduleName] = './pages/' + pagesList[i];
    }

    const plugins = [
        new CleanWebpackPlugin(),
        new CopyPlugin([{
            from: path.resolve(src, 'static'),
            to: szConfig.staticOutputPath(dist)
        }]),
        new MiniCssExtractPlugin({
            filename: szConfig.getAssetPath('[name].[hash].css'),
            chunkFilename: szConfig.getAssetPath('[id].[hash].css'),
        }),
        new SzPlugin()
    ];

    if (szConfig.hot) {
        plugins.push(new webpack.HotModuleReplacementPlugin());
    }

    const isDevServer = mode === 'dev';
    mode = szConfig.getWebpackMode(mode);
    const isProduction = mode !== 'development';

    const result = {
        mode,

        context: src,
        entry,
        output: {
            path: dist,
            filename: szConfig.getAssetPath('[name].[hash].js')
        },

        resolve: {
            alias: {
                '~': src,
                'assets': path.resolve(src, 'assets'),
                'components': path.resolve(src, 'components'),
                ...szConfig.aliases
            }
        },

        module: {
            rules: [
                {
                    test: /\.hbs$/,
                    use: [
                        {
                            loader: path.resolve(__dirname, 'page-loader.js')
                        }
                    ],
                },
                createCssPipeline({ isDevServer, isProduction, mode }) // default for .css files
            ]
        },
        plugins
    };

    const pipelines = szConfig.pipelines;
    if (pipelines.css) {
        for (let i = 0; i < pipelines.css.length; i++) {
            result.module.rules.push(createCssPipeline(
                { isDevServer, isProduction, mode },
                pipelines.css[i]
            ));
        }
    }
    if (pipelines.js) {
        for (let i = 0; i < pipelines.js.length; i++) {
            result.module.rules.push(createJsPipeline(
                { isDevServer, isProduction, mode },
                pipelines.js[i]
            ));
        }
    }

    szConfig.processWebpackConfig(result);
    return result;
}

module.exports = createWebpackConfig;
