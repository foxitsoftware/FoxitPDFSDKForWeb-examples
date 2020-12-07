const path = require('path');
module.exports = {
    contentBase: path.resolve(__dirname, '../dist'),
    open: true,
    openPage: 'examples/UIExtension/complete_webViewer/index.html',
    port: 9999,
    inline: true,
    disableHostCheck: true,
    clientLogLevel: 'error',
    proxy: {
        '/snapshot': {
            target: 'http://127.0.0.1:3002'
        }
    }
}