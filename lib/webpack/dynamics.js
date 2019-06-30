const path = require('path');

function mul([head, ...tail]) {
    if (!tail.length) return head.values.map(value => ({ [head.name]: value }));

    const result = [];
    const multiplied = mul(tail);

    for (let i = 0; i < head.values.length; i++) {
        for (let j = 0; j < multiplied.length; j++) {
            result.push({
                ...multiplied[j],
                [head.name]: head.values[i]
            });
        }
    }

    return result;
}

function substitute(pathFragments, values) {
    return pathFragments.map(f => {
        if (f.startsWith('_')) {
            const varName = f.slice(1);
            return values[varName];
        }
        return f;
    });
}

function unwrapDynamics(result, names, pathFragments, szConfig) {
    const valueArrays = [];

    for (let i = 0; i < names.length; i++) {
        const varName = names[i];
        const domain = szConfig.getDynamicDomain(varName);
        valueArrays.push({
            name: varName,
            values: []
        });

        for (let j = 0; j < domain.length; j++) {
            const varValue = domain[j];
            valueArrays[i].values.push(varValue);
        }
    }

    const combinations = mul(valueArrays);
    for (let i = 0; i < combinations.length; i++) {
        result.push({
            path: path.join(...substitute(pathFragments, combinations[i])),
            // TODO: redundant?
            dynamics: Object.entries(combinations[i]).reduce(
                (acc, [key, value]) => {
                    acc[key] = value;
                    return acc;
                },
                {}
            )
        });
    }
}

function getCombinations(pagePath, szConfig) {
    const result = [];

    const pathFragments = pagePath.split(path.sep);
    const foundDynamicNames = pathFragments
        .filter(fragment => fragment.startsWith('_'))
        .map(n => n.slice(1)) // remove leading '_'
        ;
    if (foundDynamicNames.length) {
        unwrapDynamics(result, foundDynamicNames, pathFragments, szConfig);
    } else {
        result.push({
            path: pagePath,
            dynamics: {}
        });
    }

    return result;
}

function augmentEntries(entries, szConfig) {
    const result = {};
    const modules = Object.keys(entries);

    for (let m = 0; m < modules.length; m++) {
        const moduleName = modules[m];
        const combinations = getCombinations(moduleName, szConfig);

        for (let c = 0; c < combinations.length; c++) {
            const combination = combinations[c];
            const args = JSON.stringify({
                dynamics: combination.dynamics
            });
            result[combination.path] = `page-loader?${args}!${entries[moduleName]}`;
        }
    }

    return result;
}

module.exports = {
    substitute,
    getCombinations,
    augmentEntries
};
