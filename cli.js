#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const config = require('./lib/config');
const webpack = require('./lib/webpack');

const [,, mode = 'build'] = process.argv;
console.log(mode);

const root = process.cwd();
const szConfigPath = path.resolve(root, 'staticizer.config.js');
const szConfig = config.load(szConfigPath);

webpack.build({
    root,
    config: szConfig
});
