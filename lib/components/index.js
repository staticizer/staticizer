const path = require('path');
const fs = require('fs');
const Handlebars = require('handlebars');
const { tree } = require('../utils');
const SzComponent = require('./SzComponent');

function loadComponent({
    filename,
    filepath
}) {
    const componentName = filename.replace(/\.hbs$/, '');
    const pathWithoutExtension = filepath.replace(/\.hbs$/, '');

    const templateContent = fs.readFileSync(filepath, { encoding: 'utf-8' });

    const classFilepath = pathWithoutExtension + '.js';

    let component = null;

    if (fs.existsSync(classFilepath) && !fs.statSync(classFilepath).isDirectory()) {
        component = require(classFilepath);
        if (!component.name) component.name = componentName;
    } else {
        component = new SzComponent({ name: componentName });
    }

    component.context = path.dirname(filepath);
    component.setTemplate(Handlebars.compile(templateContent));
    component.registerHelper();

    return componentName;
}

function loadAndRegisterCustoms(dirname) {
    tree(dirname, file => {
        if (file.name.endsWith('.hbs')) {
            const name = loadComponent({
                filename: file.name,
                filepath: file.filepath
            });
            console.log(`Loaded ${name} from ${file.filepath}`);
        }
    });
}

module.exports = {
    loadAndRegisterCustoms,
    SzComponent
};
