import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import viteCompression from 'vite-plugin-compression';
import ElementPlus from 'unplugin-element-plus/vite'
import path from 'path';

export default defineConfig({
    //服务端渲染
    ssr: false,
    base: './',
    plugins: [vue(), viteCompression(),ElementPlus({
        useSource: true,
    })],
    resolve: {
        extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
        alias: {
            // 键必须以斜线开始和结束
            "@": path.resolve(__dirname, "./src"),
            'assets': path.resolve(__dirname, './src/assets'),
            'components': path.resolve(__dirname, './src/components'),
            'static': path.resolve(__dirname, './src/static')
        },
    },
    build: {
        outputDir: "target/classes/META-INF/resources",
        assetsDir: '',
        manifest: true,
        minify: 'terser',
        terserOptions: {
            compress: {
                //生产环境时移除console
                drop_console: true,
                drop_debugger: true,
            },
        },
        rollupOptions: {
            output: {
                assetFileNames: assetInfo => {
                    const info = assetInfo.name.split('.');
                    let extType = info[info.length - 1];
                    if (
                        /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)
                    ) {
                        extType = 'media'
                    } else if (/\.(png|jpe?g|gif|svg)(\?.*)?$/.test(assetInfo.name)) {
                        extType = 'img'
                    } else if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
                        extType = 'fonts'
                    }
                    return `${extType}/[name]-[hash][extname]`
                },
                chunkFileNames: 'js/[name]-[hash].js',
                entryFileNames: 'js/[name]-[hash].js'
            }
        }
    },
    //反向代理
    server: {
        port: 8080,
        host: 'localhost',
        open: true,
        https: false,
        proxy: {
            '/v3/': {
                target: "http://127.0.0.1:8090/",
                changeOrigin: true,
            },
        }
    }
});