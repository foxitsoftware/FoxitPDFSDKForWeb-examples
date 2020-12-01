const path = require('path');
module.exports = {
    contentBase: path.resolve(__dirname, '../dist'),
    port: 9999,
    inline: true,
    host: '0.0.0.0',
    disableHostCheck: true,
    clientLogLevel: 'error',
    proxy: {
        '/snapshot': {
            target: 'http://127.0.0.1:3002'
        }
    }
}