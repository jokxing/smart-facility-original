import Vue from "vue"
import VueI18n from "@/utils/vue-i18n.js"
Vue.use(VueI18n);
let langFiles = require.context("./config", false, /\.js$/);
let messages = {};
let reg = /^\.\/([^\.]+)\.([^\.]+)$/
langFiles.keys().forEach(key => {
    if (key in messages) {
        return
    }
    let langName = reg.exec(key)[1];
    messages[langName] = langFiles(key).default
})

let lang = "zh_CN";

uni.getSystemInfo({
	success: (res) => {
		lang = res.language === 'en' ? 'en' : 'zh_CN';
	}
})

export default new VueI18n({
    locale: lang,
    messages
})
