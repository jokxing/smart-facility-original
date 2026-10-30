
// #ifndef VUE3
import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false
App.mpType = 'app'

// #ifdef APP-PLUS
function syncAppStatusBar() {
	const pages = getCurrentPages()
	const route = (pages[pages.length - 1] || {}).route
	plus.navigator.setStatusBarStyle(route === 'pages/tabBar/Home/Home' ? 'light' : 'dark')
}
// #endif

Vue.mixin({
	onBackPress(event) {
		// #ifdef APP-PLUS
		if (event.from === 'backbutton') {
			return require('./utils/app-popup-back.js').closeTopPopup(this)
		}
		// #endif
	},
	onShow() {
		// #ifdef APP-PLUS
		this.$nextTick(syncAppStatusBar)
		// #endif
	},
	onReady() {
		const application = getApp()
		application._sessionReady = true
		application.applySessionRoute()
		// #ifdef APP-PLUS
		uni.hideTabBar({ animation: false })
		this.$nextTick(syncAppStatusBar)
		// manifest 使用手动关闭启动屏；等目标页面渲染后再关闭。
		if (require('./utils/demo/session.js').isLoggedIn() ||
			(getCurrentPages().slice(-1)[0] || {}).route === 'myPage/Login/Login') {
			plus.navigator.closeSplashscreen()
		}
		// #endif
	}
})

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
