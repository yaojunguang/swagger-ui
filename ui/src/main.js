import {createApp} from 'vue'
import App from './App.vue'
import store from './store'
import axios from './plugins/axios';
import * as Icons from '@element-plus/icons-vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import HljsVuePlugin from '@highlightjs/vue-plugin'
import 'highlight.js/styles/atom-one-dark.css'
import 'highlight.js/lib/common'
import jquery from 'jquery'

const app = createApp(App)
// 分环境处理
if (import.meta.env.DEV) {
    if ('__VUE_DEVTOOLS_GLOBAL_HOOK__' in window) {
        window.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app
    }
    app.config.devtools = true
}
window.jquery = window.$ = jquery;
//全局配置
app.config.globalProperties.axios = axios;
app.use(store)
    .use(HljsVuePlugin)
    .use(ElementPlus, {locale: zhCn})
    .mount('#app');
Object.keys(Icons).forEach(key => {
    app.component(key, Icons[key]);
});