const path = require('path');

class SzConfig {
    constructor(userOverrides = {}) {
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
            port: 8080,
            host: 'localhost'
        }, userOverrides.devServer || {});

        this.pipelines = userOverrides.pipelines || {};
        for (let name in this.pipelines) {
            if (!Array.isArray(this.pipelines[name])) {
                throw new TypeError(`staticizer config: pipelines.${name} must be an array`);
            }
        }

        this.aliases = userOverrides.aliases || {};
        this.hot = userOverrides.hot || false;
        this.mode = userOverrides.mode;
    }

    // output paths management
    staticOutputPath(base) {
        if (!this.output.staticPrefix) return base;
        return path.join(base, this.output.staticPrefix);
    }
    getAssetPath(assetName) {
        if (!this.output.assetsPrefix) return assetName;
        return path.join(this.output.assetsPrefix, assetName);
    }

    // webpack-related settings
    processWebpackConfig(wc) {}
    getWDSOptions() {
        return {};
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
        Object.assign(result.meta, this.data.common.meta || {});

        return result;
    }
}

module.exports = SzConfig;
