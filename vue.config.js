const path = require('path');
const resolve = dir => path.join(__dirname, dir);
module.exports = {
    publicPath: process.env.BASE_URL,
    outputDir: "target/classes/META-INF/resources",
    assetsDir: 'static',
    //打包后的启动文件
    indexPath: "swagger-ui.html",
    productionSourceMap: process.env.NODE_ENV !== "production",
    chainWebpack: config => {
        config.optimization.minimizer('terser').tap((args) => {
            args[0].terserOptions.compress.warnings = false
            args[0].terserOptions.compress.drop_console = true
            args[0].terserOptions.compress.drop_debugger = true // 默认true
            args[0].terserOptions.compress.pure_funcs = ['console.*']
            return args
        });
        // 修复HMR
        config.resolve.symlinks(true);

        // 添加别名
        config.resolve.alias
            .set('@', resolve('src'))
            .set('assets', resolve('src/assets'))
            .set('components', resolve('src/components'))
            .set('layout', resolve('src/layout'))
            .set('base', resolve('src/base'))
            .set('static', resolve('src/static'));
    },
    configureWebpack: {
        devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'cheap-module-eval-source-map',
    },

    // 设置代理
    devServer: {
        port: 8080,
        host: 'localhost'
    }
};
