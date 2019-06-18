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
    },

    json(obj) {
        return JSON.stringify(obj);
    },
    join(...args) {
        const kwargs = args.pop().hash;
        const arr = args[0] || kwargs.arr;
        const sep = args[1] || kwargs.sep;
        return arr.join(sep);
    },
    array(...args) {
        args.pop();
        return args;
    },
    object(...args) {
        const kwargs = args.pop().hash;
        return { ...kwargs, ...args };
    },

    fallback(...args) {
        args.pop();
        for (let i = 0; i < args.length; i++) {
            if (args[i] !== void 0) {
                return args[i];
            }
        }
    }
};
