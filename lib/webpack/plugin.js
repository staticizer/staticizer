const { ReplaceSource } = require('webpack-sources');

const NAME = 'StaticizerPlugin';
const JS_REGEX = /<!-- SZ_JS_BUNDLE\((.+?)\) -->/;
const CSS_REGEX = /<!-- SZ_CSS_BUNDLE\((.+?)\) -->/;

function replaceBundleNames({
    regex,
    source,
    replaceSource,
    replacement
}) {
    const match = regex.exec(source);
    if (match) {
        const [matched, pageName] = match;
        replaceSource.replace(
            match.index,
            match.index + matched.length,
            replacement(pageName)
        );
    }
}

module.exports = class StaticizerPlugin {
    // constructor() { }

    apply(compiler) {
        compiler.hooks.emit.tapPromise(NAME, (compilation) => {
            for (let filename in compilation.assets) {
                if (filename.endsWith('.html')) {
                    const htmlPage = compilation.assets[filename];
                    const replaceSource = new ReplaceSource(htmlPage);
                    compilation.assets[filename] = replaceSource;

                    const source = htmlPage.source();

                    replaceBundleNames({
                        regex: JS_REGEX,
                        source,
                        replaceSource,
                        replacement: pageName => `<script src="/assets/${pageName}.${compilation.hash}.js"></script>`
                    });
                    replaceBundleNames({
                        regex: CSS_REGEX,
                        source,
                        replaceSource,
                        replacement: pageName => `<link rel="stylesheet" href="/assets/${pageName}.${compilation.hash}.css">`
                    });
                }
            }
            return Promise.resolve();
        });
    }
};
