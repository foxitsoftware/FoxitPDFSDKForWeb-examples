const webpackConfig = require('./webpack.config');
const fs = require('fs-extra');
const path = require('path');

const exampleDir = path.resolve(__dirname, '../examples')

const entries = [];

fs.readdirSync(exampleDir).forEach(dep1dir => {
    const dep1 = path.resolve(exampleDir, dep1dir);
    fs.readdirSync(dep1).forEach(dep2dir => {
        entries.push({
            path: 'examples/' + dep1dir + '/' + dep2dir,
            js: path.resolve(exampleDir, dep1dir, dep2dir, 'index.js'),
            template: path.resolve(exampleDir, dep1dir, dep2dir, 'index.html'),
        })
    })
})


const conf = webpackConfig({
    entries,
    mode: 'development',
    plugins: []
})
conf.devServer = require('./webpack-dev-server.config');
module.exports = conf;