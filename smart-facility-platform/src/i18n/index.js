import Vue from "vue"
import VueI18n from "vue-i18n"

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

export default new VueI18n({
    locale: localStorage.getItem("lang") || "zh",
    messages
})


