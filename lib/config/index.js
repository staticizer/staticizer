const fs = require('fs');
const SzConfig = require('./SzConfig');

let instance = null;

module.exports = {
    load(path) {
        let userOverridings = {};
        if (fs.existsSync(path)) {
            userOverridings = require(path);
        }
        instance = new SzConfig(userOverridings);
        return instance;
    },

    get instance() {
        return instance;
    }
};
