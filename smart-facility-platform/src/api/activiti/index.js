import {get, post} from "@/utils/axios.js";
import request from "@/utils/request.js";

/** 流程设置分页查询 **/
export const getProcessSettingQuery = data => {
    return get("/activiti/processSetting/query", data);
};

/** 流程设置开启/关闭 **/
export const postProcessOperate = data => {
    return post("/activiti/process/operate", data, {
        headers: {
            "content-type": "application/json"
        }
    });
};

/** 任务结束 **/
export const postTaskTerminate = data => {
    return post("/activiti/task/terminate", data, {
        headers: {
            "content-type": "application/json"
        }
    });
};

/** 流程配置保存发布 **/
export const postModelSaveAndDeploy = data => {
    return post("/activiti/model/saveAndDeploy", data, {
        headers: {
            "content-type": "application/json"
        }
    });
};

/** 撤销申请 **/
export const postRevoke = data => {
    return post("/activiti/process/revoke", data, {
        headers: {
            "content-type": "application/json"
        }
    });
};

/** 查询消息待办分页列表 **/
export const postQueryPersonalTaskV1 = data => {
    return post("/activiti/task/query", data, {
        headers: {
            "content-type": "application/json"
        }
    });
};

/** 获取超时配置信息 **/
export const getTimeOutConfigGetInfo = data => {
    return get("/activiti/timeOutConfig/getInfo", data);
};

/** 保存超时信息配置 **/
export const postTimeOutConfigSaveOrUpdate = data => {
    return post("/activiti/timeOutConfig/saveOrUpdate", data, {
        headers: {
            "content-type": "application/json"
        }
    });
};

/** 根据编号查询流程配置信息 **/
export const getModelGetLatest = data => {
    return get("/activiti/model/getLatest", data);
};

/** 根据编号查询流程配置信息 **/
export const listProcessNodeField = data => {
    return get("/activiti/processNodeField/getList/"+data);
};

/** 查询流程单分页历史记录 **/
export const getProcessOrderHistoryQuery = data => {
    return get("/activiti/processOrderHistory/query", data);
};

// 待入库列表
export const getProcessQueryNoWarehouse = data => {
    return get("/instrumentNewInfoExpand/queryNoWarehouse", data);
};


/** 资产入库-简单模式录入  **/
export const postInstrumentNewInfoExpand = data => {
    return post("/instrumentNewInfoExpand/create", data, {
        headers: {
            "content-type": "application/json"
        }
    });
};

/** 资产入库-完整模式录入 **/
export const postInstrumentNewInfoExpandFull = data => {
    return post("/instrumentNewInfoExpand/createFull", data, {
        headers: {
            "content-type": "application/json"
        }
    });
};

/** 资产入库-详情信息 **/
export const getInstrumentNewInfoExpandInfo = data => {
    return get("/instrumentNewInfoExpand/details", data);
};

/** 资产入库-修改 **/
export const postInstrumentNewInfoExpandUpdate = data => {
    return post("/instrumentNewInfoExpand/update", data, {
        headers: {
            "content-type": "application/json"
        }
    });
};

/** 资产入库-导入 instrumentNewInfoExpand/batchStorage **/


/** 流程详情  **/
export const getProcessOrderDetails = data => {
    return get("/activiti/processOrderHistory/details", data);
};

/** 流程详情-资产信息列表 **/
export const getQueryAssetInformation = data => {
    return get("/activiti/processOrderHistory/details/queryAssetInformation", data);
};
/** 流程转办 **/
export const postTransferTask = (data) => {
    return post("/activiti/task/transfer",data, {
        headers: {
            "content-type": "application/json"
        }
    })
}

/** 流程驳回 **/
export const postTerminateTask = (data) => {
    return post("/activiti/task/terminate", data, {
        headers: {
            "content-type": "application/json"
        }
    })
}
/** 流程同意进入下一步 **/
export const postActivitiTransferTask = (data) => {
    return post("/activiti/task/complete", data,{
        headers: {
            "content-type": "application/json"
        }
    })
}
/** 消息中心-列表 **/
export const getNotifyMessageQuery = (data) => {
    return get("/notify/message/query", data)
}

/** 待办事项-个人待办列表 **/
export const getActivitiTaskList = (data) => {
    return post("/activiti/task/queryAgenda", data,{
        headers: {
            "content-type": "application/json"
        }
    })
}

/** 待办事项个人任务信息列表 **/
export const getActivitiTaskQuery = (data) => {
    return get("/activiti/task/query", data)
}

/** 获取超时配置 **/
export const getActivitiTimeOutConfig = (data) => {
    return get("/activiti/timeOutConfig/getInfo", data)
}

/** 超时配置 **/
export const postActivitiTimeOutConfig = (data) => {
    return post("/activiti/timeOutConfig/saveOrUpdate", data,{
        headers: {
            "content-type": "application/json"
        }
    })
}

/** 消息未读标识 **/
export const getActivitiUnread = (data) => {
    return get("/activiti/unread", data)
}

/** 批量入库 **/
export const postActivitiBatchStorage = (data) => {
    return post("/instrumentNewInfoExpand/batchStorage", data,{
        headers: {
            "content-type": "application/json"
        }
    })
}
/** 取消批量入库 **/
export const postActivitiCancelStorage = (data) => {
    return post("/instrumentNewInfoExpand/cancelStorage", data,{
        headers: {
            "content-type": "application/json"
        }
    })
}

/** 已读 **/
export const getNotifyMessageRead = (data) => {
    return post("/notify/message/read/" + data.id,{
        headers: {
            "content-type": "application/json"
        }
    })
}

/**  查询异动未读条数 **/
export const getPropertyNoReadCount = (data) => {
    return get("/property/unusualMsg/noReadCount", data)
}

/** 查询异动消息列表 **/
export const getPropertyUnusualMsg = (data) => {
    return post("/property/unusualMsg",data,{
        headers: {
            "content-type": "application/json"
        }
    })
}
/** 查询异动消息列表 **/
export const getPropertyUnusualMsgRead = (data) => {
    return post("/property/unusualMsg/read",data,{
        headers: {
            "content-type": "application/json"
        }
    })
}

/** 申请入库  **/
export const postActivitiApplyStorage = (data) => {
    return post("/activiti/applyStorage",data,{
        headers: {
            "content-type": "application/json"
        }
    })
}

/** 单据配置 **/
export const getActivitiConfigGetList = (data) => {
    return get("/activiti/config/getList", data)
}

/** 编辑流程单配置数据  **/
export const postActivitiConfigUpdateFrom = (data) => {
    return post("/activiti/config/updateFrom",data,{
        headers: {
            "content-type": "application/json"
        }
    })
}

/** 提交申请时，那些字段需要显示，让客户填  **/
export const getActivitiGetStarShow = (data) => {
    return get("/activiti/formConfigInst/getStarShow", data)
}

/** 修改历史流程单详情信息 **/
export const postActivitiProcessOrderUpdate = (data) => {
    return post("/activiti/processOrder/update",data,{
        headers: {
            "content-type": "application/json"
        }
    })
}

/** 获取小程序二维码 **/
export const getActivitiDetailsQRCode = (data) => {
    return get("/activiti/getDetailsQRCode",data)
}