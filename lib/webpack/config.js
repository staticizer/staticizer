const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const SzPlugin = require('./plugin');

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
            filename: 'assets/[name].[hash].css',
            chunkFilename: 'assets/[id].[hash].css',
        }),
        new SzPlugin()
    ];

    if (szConfig.hot) {
        plugins.push(new webpack.HotModuleReplacementPlugin());
    }

    const result = {
        context: src,
        entry,
        output: {
            path: dist,
            filename: 'assets/[name].[hash].js'
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
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: ['babel-loader'],
                },
                {
                    test: /\.hbs$/,
                    use: [
                        {
                            loader: path.resolve(__dirname, 'page-loader.js')
                        }
                    ]
                },
                {
                    test: /\.styl$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                                hmr: process.env.NODE_ENV === 'development',
                                reloadAll: true
                            },
                        },
                        { loader: 'css-loader' },
                        { loader: 'stylus-loader' }
                    ]
                }
            ]
        },
        plugins
    };

    szConfig.processWebpackConfig(result);
    return result;
}

module.exports = createWebpackConfig;
