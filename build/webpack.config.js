const path = require('path');
const copyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const distPath = path.resolve(__dirname, '../dist');
const libraryModulePath = path.resolve('node_modules/@foxitsoftware/foxit-pdf-sdk-for-web-library');
const libPath = path.resolve(libraryModulePath, 'lib');

/**
 * 
 * @param {object} options 
 * @param {object[]} options.entries 
 * @param {string} options.entries[].path 
 * @param {string} options.entries[].js 
 * @param {string} options.entries[].template
 * @param {Object} options.
 * @param {string} options.mode
 * @param {Object[]} options.plugins
 */
module.exports = function(options) {
    const mode = options.mode || 'development';
    return {
        mode: mode,
        entry: options.entries.reduce((entries, entry) => {
            entries[entry.path] = entry.js;
            return entries;
        }, {}),
        devtool: mode === 'development' ? 'inline-source-map': 'none',
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
        plugins: (options.plugins || []).concat(
            options.entries.map((entry) => {
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
                    from: path.resolve(__dirname, '../docs'),
                    to: path.resolve(distPath, 'docs'),
                    force: true
                }]
            })
        ]),
        output: {
            filename: '[name]/index.js',
            path: distPath,
            globalObject: 'window'
        }
    };
}