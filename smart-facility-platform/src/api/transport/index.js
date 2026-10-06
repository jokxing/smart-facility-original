import {get, post} from "@/utils/axios.js";
import request from "@/utils/request";


/*************冷链车司机相关接口*************/
// 获取冷链车司机列表
export const getUserDriverList = params => {
    return get("/userDriverInfo/query", params);
};
// 获取所有冷链车司机
export const miniListAllDriver = params => {
    return get("/userDriverInfo/miniQueryAll", params);
};

// 新增冷链车司机
export const addUserDriver = data => {
    return post("/userDriverInfo/add", data, {
        headers: {"content-type": "application/json"}
    });
};

// 更新冷链车司机
export const updateUserDriver = data => {
    return post("/userDriverInfo/update", data, {
        headers: {"content-type": "application/json"}
    });
};

// 移除冷链车司机
export const removeUserDriver = data => {
    return post("/userDriverInfo/delete", data, {
        headers: {"content-type": "application/json"}
    });
};


/*************通用单位相关接口*************/

// 获取通用单位列表
export const getCommonUnitList = params => {
    return get("/commonUnit/query", params);
};

// 获取通用单位列表
export const getAllCommonUnitList = params => get("/commonUnit/queryAll", params);


// 新增通用单位
export const addCommonUnit = data => {
    return post("/commonUnit/add", data, {
        headers: {"content-type": "application/json"}
    });
};

// 更新通用单位
export const updateCommonUnit = data => {
    return post("/commonUnit/update", data, {
        headers: {"content-type": "application/json"}
    });
};

// 移除通用单位
export const removeCommonUnit = data => {
    return post('/commonUnit/delete', data, {
        headers: {"content-type": "application/json"}
    });
};


/*************车品牌相关接口*************/
// 获取车品牌列表
export const getCommonBrandList = params => {
    return get("/commonBrand/query", params);
};
// 查询所有车型号
export const miniListAllCarBrand = params => {
    return get("/commonBrand/miniQueryAll", params);
};

// 新增车品牌
export const addCommonBrand = data => {
    return post("/commonBrand/add", data, {
        headers: {"content-type": "application/json"}
    });
};

// 更新车品牌
export const updateCommonBrand = data => {
    return post("/commonBrand/update", data, {
        headers: {"content-type": "application/json"}
    });
};

// 移除车品牌
export const removeCommonBrand = data => {
    return post("/commonBrand/delete", data, {
        headers: {"content-type": "application/json"}
    });
};


/*************车型号相关接口*************/
// 查询车型号
export const getCommonModelList = params => {
    return get("/commonModel/query", params);
};

// 查询所有车型号
export const miniListAllCarModel = params => {
    return get("/commonModel/miniQueryAll", params);
};


// 新增车型号
export const addCommonModel = data => {
    return post("/commonModel/add", data, {
        headers: {"content-type": "application/json"}
    });
};

// 更新车型号
export const updateCommonModel = data => {
    return post("/commonModel/update", data, {
        headers: {"content-type": "application/json"}
    });
};

// 移除车型号
export const removeCommonModel = data => {
    return post("/commonModel/delete", data, {
        headers: {"content-type": "application/json"}
    });
};

/************* 冷藏车 ****************/

// 获取冷藏车列表
export const queryRefrigerateCar = query => get('/refrigerateCar/query', query);

// 获取编辑信息
export const getRefrigerateCarEditor = id => get('/refrigerateCar/getEditor/' + id);

// 编辑冷藏车
export const updataRefrigerateCar = data => post("/refrigerateCar/update", data, {
    headers: {"content-type": "application/json"}
});

// 新增冷藏车
export const createRefrigerateCar = data => post("/refrigerateCar/add", data, {
    headers: {"content-type": "application/json"}
});

// 删除冷藏车
export const deleteRefrigerateCar = ids => post("/refrigerateCar/delete", ids, {
    headers: {"content-type": "application/json"}
});

// 分配司机
export const updateRefrigerateCarDriver = params => get("/refrigerateCar/updateDriver", params);

// 获取详情
export const getRefrigerateCarDetails = id => get("/refrigerateCar/details/" + id);

// 获取运单历史记录
export const getRefrigerateCarWaybill = query => get("/refrigerateCar/historyWayBill/", query);

// 导出运单记录
export const exportRefrigerateCarWaybill = params => get("/refrigerateCar/exportExcel", params, {
    responseType: "blob"
});

/************* 运单管理 ****************/

// 获取运单
export const queryTransportOrder = query => post('/transportOrder/query', query, {
    headers: {"content-type": "application/json"}
});

// 分配冷藏车
export const allocateTransportOrderCar = data => post('/transportOrder/allocateCar',data,{
    headers: {"content-type": "application/json"}
});

// 设置状态
export const changeTransportOrderState = data => post('/transportOrder/change/state',data,{
    headers: {"content-type": "application/json"}
});

// 删除运单
export const deleteTransportOrder = data => post('/transportOrder/delete',data,{
    headers: {"content-type": "application/json"}
})

// 新增运单
export const createTransportOrder = data => post('/transportOrder/add',data,{
    headers: {"content-type": "application/json"}
})

// 编辑运单
export const updateTransportOrder = data => post('/transportOrder/update',data,{
    headers: {"content-type": "application/json"}
})

// // 打印运单监测数据
// export const printTransportOrderData = orderId =>get('/transportOrder/print/'+orderId,{historyTimeInterval:1},{
//
// });

// 打印运单监测数据
export const batchPrintTransportOrderData = param => post('/transportOrder/batchPrint/new',param,{
    headers: {"content-type": "application/json"}
});

// 运单详情
export const infoTransportOrder = id => get('/transportOrder/detail/'+id,{});

// 改变运单司机
export const changeTransportOrderDriver = param => post('/transportOrder/change/driver',param,{
    headers: {"content-type": "application/json"}
});

// 获取GPS坐标记录
export const getTransportOrderGPS = param => get('/transportOrder/monitorInfo/gps',param);

// 导出GPS坐标记录
export const exportTransportOrderGPS = params => {
    return request({
        url: "/transportOrder/export/gps",
        params,
        method: "GET",
        responseType: "blob"
    })
};



/************* 品名维护 ****************/

// 分页查询
export const querySampleInfo = query => post('/sampleInfo/query', query, {
    headers: {"content-type": "application/json"}
});

// 轻量查询全部产品信息（生产厂商、名称、id）
export const miniQueryAllSampleInfo = query => get('/sampleInfo/miniQueryAll',query);

// 新增品名
export const createSampleInfo = data => post('/sampleInfo/add', data, {
    headers: {"content-type": "application/json"}
});

// 编辑品名
export const updateSampleInfo = data => post('/sampleInfo/update', data, {
    headers: {"content-type": "application/json"}
});

// 编辑品名
export const deleteSampleInfo = ids => post('/sampleInfo/delete', ids, {
    headers: {"content-type": "application/json"}
});

/************* 发货单位、收货单位 ****************/

// 删除
export const deleteReceiptDeliverAddress = ids => post('/receiptDeliverAddress/deleteBatchIds', ids, {
    headers: {"content-type": "application/json"}
});

// 编辑
export const updateReceiptDeliverAddress = data => post('/receiptDeliverAddress/update', data, {
    headers: {"content-type": "application/json"}
});

// 列表
export const queryReceiptDeliverAddress = query => post('/receiptDeliverAddress/query', query, {
    headers: {"content-type": "application/json"}
});

// 列表
export const miniQueryReceiptDeliverAddress = query => get('/receiptDeliverAddress/miniQueryAll',query);

// 详情
export const infoReceiptDeliverAddress = id => get('/receiptDeliverAddress/info/' + id);

// 新增收发货单位
export const addReceiptDeliverAddress = data => post('/receiptDeliverAddress/add', data, {
    headers: {"content-type": "application/json"}
});

/** 运输单主页统计  **/
export const getTransportOrderDashboard = params => {
    return get("/transportOrder/dashboard", params);
};

/** 运输单主页报警信息  **/
export const getHistoryAlarmRecord = params => {
    return get("/transportOrder/historyAlarmRecord", params);
};

/** 运输单主页GPS信息  **/
export const getGpsList = params => {
    return get("/transportOrder/index/historyData/gps", params);
};

/** 首页运单gps数据导出  **/
export const indexGpsHistoryDataExport = params => {
    return request({
        url: "/transportOrder/index/historyData/gps/export",
        params,
        method: "GET",
        responseType: "blob"
    })
};

/** 首页运单检测数据  **/
export const getHistoryData = params => {
    return get("/transportOrder/index/historyData", params);
};

/** 首页报警信息导出  **/
export const exportHistoryAlarmRecord = params => {
    return request({
        url: "/transportOrder/historyAlarmRecord/export",
        params,
        method: "GET",
        responseType: "blob"
    })
};

/** 首页gps轨迹  **/
export const indexGraphics = params => {
    return get("/transportOrder/index/graphics", params);
};
// 首页根据条件获取车辆,运单等数据
export const getTransportOrderList = data => {
    return post("/transportOrder/index/order/list", data, {
        headers: {"content-type": "application/json"}
    });
};
// 首页获取车辆,运单的轨迹
export const getTransportOrderGps = data => {
    return post("/transportOrder/index/gps", data, {
        headers: {"content-type": "application/json"}
    });
};
// 点击 出发 获取车下相关的运单信息
export const getTransportOrderGetStateInfo = data => {
    return get("/transportOrder/change/getStateInfo", data);
};

export const resetDemoTransport = () => post("/__demo/transport/reset", {}, {
    headers: {"content-type": "application/json"}
});