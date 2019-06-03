module.exports = {
    addAssetToBundle(src, options) {
        options.data.root.context.bundleEntries[src] = true;
    }
};
