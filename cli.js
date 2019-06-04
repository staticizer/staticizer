#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const config = require('./lib/config');
const webpack = require('./lib/webpack');

const [,, mode = 'build'] = process.argv;

if (!['build', 'dev'].includes(mode)) {
    console.error(`Unknown staticizer mode "${mode}", allowed values are 'build' and 'dev'`);
}

const root = process.cwd();
const szConfigPath = path.resolve(root, 'staticizer.config.js');
const szConfig = config.load(szConfigPath);

if (mode === 'build') {
    webpack.build({
        root,
        config: szConfig
    });
} else if (mode === 'dev') {
    webpack.devServer({
        root,
        config: szConfig
    });
}
