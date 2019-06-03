const Handlebars = require('handlebars');
const { tree } = require('../utils');
const builtinHelpers = require('./builtin');
const { addAssetToBundle } = require('./utils');

module.exports = {
    registerBuiltins() {
        for (let helperName in builtinHelpers) {
            Handlebars.registerHelper(helperName, builtinHelpers[helperName]);
        }
    },
    loadAndRegisterCustoms(dirname) {
        tree(dirname, file => {
            const fn = require(file.filepath);
            const [, name] = file.name.match(/(.+)\.js$/) || [];
            if (name) {
                Handlebars.registerHelper(name, fn);
            }
        });
    },

    addAssetToBundle
};
