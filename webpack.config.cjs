const path = require('path');

module.exports = {
    entry: './main.js',
    devtool: "source-map",
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'atAutocomplete.umd.min.js',
        library: {
            name: 'atAutocomplete',
            type: 'umd',
            export: 'default'
        },
        globalObject: 'this'
    }
};