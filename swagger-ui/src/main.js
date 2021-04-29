import Vue from 'vue';
import App from './App.vue';
import jquery from 'jquery';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import VueClipboard from 'vue-clipboard2';
import highlight from 'highlight.js';
import 'highlight.js/styles/googlecode.css'; //样式文件

Vue.use(VueClipboard);
Vue.use(ElementUI);
Vue.directive('highlight', function (el) {
    let blocks = el.querySelectorAll('code');
    setTimeout(() => {
        blocks.forEach((block) => {
            highlight.highlightBlock(block);
        })
    }, 200);
});

window.jquery = window.$ = jquery;

Vue.config.productionTip = false;

String.prototype.replaceAll = function (FindText, RepText) {
    if (this != null) {
        let regExp = new RegExp(FindText, 'g')
        return this.replace(regExp, RepText)
    }
    return null
};

Array.prototype.contains = function (obj) {
    let i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true
        }
    }
    return false
}

new Vue({
    render: h => h(App),
}).$mount('#app');
