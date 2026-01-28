import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import ElementPlus from 'unplugin-element-plus/vite'
import path from 'path';
import fs from 'fs';

// 自定义插件：排除 public/v3 文件夹
const excludePublicV3Plugin = () => {
    return {
        name: 'exclude-public-v3',
        generateBundle() {
            // 在生成 bundle 后，删除 dist 目录中的 v3 文件夹
            const v3Path = path.resolve(__dirname, 'dist/v3');
            if (fs.existsSync(v3Path)) {
                fs.rmSync(v3Path, { recursive: true, force: true });
                console.log('已排除 public/v3 文件夹');
            }
        }
    };
};

export default defineConfig({
    //服务端渲染
    ssr: false,
    base: './',
    plugins: [vue(), ElementPlus({useSource: true,}), excludePublicV3Plugin()],
    // 配置 public 目录，排除 v3 文件夹
    publicDir: 'public',
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
        outDir: 'dist',
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
        },
        // 复制 public 目录时排除 v3 文件夹
        copyPublicDir: true,
    },
    //反向代理
    server: {
        port: 8080,
        host: 'localhost',
        open: true,
        https: false,
        proxy: {
            // '/v3/': {
            //     target: "http://127.0.0.1:8080/",
            //     changeOrigin: true,
            // },
        }
    }
});