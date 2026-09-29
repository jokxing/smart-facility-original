import {
    get,
    post
} from "@/utils/axios.js";

// 添加送检
export function getDetectAdd(params) {
    return get('/detect/add', params)
}

// 获取下拉框
export function getDetectDown(params) {
    return get('/detect/down', params)
}

export function getDetectHistory(params) {
    return get('/detect/history', params)
}

export function getDetectComplete(params) {
    return get('/detect/complete', params)
}


export function getDetectList(params) {
    return get('/detect/list', params)
}
export function updateDetect(data) {
    return post('/detect/update', data, {
        headers: {
            "content-type": "application/json"
        }
    })
}

// 获取送检历史列表
export function getDetectHistoryList(params) {
    return get('/detect/history/list', params)
}
