const path = require('path');
module.exports = {
    contentBase: path.resolve(__dirname, '../dist'),
    public: '0.0.0.0:0',
    port: 8080,
    inline: true,
    disableHostCheck: true,
    clientLogLevel: 'error',
    proxy: {
        '/snapshot': {
            target: 'http://127.0.0.1:3002'
        }
    }
}