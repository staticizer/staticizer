const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
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
        new MiniCssExtractPlugin({
            filename: szConfig.getAssetPath('[name].[hash].css'),
            chunkFilename: szConfig.getAssetPath('[id].[hash].css'),
        }),
        new SzPlugin()
    ];

    if (szConfig.devServer.hot) {
        plugins.push(new webpack.HotModuleReplacementPlugin());
    }

    const isDevServer = mode === 'dev';
    mode = szConfig.getWebpackMode(mode);
    const isProduction = mode !== 'development';

    if (!isDevServer) {
        plugins.push(new CopyPlugin([{
            from: szConfig.getSrcPath('static'),
            to: szConfig.staticOutputPath()
        }]));
    }

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
                'assets': szConfig.getSrcPath('assets'),
                'components': szConfig.getSrcPath('components'),
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

    if (szConfig.shouldMinify()) {
        const minimizer = [];
        if (szConfig.shouldMinify('js')) {
            minimizer.push(new TerserJSPlugin(szConfig.minificationSettings('js')));
        }
        if (szConfig.shouldMinify('css')) {
            minimizer.push(new OptimizeCSSAssetsPlugin(szConfig.minificationSettings('css')));
        }

        result.optimization = { minimizer };
    }

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
