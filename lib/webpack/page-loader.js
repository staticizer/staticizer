const path = require('path');
const fs = require('fs');
const Handlebars = require('handlebars');
const loaderUtils = require('loader-utils');
const HtmlMinifier = require('html-minifier');
const Helpers = require('../helpers');
const Components = require('../components');
const config = require('../config').instance;

// outside the loader because builtinHelpers are static
Helpers.registerBuiltins();

module.exports = function (pageTemplate) {
    const options = loaderUtils.getOptions(this);

    const helpersPath = path.resolve(this.rootContext, 'helpers');
    Helpers.loadAndRegisterCustoms(helpersPath);
    this.addContextDependency(helpersPath);

    const componentsPath = path.resolve(this.rootContext, 'components');
    Components.loadAndRegisterCustoms(componentsPath);
    this.addContextDependency(componentsPath);

    const match = this.context.match(new RegExp(`^${this.rootContext}/pages/(.+)$`));
    let pagePath = [];
    if (match) {
        pagePath = match[1].split('/');
    }

    const pageName = this.resourcePath.match(/\/([^/]+)\.hbs$/)[1];
    const fullPageName = pagePath.concat([pageName]).join('/');

    const data = config.getDataForPage(fullPageName, { pagePath, pageName });
    console.log(data);
    const pageBody = Handlebars.compile(pageTemplate)(data);

    const layoutFile = data.context.layout + '.hbs';
    const layoutPath = path.resolve(this.rootContext, 'layouts', layoutFile);
    this.dependency(layoutPath);

    const callback = this.async();

    fs.readFile(layoutPath, { encoding: 'utf-8' }, (err, layoutContent) => {
        if (err) {
            this.emitError(err);
            callback(err, null);
            return;
        }

        const layoutData = {
            ...data,
            body: pageBody
        };
        let layoutBody = Handlebars.compile(layoutContent)(layoutData);

        if (config.shouldMinify('html')) {
            layoutBody = HtmlMinifier.minify(layoutBody, config.minificationSettings('html', {
                collapseWhitespace: true,
                conservativeCollapse: true,
                keepClosingSlash: true
            }));
        }

        // emit html
        // console.log(path.join(...pagePath, pageName + '.html'));
        this.emitFile(
            path.join(...pagePath, pageName + '.html'),
            layoutBody
        );

        const bundleEntries = Object.keys(layoutData.context.bundleEntries).map(
            assetPath => `require(${JSON.stringify(assetPath)});`
        );

        callback(null, bundleEntries.join('\n'));
    });
};
