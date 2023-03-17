const path = require('path');
const pkg = require('../package.json');
const port = pkg.serve.port;
module.exports = {
    contentBase: path.resolve(__dirname, '../dist'),
    host: '0.0.0.0',
    port: port,
    hot: true,
    inline: true,
    disableHostCheck: true,
    clientLogLevel: 'error',
    historyApiFallback: true,
    proxy: pkg.serve.proxy
}