const SzComponent = require('./lib/components/SzComponent');
const helpersUtils = require('./lib/helpers/utils');
const helpers = require('./lib/helpers/builtin');

module.exports = {
    SzComponent,

    helpers,
    utils: {
        ...helpersUtils
    }
};
