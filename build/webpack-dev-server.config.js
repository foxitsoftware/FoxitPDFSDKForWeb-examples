const path = require('path');
module.exports = {
    contentBase: path.resolve(__dirname, '../dist'),
    public: '0.0.0.0:0',
    allowedHosts: [
        '0.0.0.0'
    ],
    port: 8080,
    hot: true,
    inline: true,
    disableHostCheck: true,
    clientLogLevel: 'error',
    historyApiFallback: true,
    proxy: {
        '/snapshot': {
            target: 'http://127.0.0.1:3002'
        }
    }
}