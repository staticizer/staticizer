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

        this.aliases = userOverrides.aliases || {};
        this.hot = userOverrides.hot || false;
    }

    staticOutputPath(base) {
        if (!this.output.staticPrefix) return base;
        return path.join(base, this.output.staticPrefix);
    }
    assetsOutputPath(base) {
        if (!this.output.assetsPrefix) return base;
        return path.join(base, this.output.assetsPrefix);
    }

    processWebpackConfig(wc) {}

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
