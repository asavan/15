import path from "path";
import os from "os";
import { fileURLToPath } from "url";

import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CopyPlugin from "copy-webpack-plugin";
import webpack from "webpack";


import TerserJSPlugin from "terser-webpack-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import {InjectManifest} from "workbox-webpack-plugin";

import HTMLInlineCSSWebpackPlugin from "html-inline-css-webpack-plugin";

// import PACKAGE from "../package.json" with { type: "json" };
import { createRequire } from "module";
const PACKAGE = createRequire(import.meta.url)("./package.json");

const getLocalExternalIP = () => [].concat(...Object.values(os.networkInterfaces()))
    .filter(details => (details.family === "IPv4" || details.family === 4) && !details.internal)
    .pop()?.address;

const webConfig = (env, argv) => {
    const devMode = !argv || (argv.mode !== "production");
    const addr = getLocalExternalIP() || "0.0.0.0";
    const dirname = path.dirname(fileURLToPath(import.meta.url));
    return {

        entry: {main: "./src/index.js"},
        output: {
            path: path.resolve(dirname, "docs"),
            filename: devMode ? "[name].js" : "[name].[contenthash].min.js",
            clean: true
        },
        module: {
            rules: [
                {
                    test: /\.css$/i,
                    use: [{
                        loader: MiniCssExtractPlugin.loader
                    }, "css-loader"],
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
            }), new CssMinimizerPlugin()],
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: "./src/index.html",
                minify: false,
                inject: "head"
            }),
            new MiniCssExtractPlugin({
                filename: devMode ? "[name].css" : "[name].[contenthash].min.css"
            }),
            new HTMLInlineCSSWebpackPlugin.default(),
            ...(devMode ? [] : [new InjectManifest({
                swDest: "./sw.js",
                swSrc: "./src/sw.js",
                exclude: [
                    /index\.html$/,
                    /CNAME$/,
                    /\.nojekyll$/,
                    /_config\.yml$/,
                    /^.*well-known\/.*$/,
                ]
            })]),
            new webpack.DefinePlugin({
                __USE_SERVICE_WORKERS__: !devMode,
                __SERVICE_WORKER_VERSION__: JSON.stringify(PACKAGE.version)
            }),
            new CopyPlugin({
                patterns: [
                    { from: "src/images/", to: "./images/" },
                    { from: "src/manifest.json", to: "./" },
                    { from: "github/", to: "./" }
                ],
            })
        ],
        devServer: {
            historyApiFallback: true,
            compress: true,
            port: 8080,
            hot: true,
            open: true,
            host: addr,
        }
    };
};

export default webConfig;
