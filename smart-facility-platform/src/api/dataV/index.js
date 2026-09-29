import {get, post, put} from "@/utils/axios";

export const getMapFloorRoomList = params => {
    return get("/map/floor/screen", params);
};
export const getMapFloorRoomListV1 = params => {
    return post("/map/floor/screenV1", params, {
        headers: {
            "content-type": "application/json"
        }
    });
};
// 房间大屏
export const getMapRoomScreen = params => {
    return get("/map/room/screen", params);
};
// 房间大屏
export const getMapRoomScreenV1 = params => {
    return post("/map/room/screenV1", params, {
        headers: {
            "content-type": "application/json"
        }
    });
};

// 报警统计排行
export const postAlarmThingStatistics = params => {
    return post("/alarm/thing/statistics", params,{
        headers: {"content-type": "application/json"}
    });
};

// 报警统计排行-硬件类型
export const postAlarmThingSensorsStatistics = params => {
    return post("/alarm/thing/sensors/statistics", params,{
        headers: {"content-type": "application/json"}
    });
};

// 大屏展示的房间
export function putShowRoomBatch(data) {
    return put('/map/showRoom/batch', data, {
        headers: {
            "content-type": "application/json"
        }
    })
}


