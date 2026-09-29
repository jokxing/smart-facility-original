const path = require("path");
const webpack = require("webpack");
const CompressionWebpackPlugin = require("compression-webpack-plugin");
const productionGzipExtensions = ["js", "css", "jpg", "png"];
const isProduction = process.env.NODE_ENV === "production";
const isDemo = process.env.VUE_APP_DEMO === "true";
const demoConfig = require("./config/demo");
// const BundleAnalyzerPlugin =
//     require("webpack-bundle-analyzer").BundleAnalyzerPlugin;


function resolve(dir) {
    return path.join(__dirname, dir);
}
process.env.VUE_APP_VERSION = require('./package.json').version

const cdn = {
    // 忽略打包的第三方库
    externals: {
        vue: "Vue",
        "vue-router": "VueRouter",
        vuex: "Vuex",
        axios: "axios",
    },
    js: [
        "./js/vue.runtime.min.js",
        "./js/vue-router.min.js",
        "./js/vuex.min.js",
        "./js/axios.min.js",
    ],
};

// 本地环境是否需要使用cdn
const devNeedCdn = false;
const Timestamp = new Date().getTime();
module.exports = {
    publicPath: "./",
    outputDir: "dist",
    assetsDir: "static",
    productionSourceMap: false,
    devServer: {
        open: false,
        ...(isDemo ? { host: "127.0.0.1", progress: false, headers: demoConfig.headers, before: demoConfig.before } : {}),
        proxy: isDemo ? undefined : {
            // Local placeholder only. Never point this at original internal hosts.
            [process.env.VUE_APP_BASE_URL]: {
                target: `http://127.0.0.1/api`,
                ws: false,
                changeOrigin: true
            }
        }

    },
    chainWebpack: config => {
        if (isDemo) {
            // Legacy components import lodash without declaring it. Reuse CLI's
            // installed copy for this demo; do not install or rewrite components.
            config.resolve.alias.set('lodash$', require.resolve('lodash', {
                paths: [require.resolve('@vue/cli-service')]
            }));
        }
        if (isProduction || devNeedCdn) {
            config.plugin("html").tap(args => {
                args[0].cdn = cdn;
                return args;
            });
        }
        config.output.filename(`static/js/[name]${Timestamp}.js`).chunkFilename(`static/js/[name]${Timestamp}.js`).end();
        config.resolve.alias
            .set("@", resolve("src"))
            .set("@c", resolve("src/components"));
        config.plugins.delete('prefetch')
        // 当有很多页面时，会导致太多无意义的请求
        config.module.rule("svg").exclude.add(resolve("src/icon")).end();
        config.module
            .rule("icon")
            .test(/\.svg$/)
            .include.add(resolve("src/icon"))
            .end()
            .use("svg-sprite-loader")
            .loader("svg-sprite-loader")
            .options({
                symbolId: "icon-[name]"
            })
            .end();

        // if (isProduction || devNeedCdn)
        //     config
        //         .plugin("webpack-bundle-analyzer")
        //         .use(require("webpack-bundle-analyzer").BundleAnalyzerPlugin)
        //         .end();
        config.optimization.runtimeChunk = "single";
        config.optimization.splitChunks({
            maxAsyncRequests: 5,
            maxInitialRequests: Infinity,
            cacheGroups: {
                async: {
                    chunks: "async",
                    minChunks: 1,
                    maxInitialRequests: 3,
                    minSize: 0,
                    automaticNameDelimiter: "~",
                    priority: 9
                },
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: 10,
                    chunks: "all",
                    minChunks: 1,
                    minSize: 30000,
                },
            }
        });
    },
    configureWebpack: config => {
        if (isDemo) {
            // Legacy pages keep their localStorage API, with a separate demo namespace.
            config.plugins.push(new webpack.ProvidePlugin({
                localStorage: [demoConfig.storageModule, "default"]
            }));
        }
        // 用cdn方式引入，则构建时要忽略相关资源
        if (isProduction || devNeedCdn) config.externals = cdn.externals;
        if (isProduction) {
            (config.externals = cdn.externals),
                (config.performance = {
                    //入口起点的最大体积
                    maxEntrypointSize: 50000000,
                    //生成文件的最大体积
                    maxAssetSize: 30000000
                }),
                config.plugins.push(
                    new CompressionWebpackPlugin({
                        algorithm: "gzip",
                        test: new RegExp(
                            "\\.(" + productionGzipExtensions.join("|") + ")$"
                        ),
                        test: new RegExp("\\.(js|css)$"),
                        threshold: 10240,
                        minRatio: 0.8
                    }),
                );
        }
    },
    css: {
        extract:
            process.env.NODE_ENV === "production"
                ? {
                    ignoreOrder: true
                }
                : false
    }
};
