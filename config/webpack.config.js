var path = require('path');
var webpack = require('webpack');

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
                exclude: [
                    path.resolve(__dirname, "../app")
                ],
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
            {
                test: require.resolve('idai-3dviewer'),
                use:
                  'exports-loader?type=commonjs&exports=_3dviewer',
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
          THREE: 'three',
        }),
    ],
    devtool: 'source-map',
    devServer: {
        proxy: {
            '/data': {
                target: 'http://bogusman02.dai-cloud.uni-koeln.de',
                changeOrigin: true,
            }
        },
        historyApiFallback: {
            index: 'index.html'
        }
    }
};
