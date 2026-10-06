import {get, post} from "@/utils/axios.js";
import request from "@/utils/request.js";

// 移液枪统计
export function postGunPipetteStatistics(data) {
    return post("/gun/pipette/statistics", data, {
        headers: {"content-type": "application/json"}
    });
}

export function postGunTakePipette(data) {
    return post("/gun/take/pipette", data, {
        headers: {"content-type": "application/json"}
    });
}

export function getGunTake(data) {
    return get("/gun/take", data);
}

export function postGunReturnPipette(data) {
    return post("/gun/return/pipette", data, {
        headers: {"content-type": "application/json"}
    });
}

// 移液枪列表
export const postGunPipetteList = data => {
    return post("/gun/pipette/listV1", data, {
      headers: { "content-type": "application/json" },
    });
};

// 移液枪编辑   
export function postGunPipetteEdit(data) {
    return post("/gun/pipette/edit", data, {
        headers: {"content-type": "application/json"}
    });
}

// 移液枪-单个和批量删除枪
export function postGunPipetteDel(data) {
    return post("/gun/pipette/del", data, {
        headers: {"content-type": "application/json"}
    });
}

// 移液枪-批量修改部门
export function postGunPipetteUpdateDepartment(data) {
    return post("/gun/pipette/updateDepartment", data, {
        headers: {"content-type": "application/json"}
    });
}

// 移液枪-详情
export function getGunPipetteDetail(data) {
    return get("/gun/pipette/detail", data);
}

// 移液枪开启平台报警
export function getGunPipetteOpenAlarm(data) {
    return get("/gun/pipette/openAlarm", data);
}

// 移液枪详情 - 历史使用记录
export function postGunPipetteHistory(data) {
    return post("/gun/pipette/history", data, {
        headers: {"content-type": "application/json"}
    });
}

// 移液枪详情 - 历史使用记录导出
export function getGunPipetteUseRecordExport(params) {
    return request({
        url: "/gun/pipette/useRecord/export",
        params,
        responseType: "blob"
    })
}

// 移液枪 - 获取报警规则
export function getGunPipetteAlarmGetRule(data) {
    return get("/gun/pipette/alarm/getRule", data);
}

// 移液枪 - 批量修改（设置）报警规则(兼顾单个)
export function postGunPipetteAlarmBatchRule(data) {
    return post("/gun/pipette/alarm/batchRule", data, {
        headers: {"content-type": "application/json"}
    });
}

// 移液枪导出
export function getGunPipetteExport(params) {
    return request({
        url: "/gun/pipette/export",
        params,
        responseType: "blob"
    })
}

// 当前枪架已绑定移液枪列表
export const postGunPipetteBindingList = params => {
    return post("/gun/pipette/binding/list", params, {
        headers: {"content-type": "application/json"}
    })
}

// 移液枪使用统计(总揽)
export function postGunPipetteUseStatistics(data) {
    return post("/gun/pipette/use/statistics", data, {
        headers: {"content-type": "application/json"}
    })
}

// 超时未归还枪次数排行(总览)
export function getGunPipetteTimeoutStatistics(data) {
    return post("/gun/pipette/timeout/statistics", data, {
        headers: {"content-type": "application/json"}
    })
}

// 超时未归还枪列表
export const postGunPipetteNoHomingList = params => {
    return post("/gun/pipette/noHoming/list", params, {
        headers: {"content-type": "application/json"}
    })
}

// 鼠标悬停获取位置
export function getGunPipetteMouseInfo(data) {
    return get("/gun/pipette/mouseInfo", data);
}

// 移液枪使用率统计（筛选）
export const postGunUseFrequency = params => {
    return post("/gun/pipette/gunUseFrequency", params, {
        headers: {"content-type": "application/json"}
    })
}

// 移液枪综合使用率负责人排行（筛选）
export const postSignatureUseRanked = params => {
    return post("/gun/pipette/signature/useRanked", params, {
        headers: {"content-type": "application/json"}
    })
}

// 超时未归还负责人次数/时长统计(筛选)
export const postTimeoutSignature = params => {
    return post("/gun/pipette/timeout/signature", params, {
        headers: {"content-type": "application/json"}
    })
}

// 超时未归还枪次数统计(筛选)
export const postTimeoutFrequency = params => {
    return post("/gun/pipette/timeout/frequency", params, {
        headers: {"content-type": "application/json"}
    })
}

// 超时未归还枪次数统计(筛选)详情
export const postTimeoutFrequencyDetails = params => {
    return post("/gun/pipette/timeout/frequency/details ", params, {
        headers: {"content-type": "application/json"}
    })
}

// 按使用人排行(详情)
export const postGunDetailsUsePersonStatistics = params => {
    return post("/gun/pipette/details/usePersonStatistics ", params, {
        headers: {"content-type": "application/json"}
    })
}

// 超时统计(详情)
export const postGunDetailsTimeoutStatistics = params => {
    return post("/gun/pipette/details/timeoutStatistics ", params, {
        headers: {"content-type": "application/json"}
    })
}

// 超时未归还时长(详情)详情
export const postGunDetailsTimeoutDetails = params => {
    return post("/gun/pipette/details/timeoutDetails ", params, {
        headers: {"content-type": "application/json"}
    })
}