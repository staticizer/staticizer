module.exports = {
    addAssetToBundle(src, options) {
        options.data.root.context.bundleEntries[src] = true;
    },

    pageNameToUrl(fullName) {
        const result = fullName
            .replace(/index$/, '')
            .replace(/\/+/, '/')
            .replace(/\/$/, '')
        ;
        if (!result.startsWith('/')) {
            return '/' + result;
        }
        return result;
    }
};
