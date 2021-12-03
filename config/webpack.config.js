var path = require('path');
var webpack = require('webpack');
var CopyPlugin = require('copy-webpack-plugin');

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
                test: /\.css$/i,
                use: [
                    'style-loader',
                    'css-loader',
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
        new CopyPlugin({
            patterns: [
                { from: "3dhop", to: "3dhop" },
                { from: "3dviewer", to: "3dviewer" },
                { from: "node_modules/idai-3dviewer/dist/idai-3dviewer.min.js", to: "3dviewer/idai-3dviewer.min.js" },
                { from: "node_modules/font-awesome/fonts", to: "font-awesome/fonts" },
                { from: "node_modules/drmonty-leaflet-awesome-markers/css/images", to: "css/images" },
            ],
        }),
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
