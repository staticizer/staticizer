const path = require('path');
const fs = require('fs');
const SzConfig = require('./SzConfig');

let instance = null;

module.exports = {
    load(configFilePath) {
        let userOverridings = {};
        if (fs.existsSync(configFilePath)) {
            userOverridings = require(configFilePath);
        }
        instance = new SzConfig(
            path.dirname(configFilePath),
            userOverridings
        );
        return instance;
    },

    get instance() {
        return instance;
    }
};
