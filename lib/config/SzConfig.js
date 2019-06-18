const path = require('path');

class SzConfig {
    constructor(root, userOverrides = {}) {
        this.output = Object.assign({
            assetsPrefix: 'assets',
            staticPrefix: false,
            minify: false
        }, userOverrides.output|| {});

        this.layout = Object.assign({
            default: 'default'
        }, userOverrides.layout || {});

        const userData = userOverrides.data || {};
        this.data = {
            common: userData.common || {},
            pages: userData.pages || {}
        };

        this.devServer = Object.assign({
            hot: true,
            open: false,
            overlay: true,
            port: 8080,
            host: 'localhost',
            '404': '/404.html'
        }, userOverrides.devServer || {});

        this.pipelines = userOverrides.pipelines || {};
        for (let name in this.pipelines) {
            if (!Array.isArray(this.pipelines[name])) {
                throw new TypeError(`staticizer config: pipelines.${name} must be an array`);
            }
        }

        this.aliases = userOverrides.aliases || {};
        this.mode = userOverrides.mode;

        this.directories = {
            root,
            src: path.resolve(root, 'src'),
            dist: path.resolve(root, 'dist')
        };
    }

    // output paths management
    staticOutputPath() {
        if (!this.output.staticPrefix) return this.directories.dist;
        return path.join(this.directories.dist, this.output.staticPrefix);
    }
    getAssetPath(assetName) {
        if (!this.output.assetsPrefix) return assetName;
        return path.join(this.output.assetsPrefix, assetName);
    }
    getSrcPath(what) {
        return path.resolve(this.directories.src, what);
    }

    // webpack-related settings
    processWebpackConfig(wc) {}
    getWDSOptions() {
        const result = {
            ...this.devServer,
            contentBase: this.getSrcPath('static'),

            historyApiFallback: {
                rewrites: [{ from: /./, to: context => {
                    // serve 404 if appending .html did not work
                    if (context.match.input.endsWith('.html')) return this.devServer['404'];
                    // try rewrite /path -> /path.html
                    return context.match.input + '.html';
                } }]
            }
        };

        delete result['404'];
        return result;
    }
    getWebpackMode(mode) {
        if (mode === 'dev') return 'development';
        if (this.mode) return this.mode;
        return process.env.NODE_ENV;
    }

    // minification
    shouldMinify(what) {
        if (!what) return !!this.output.minify;
        if (typeof this.output.minify === typeof {}) return !!this.output.minify[what];
        return !!this.output.minify;
    }
    minificationSettings(what, def = {}) {
        if (typeof this.output.minify === typeof {}) {
            if (typeof this.output.minify[what] === typeof {}) {
                return this.output.minify[what];
            }
        }
        return def;
    }

    // page data
    getDataForPage(fullPageName, overridings) {
        const commonData = this.data.common;
        const specificData = this.data.pages[fullPageName] || {};

        const result = {
            // common page data
            ...this.data.common,
            // page specific data
            ...(this.data.pages[fullPageName] || {}),

            // default required values
            meta: {
                title: ''
            },
            context: {
                layout: this.layout.default,
                bundleEntries: []
            },

            // overridings from loader
            ...overridings
        };

        // additional meta tags
        Object.assign(result.meta, commonData.meta || {}, specificData.meta || {});

        return result;
    }
}

module.exports = SzConfig;
