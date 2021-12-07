const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PurgecssPlugin = require('purgecss-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: path.resolve(__dirname, '../app/app.js'),
    output: {
        path: path.resolve(__dirname, '../public'),
        filename: '[name].js',
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                styles: {
                    name: 'styles',
                    test: /\.css$/,
                    chunks: 'all',
                    enforce: true
                }
            }
        }
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
                    MiniCssExtractPlugin.loader,
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
                    MiniCssExtractPlugin.loader,
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
                { from: "./app/partials/navbar-menu.html", to: "./partials/navbar-menu.html" },
                { from: "3dhop", to: "3dhop" },
                { from: "3dviewer", to: "3dviewer" },
                { from: "node_modules/idai-3dviewer/dist/idai-3dviewer.min.js", to: "3dviewer/idai-3dviewer.min.js" },
                { from: "node_modules/font-awesome/fonts", to: "font-awesome/fonts" },
                { from: "node_modules/drmonty-leaflet-awesome-markers/css/images", to: "css/images" },
            ],
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../app/index.html'),
        }),
        new MiniCssExtractPlugin({
            filename: "[name].css",
        }),
        new PurgecssPlugin({
            paths: [
                ...glob.sync(`${path.resolve(__dirname, '../app')}/**/*.html`, { nodir: true }),
                ...glob.sync(`${path.resolve(__dirname, '../node_modules/idai-components')}/**/*.html`, { nodir: true }),
            ]
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
