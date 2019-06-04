const path = require('path');
const Handlebars = require('handlebars');
const { addAssetToBundle } = require('./utils');

module.exports = {
    set_title(title, options) {
        options.data.root.meta.title = title;
    },
    set_layout(layout, options) {
        options.data.root.context.layout = layout;
    },

    bundle(src, options) {
        addAssetToBundle(path.join('assets', src), options);
    },
    css_bundle(options) {
        const { pagePath, pageName } = options.data.root;
        return new Handlebars.SafeString(
            `<!-- SZ_CSS_BUNDLE(${pagePath.concat([pageName]).join('/')}) -->`
        );
    },
    js_bundle(options) {
        const { pagePath, pageName } = options.data.root;
        return new Handlebars.SafeString(
            `<!-- SZ_JS_BUNDLE(${pagePath.concat([pageName]).join('/')}) -->`
        );
    }
};
