import {get, post} from "@/utils/axios.js";
import request from "@/utils/request.js";

// 资产统计(inventoryType： 0---常规盘点 1---手动盘点)
export function getPropertyNumStatistics(data) {
    return get("/property/numStatistics", data);
}

// 移动资产列表
export function postPropertyMovePropertyList(data) {
    return post("/property/move/propertyList", data, {
        headers: {"content-type": "application/json"}
    });
}

// 选择时间获取盘点分类列表
export function getPropertyInventoryList(data) {
    return get("/property/inventoryList", data);
}

// 手动盘点(立即盘点)
export function postPropertyInventory(data) {
    return post("/property/inventory", data, {
        headers: {"content-type": "application/json"}
    });
}

// 一键激活/关闭监控(0---激活 1---关闭)
export function getPropertyActivation(data) {
    return get("/property/activation", data);
}

// 盘点间隔设置
export function getPropertyInventoryIntervalSet(data) {
    return get("/property/inventoryInterval/set", data);
}

// 一键激活/关闭监控历史查询(标签监控开关记录)
export function postPropertyActivationHistory(data) {
    return post("/property/activation/history", data, {
        headers: {"content-type": "application/json"}
    });
}

// 获取位置调整处理记录
export function postPropertyPositionHandleRecord(data) {
    return post("/property/positionHandle/record", data, {
        headers: {"content-type": "application/json"}
    });
}

// 位置调整
export function postPropertyPositionChange(data) {
    return post("/property/positionChange", data, {
        headers: {"content-type": "application/json"}
    });
}

// 是否忽略位置调整
export function postPropertyIgnorePosition(data) {
    return post("/property/ignore/position", data, {
        headers: {"content-type": "application/json"}
    });
}

// 资产统计报告(柱状图)
export function getPropertyMoveStatistics(data) {
    return get("/property/move/statistics", data);
}

// 获取移动次数排行
export function postPropertyMoveNumRank(data) {
    return post("/property/moveNum/rank", data, {
        headers: {"content-type": "application/json"}
    });
}

// 获取公司资产列表统计(分页)---设备维度
export function postPropertyEquipmentStatistics(data) {
    return post("/property/equipmentStatistics", data, {
        headers: {"content-type": "application/json"}
    });
}

// 获取最新的移动轨迹列表
export function postPropertyMove(data) {
    return post("/property/move", data, {
        headers: {"content-type": "application/json"}
    });
}

// 异动忽略消息
export function postPropertyUnusualMsgIgnore(data) {
    return post("/property/unusualMsg/ignore", data, {
        headers: {"content-type": "application/json"}
    });
}

// 获取需要显示的字段--资产盘点表格筛选
export function getPropertyListField(data) {
    return get("/property/list/field", data);
}

// 设置列表中显示字段--资产盘点表格筛选
export function postPropertyListField(data) {
    return post("/property/list/field", data, {
        headers: {"content-type": "application/json"}
    });
}

// 导出移动资产列表数据
export function getPropertyExportInventoryList(params) {
    return request({
      url: "/property/export/inventoryList",
      params,
      responseType: "blob"
    })
  };