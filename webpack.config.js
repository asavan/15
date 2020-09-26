const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const os = require('os');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const webpack = require('webpack');
const HashOutput = require('webpack-plugin-hash-output');
const {InjectManifest} = require('workbox-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

// process.traceDeprecation = true;

const getLocalExternalIP = () => [].concat(...Object.values(os.networkInterfaces()))
    .filter(details => details.family === 'IPv4' && !details.internal)
    .pop().address

module.exports = (env, argv) => {
    const devMode = !argv || (argv.mode !== 'production');
    let addr = getLocalExternalIP() || '0.0.0.0';
    return {

        entry: {main: "./src/index.js"},
        output: {
            path: path.resolve(__dirname, "docs"),
            filename: devMode ? "[name].js" : "[name].[chunkhash].min.js",
            // publicPath: devMode ? "/" : "./docs/"
            // publicPath: "./dist/"
        },
        module: {
            rules: [
                {
                    test: /\.css$/i,
                    use: [{
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            // you can specify a publicPath here
                            // by default it uses publicPath in webpackOptions.output
                            // publicPath: '../',
                            hmr: devMode,
                        },
                    }, 'css-loader'],
                },
                {
                    test: /worker\.js$/,
                    use: { loader: 'worker-loader' },
                }
            ]
        },
        optimization: {
            minimizer: [new TerserJSPlugin({
                terserOptions: {
                    mangle: true,
                    compress: {
                        drop_console: true
                    }
                }
            }), new OptimizeCSSAssetsPlugin({})],
        },
        plugins: [
            new CleanWebpackPlugin(),
            new HashOutput(),
            new HtmlWebpackPlugin({
                template: "./src/index.html",
                minify: false,
                // filename: devMode ? "./index.html" : "../index.html",
                inject: 'head'
                // filename: 'index.html'
            }),
            new ScriptExtHtmlWebpackPlugin({
                defaultAttribute: 'async'
            }),
            new MiniCssExtractPlugin({
                filename: devMode ? '[name].css' : '[name].[contenthash].min.css'
            }),
            ...(devMode ? [] : [new InjectManifest({
                swDest: './sw.js',
                swSrc: './src/sw.js',
                exclude: [
                    /index\.html$/,
                    /CNAME$/,
                    /\.nojekyll$/,
                    /_config\.yml$/,
                    /^.*well-known\/.*$/,
                ]
            })]),
            new webpack.DefinePlugin({
                __USE_SERVICE_WORKERS__: !devMode
            }),
            new CopyPlugin({
                patterns: [
                    { from: 'src/images/', to: './images/' },
                    { from: 'src/manifest.json', to: './' },
                    { from: 'github/', to: './' }
                ],
            })
        ],
        devServer: {
            // contentBase: path.resolve(__dirname, "src"),
            historyApiFallback: true,
            compress: true,
            port: 8080,
            hot: true,
            open: true,
            host: addr,
            // clientLogLevel: 'debug',
            // watchContentBase: true,
        }
    }
};
