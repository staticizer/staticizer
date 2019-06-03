const fs = require('fs');
const path = require('path');

function tree(dirname, fn) {
    const filenames = fs.readdirSync(dirname);
    for (let i = 0; i < filenames.length; i++) {
        const filepath = path.resolve(dirname, filenames[i]);
        if (fs.statSync(filepath).isDirectory()) {
            tree(filepath, fn);
        } else {
            fn({
                filepath,
                name: filenames[i],
                dirname
            });
        }
    }
}

module.exports = {
    tree
};
