const fs = require('fs');
const path = require('path');

function tree(dirname, fn) {
    if (!fs.existsSync(dirname) || !fs.statSync(dirname).isDirectory()) {
        return;
    }
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

function rerequire(m) {
    delete require.cache[require.resolve(m)];
    return require(m);
}

module.exports = {
    rerequire,
    tree
};
