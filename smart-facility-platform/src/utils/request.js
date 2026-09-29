import axios from "axios";
import {Message} from "element-ui";
import router from '../router'
import {ERROR_404, ERROR_500} from "@/utils/constant";
import i18n from "@/i18n";
import mockAdapter from "@/mock";
import {DEMO_BASE_URL} from "@/mock/adapter";
import {clearDemoSession} from "@/mock/session";
const isDemo = process.env.VUE_APP_DEMO === "true";
//创建axios实例
const instance = axios.create({
    baseURL: isDemo ? DEMO_BASE_URL : process.env.VUE_APP_BASE_URL,
    ...(isDemo ? {adapter: mockAdapter} : {}),
    timeout: 50000 //超时
});

instance.defaults.headers.post["Content-Type"] =
    "application/x-www-form-urlencoded; charset=UTF-8";
//请求拦截
instance.interceptors.request.use(
    config => {
        if (isDemo) config.adapter = mockAdapter;
        let time  = new Date()
        let timeArray = time.toString().split(" ");
        const date = timeArray[5];
        let sessionId = localStorage.getItem("sessionId");
        if (sessionId) {
            config.headers["Authorization"] = localStorage.getItem("sessionId");
        }
        config.headers['time'] = date;
        localStorage.setItem("GMT", date.split("GMT")[1].substring(0,3))
        return config;
    },
    error => {
        Message.error(i18n.t('common.requestTimeout'));
        return Promise.reject(error);
    }
);
//响应拦截
instance.interceptors.response.use(
    config => {
        if (config.status === 200) {
            if (config.data.code * 1 === 2) {
                if (isDemo) {
                    clearDemoSession();
                    Message.error(config.data.message);
                    router.replace('/login');
                    return Promise.reject(new Error('演示登录已失效。'));
                }
                let path = "/login"
                if (JSON.parse(localStorage.getItem("USERINFO"))) {
                    const runpengId = JSON.parse(localStorage.getItem("USERINFO")).companyId;
                    if (runpengId == 189) {
                        path = "/runpeng/login"
                    }
                }
                localStorage.removeItem("sessionId");

                localStorage.clear();
                Message.error(config.data.message);
                return router.push({path});
            }
            if (config.data.code === 3) {
                return Message.error(config.data.message);
            }
            return config.data;
        } else {
            if (config.status === 502) {
              return router.push({path: "/502"});
            }
            if (config.status >= 500) {
              Message.error(ERROR_500);
            }
            if (config.status === 404) {
               Message.error(ERROR_404);
            }
            Message.error(config.data.message);
            return Promise.reject(config.data.message);
        }
    },
    error => {
        if (isDemo && error.code && error.code.startsWith('MOCK_')) {
            Message.error(error.message);
        }
        if (error.response) {
            const response = error.response;
            if (response.status === 500) {
                return response.data;
            }
        }
        return Promise.reject(error);
    }
);
export default instance;
