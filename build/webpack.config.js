const fs = require('fs-extra');
const path = require('path');
const copyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const exampleDir = path.resolve(__dirname, '../examples')

const entries = [];

const libraryModulePath = path.resolve('node_modules/@foxitsoftware/foxit-pdf-sdk-for-web-library');

fs.readdirSync(exampleDir).forEach(dep1dir => {
    const dep1 = path.resolve(exampleDir, dep1dir);
    const chunks = [
        'lib/' + dep1dir + '.full'
    ] 
    fs.readdirSync(dep1).forEach(dep2dir => {
        const dir = 'examples/' + dep1dir + '/' + dep2dir;
        entries.push({
            dir,
            entryName: dir + '/index',
            js: path.resolve(exampleDir, dep1dir, dep2dir, 'index.js'),
            htmlchunks: chunks,
            template: path.resolve(exampleDir, dep1dir, dep2dir, 'index.html'),
        })
    })
})

const distPath = path.resolve(__dirname, '../dist');
const libPath = path.resolve(libraryModulePath, 'lib');

module.exports = function(env, argv) {
    const mode = argv.mode;
    return {
        mode: mode,
        entry: entries.reduce((entries, entry) => {
            entries[entry.entryName] = entry.js;
            return entries;
        }, {
            'lib/UIExtension.full': path.resolve(libraryModulePath, 'lib', 'UIExtension.full.js'),
            'lib/PDFViewCtrl.full': path.resolve(libraryModulePath, 'lib', 'PDFViewCtrl.full.js')
        }),
        devtool: mode === 'development' ? 'inline-source-map': false,
        devServer: mode === 'development' ? require('./webpack-dev-server.config') : undefined,
        module: {
            rules: [{
                test: /\.(js|es)$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            }, {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            }]
        },
        plugins: [].concat(
            entries.map((entry) => {
                return new HtmlWebpackPlugin({
                    template: entry.template,
                    filename: path.resolve(distPath, entry.dir, 'index.html'),
                    chunks: entry.htmlchunks.concat([entry.entryName]),
                });
            })
        ).concat([
            new copyWebpackPlugin({
                patterns:[{
                    from: path.resolve(__dirname, '../assets'),
                    to: path.resolve(distPath, 'assets'),
                    force: true
                }, {
                    from: path.resolve(__dirname, '../index.html'),
                    to: path.resolve(distPath, 'index.html'),
                    force: true
                }].concat(mode === 'development' ? [{
                    from: libPath,
                    to: path.resolve(distPath, 'lib'),
                    force: true
                }] : [])
            }),
            new MiniCssExtractPlugin({
                filename: '[name].css'
            })
        ]),
        externals: ['UIExtension', 'PDFViewCtrl'],
        output: {
            filename: '[name].js',
            path: distPath,
            globalObject: 'window'
        }
    }
};