var path = require('path');

module.exports = {
    entry: path.resolve(__dirname, '../app/app.js'),
    output: {
        path: path.resolve(__dirname, '../public'),
        filename: 'bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.html$/i,
                use: [
                    {
                        loader: 'ngtemplate-loader?relativeTo=' + path.resolve(__dirname, '../') + '/',
                    },
                    {
                        loader: 'html-loader',
                        options: {
                            esModule: false,
                            sources: {
                                list: ['...'],
                                // don't try to load dynamic sources whose paths are set by angular
                                urlFilter: (attribute, _value, _path) => !attribute === 'ng-src',
                            },
                        }
                    },
                ],
            },
            {
                test: /\.(png|jpg|gif)$/i,
                type: 'asset/resource',
                generator: {
                    filename: '[file][query]'
                }
            },
            {
                test: /\.(json)$/i,
                type: 'asset/resource',
                generator: {
                    filename: '[file][query]'
                }
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    'style-loader',
                    'css-loader',
                    'resolve-url-loader',
                    {
                        loader: "sass-loader",
                        options: {
                            sassOptions: {
                                sourceMap: true,
                                sourceMapContents: false,
                                includePaths: [
                                    'node_modules/bootstrap-sass/assets/stylesheets/',
                                    'node_modules/idai-components/src/',
                                ],
                            }
                        }
                    },
                ],
            },
        ]
    },
    devtool: 'source-map',
    devServer: {
        proxy: {
            '/data': {
                target: 'http://bogusman02.dai-cloud.uni-koeln.de',
                changeOrigin: true,
            }
        }
    }
};
