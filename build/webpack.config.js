const fs = require('fs-extra');
const path = require('path');
const copyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

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

const distPath = path.resolve(__dirname, '../dist');
const libraryModulePath = path.resolve('node_modules/@foxitsoftware/foxit-pdf-sdk-for-web-library');
const libPath = path.resolve(libraryModulePath, 'lib');

module.exports = function(env, argv) {
    const mode = argv.mode;
    return {
        mode: mode,
        entry: entries.reduce((entries, entry) => {
            entries[entry.path] = entry.js;
            return entries;
        }, {}),
        devtool: mode === 'development' ? 'inline-source-map': false,
        devServer: mode === 'development' ? require('./webpack-dev-server.config') : undefined,
        module: {
            rules: [{
                test: /\.(js|es)$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            }, {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }]
        },
        plugins: [].concat(
            entries.map((entry) => {
                return new HtmlWebpackPlugin({
                    template: entry.template,
                    filename: path.resolve(distPath, entry.path, 'index.html'),
                    chunks: [entry.path]
                });
            })
        ).concat([
            new copyWebpackPlugin({
                patterns:[{
                    from: libPath,
                    to: path.resolve(distPath, 'lib'),
                    force: true,
                    filter: resourcePath => {
                        return resourcePath.indexOf('/server/') === -1;
                    }
                }, {
                    from: path.resolve(__dirname, '../assets'),
                    to: path.resolve(distPath, 'assets'),
                    force: true
                }, {
                    from: path.resolve(__dirname, '../index.html'),
                    to: path.resolve(distPath, 'index.html'),
                    force: true
                }]
            })
        ]),
        externals: ['UIExtension', 'PDFViewCtrl'],
        output: {
            filename: '[name]/index.js',
            path: distPath,
            globalObject: 'window'
        }
    }
};