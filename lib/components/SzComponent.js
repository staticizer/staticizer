const path = require('path');
const Handlebars = require('handlebars');
const { addAssetToBundle } = require('../helpers');

function checkArg(componentName, val, spec, name = spec.name) {
    if (val === void 0) {
        if (spec.required) {
            throw new ReferenceError(`${name} argument of ${componentName} is required`);
        } else {
            if (typeof spec.default === typeof Function) return spec.default();
            return spec.default;
        }
    } else {
        if (spec.type) {
            let passed = false;
            if (spec.type === Number) passed = typeof val === typeof 0;
            else if (spec.type === String) passed = typeof val === typeof '';
            else if (spec.type === Boolean) passed = typeof val === typeof true;
            else if (spec.type === Object) passed = (val instanceof Object);
            else if (spec.type === Array) passed = (Array.isArray(val));
            else {
                throw new TypeError(`Unknown type of ${name} argument in ${componentName}`);
            }

            if (!passed) {
                throw new TypeError(
                    `${name} argument of ${componentName}: expected ${spec.type.name}, got ${val}`
                );
            }
        }
        return val;
    }
}

module.exports = class SzComponent {
    constructor({
        name,
        args = [],
        kwargs = {},
        assets = [],
        data
    } = {}) {
        this.name = name;
        this.args = args;
        this.kwargs = kwargs;
        this.templateFn = null;
        this.assets = assets;
        this.context = 'components';
        this.data = data;
    }

    registerHelper() {
        const component = this;
        Handlebars.registerHelper(component.name, function (...args) {
            const options = args.pop();
            const kwargs = options.hash;

            for (let i = 0; i < component.assets.length; i++) {
                addAssetToBundle(
                    path.join(component.context, component.assets[i]),
                    options
                );
            }

            const data = {
                ...options.data.root,
                ...component.createDataObject(args, kwargs)
            };

            if (options.fn) {
                Object.assign(data, {
                    slot(...args) {
                        const last = args.pop();
                        if (!last) return options.fn(data);
                        return options.fn({
                            ...data,
                            ...last.hash
                        });
                    },
                });
            }

            return component.render(data);
        });
    }

    createDataObject(args, kwargs) {
        let data = {};
        for (let i = 0; i < this.args.length; i++) {
            const argSpec = this.args[i];
            let argVal = args[i];

            if (argVal === void 0 && argSpec.kwarg) {
                const kwargName = (typeof argSpec.kwarg === typeof '') ? argSpec.kwarg : argSpec.name;
                argVal = kwargs[kwargName];
            }

            data[argSpec.name] = checkArg(this.name, argVal, argSpec);
        }

        for (let argName in this.kwargs) {
            const argSpec = this.kwargs[argName];
            const argVal = kwargs[argName];
            data[argName] = checkArg(this.name, argVal, argSpec, argName);
        }

        if (typeof this.data === typeof Function) {
            data = this.data(data);
            if (typeof data !== typeof {}) {
                throw new TypeError(
                    `${this.name}: data(): expected an object, got ${data}`
                );
            }
        }

        return data;
    }

    render(data) {
        if (!this.templateFn)
            throw new ReferenceError(`Template is not defined for ${this.name} component`);
        return new Handlebars.SafeString(this.templateFn(data));
    }
    setTemplate(templateFn) {
        this.templateFn = templateFn;
    }
};
