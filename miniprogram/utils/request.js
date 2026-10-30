import { DEMO_MODE } from './config.js'

const demo = require('./demo/index.js')
const session = require('./demo/session.js')

var logOutNum = 0
var jumpingLogin = false

function toLogin() {
	logOutNum++
	session.logout()
	// 与应用生命周期共用跳转锁，避免并发请求重复 reLaunch。
	if (typeof getApp === 'function') {
		var application = getApp()
		if (application && application.applySessionRoute) {
			application.applySessionRoute()
			return
		}
	}
	if (logOutNum === 1 && !jumpingLogin) {
		jumpingLogin = true
		uni.reLaunch({
			url: '/myPage/Login/Login',
			complete: function () {
				jumpingLogin = false
			}
		})
	}
	setTimeout(function () {
		logOutNum = 0
	}, 10000)
}

function dispatch(method, prams) {
	prams = prams || {}
	if (DEMO_MODE) {
		return Promise.resolve(demo.handleDemoRequest(method, prams.url, prams.data, session.currentToken()))
			.then(function (res) {
				if (res && res.code == 2) {
					toLogin()
				}
				return res
			})
	}
	return Promise.resolve({
		code: 0,
		message: '未开启演示模式且已禁止回落旧服务',
		items: null
	})
}

export const sendPostRequest = function (prams) {
	return dispatch('POST', prams)
}

export const sendGetRequest = function (prams) {
	return dispatch('GET', prams)
}
