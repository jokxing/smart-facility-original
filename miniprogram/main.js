
// #ifndef VUE3
import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false
App.mpType = 'app'

import i18n from "./lang/index.js"
import tabBar from "components/tabBar/tabBar.vue"
import {forDateTime} from "@/utils/methods.js"
Vue.component('tab-bar', tabBar);
Vue.filter('forDateTime', forDateTime)
const app = new Vue({
	  i18n,
    ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import App from './App.vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif