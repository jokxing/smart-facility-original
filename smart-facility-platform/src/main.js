import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import "./style/index.less";

import "./plugins/elementui"; //element
import './permission'; //前置路由守卫
import './assets/iconfontSource/iconfont.css';
import './assets/iconfontSource/iconfont.js';
import "./filter"; //全局过滤
import "./icon";
import "babel-polyfill"
import "./style/font.less"
import i18n from "./i18n"
import ElementUI from "element-ui"

// 本地公共组件全局引入
import commonPackages from '@/components/common-packages'
Vue.use(commonPackages)

Vue.use(ElementUI,{
    i18n:(key,value)=>i18n.t(key,value)
});

import NP from 'number-precision'
Vue.prototype.$NP = NP


Vue.config.productionTip = false
new Vue({
    router,
    store,
    render: h => h(App),
    i18n
}).$mount('#app')
