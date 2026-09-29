import Vue from "vue";
import i18n from "@/i18n";
import {getDepartment} from "../api/department";
// 图片拼接路径
// 获取浏览器协议

const HOST = window.location.host;
const ENV = process.env.NODE_ENV;
let url = "";
if (ENV === "development") {
    url = process.env.VUE_APP_BASE_URL;
} else if (ENV === "production") {
    const PROTOCOL = window.location.protocol;
    url = PROTOCOL + "//" + HOST + "/api";
}
export const BASE_URL = url + "/file/picUrl?fileName=";

// 异常提示信息
export let ERROR = i18n.t('common.networkError');
export const ERROR_500 = i18n.t('common.error500');
export const ERROR_404 = i18n.t('common.error404');
export const HINT_DELETE = i18n.t('common.hintDelete');
export const HINT_DELETES = i18n.t('common.hintDelete');
export const HINT_DEFAULT = i18n.t('common.hintDefault');

// 监听localStorage
Vue.prototype.resetSetItem = function (key, newVal) {
    const signSetItem = localStorage.setItem
    localStorage.setItem = function (key, val) {
        let setEvent = new Event('setItemEvent')
        setEvent.key = key
        setEvent.newValue = val
        window.dispatchEvent(setEvent)
        signSetItem.apply(this, arguments)
    }
}

// base64拼接
Vue.prototype.$BASE64 = "data:image/png;base64,";

Vue.prototype.$STATUS = {
    NORMAL: 1,
    ABNORMAL: -1,
    OFFLINE: -100,
    ALL: 0,
};

Vue.prototype.IS_Colum = {
    17: true,
    16: true,
    26: true
}

Vue.prototype.deviceType = {
    OUTAGE_TYPE: 17,
    EN_MG_TYPE: 16,
    WATER_OUT: 26,
    SIGNAL: 33
}

Vue.prototype.labelWidth = "90px";

export const items = {
    PAGE_SIZE: 10,
    PAGE_NUM: 1,
    PAGE_SIZES: [10, 20, 50, 100, 500] //页码可选范围
};
/**
 * @type {{ABNORMAL: number 异常, NORMAL: number 正常, OFFLINE: number 离线}}
 */
export const STATUS_VALUE = {
    NORMAL: 1,
    NEWLYBUILD: 0,
    ABNORMAL: -1,
    OFFLINE: -100,
};

/**
 *  26 水浸, 16 门磁, 17 断电, 33信号源, 45记录仪自带断电，1001设备断电检测
 */
export const DEVICE_ID = {
    17: true,
    16: true,
    26: true,
    33: true,
    45: true,
    48: true,
    1001: true
}

/**** 特殊记录仪处理图表显示 ****/
// 26 水浸, 16 门磁, 17 断电, 33信号源, 45记录仪自带断电，1001设备断电检测
export const DATAZOOM = {
    12: [true, i18n.t('transport.noLocation'), i18n.t('transport.location'),],
    16: [true, i18n.t('common.open'), i18n.t('common.close2')],
    17: [true, i18n.t('hardware.outage'), i18n.t('hardware.aboutage')],
    26: [true, i18n.t('hardware.water'), i18n.t('hardware.NotWater')],
    33: [true, i18n.t('common.open'), i18n.t('common.close1')],
    45: [true, i18n.t('hardware.outage'), i18n.t('hardware.aboutage')],
    48: [true, i18n.t('common.abnormal'), i18n.t('common.normal')],
    1001: [true, i18n.t('hardware.outage'), i18n.t('hardware.aboutage')],
}

/**
 * 记录仪类型
 * @type {{STATUS: number 状态, EN_MG_TYPE: number 断电, OUTAGE_TYPE: number 门磁, WATER_OUT: number 水浸}}
 */
export const DEVICE_TYPE = {
    STATUS: 1,
    OUTAGE_TYPE: 17,
    EN_MG_TYPE: 16,
    WATER_OUT: 26,
    SIGNAL: 33
};

//时间维度
export const TIME_DIMENSION = [
    // {INTERVAL: 1, LABEL: "30分钟"},
    // {INTERVAL: 2, LABEL: "1小时"},
    // {INTERVAL: 3, LABEL: "6小时"},
    {INTERVAL: 4, LABEL: i18n.t('common.days1')},
    {INTERVAL: 5, LABEL: i18n.t('common.days7')},
    {INTERVAL: 6, LABEL: i18n.t('common.days30')},
    {INTERVAL: 7, LABEL: i18n.t('common.days90')},
];
// 时间格式化 2021-01-10 12:00:00
export const TIME_FORMAT = "YYYY-MM-DD HH:mm:ss";
/**
 *硬件设备类型 用于请求总览数据
 * @type {{DEVICE: number 记录仪,
 * SMART_SCOKET: number 智能插座,
 * ALERTOR: number 声光报警,
 * SIGNAL: number 信号接收器,
 * POWER_OUTAGE: number 断电报警器}}
 */
export const EQUIPMENT_TYPE = {
    DEVICE: 0,
    SMART_SCOKET: 10,
    ALERTOR: 7,
    POWER_OUTAGE: 8,
    SIGNAL: 14
};


/**
 * 声光报警状态
 * @type {{NEW: number 未激活, CLEAR_ALARM: number 消警, ALARM: number 报警, NORMAL: number 正常}}
 */
export const ALERTOR_STATUS = {
    NORMAL: 1,
    CLEAR_ALARM: -1,
    ALARM: -2,
    NEW: 0
};

/**
 * 参数状态
 */
export const MONITORSTATUS = [
    {
        label: i18n.t('common.normal'),
        code: 1,
        value: "normal",
    },
    {
        label: i18n.t('common.abnormal'),
        code: 2,
        value: "danger",
    },
    {
        label: i18n.t('common.offLine'),
        code: -100,
        value: "offline",
    },
    {
        label: "-",
        code: 4,
        value: "default"
    },
];

/**
 * 设备状态(运行状态)：0-已关机 1-运行中 2-待机中 3-维护中 4-缺省值(不用判断，直接为空)
 */
export const LABSTATUS = [
    {
        label: i18n.t('labDevice.runing'),
        code: 1,
        value: "normal",
        color: "#13ce66"
    },
    {
        label: i18n.t('labDevice.unruning'),
        code: 2,
        value: "danger",
        color: "#343f4b"
    },
    {
        label: i18n.t('labDevice.unruning'),
        code: 0,
        value: "offline",
        color: "#343f4b"
    },
    {
        label: i18n.t('labDevice.maintained'),
        code: 3,
        value: "offline",
        color: "#e5e5e5"
    },
    {
        label: "-",
        code: 4,
        value: "default"
    }
];
export const SMARTSOCKETSTATUS = [
    {
        label: i18n.t('labDevice.standbyOff'),
        value: "powerOff",
        code: 0
    },
    {
        label: i18n.t('labDevice.runing'),
        value: "running",
        code: 1
    },
    {
        label: i18n.t('labDevice.standbyPower'),
        value: "standBy",
        code: 2
    }
];

// 设备类型
export const INSTRUMENTTYPE = [
    {
        label: i18n.t('route.watchlabdevice'),
        value: 1,
    },
    {
        label: i18n.t('route.administration'),
        value: 2,
    },
    {
        label: i18n.t('route.unwatchlabdevice'),
        value: 3,
    },
];

// 具有网络配置的记录仪编号前缀
export const NETWORK = [
    1202010101,
    111102200
]

/**
 * 移液枪归位状态
 */
 export const GUNSTATUS = [
    {
        label: i18n.t('labDevice.onGunRack'),
        code: 0,
        value: "blueColor"
    },
    {
        label: i18n.t('labDevice.notGunRack'),
        code: 1,
        value: "withdraw",
    },
    {
        label: i18n.t('labDevice.overTime'),
        code: 2,
        value: "abnormal"
    },
];

/**
 * 移液枪架状态
 */
 export const GUNRACKSTATUS = [
    {
        label: i18n.t('common.notActivate'),
        code: 0,
        value: "blueColor"
    },
    {
        label: i18n.t('common.isLine'),
        code: 1,
        value: "normal",
    },
    {
        label: i18n.t('common.offLine'),
        code: -100,
        value: "offLine"
    },
];

/**
 * 资产标签状态
 */
 export const ASSETTAGSTATUS = [
    {
        label: i18n.t('common.monitored'),
        code: 1,
        value: "blueColor"
    },
    {
        label: i18n.t('common.unmonitor'),
        code: 0,
        value: "offLine"
    },
    {
        label: i18n.t('common.abmonitor'),
        code: 2,
        value: "color666",
    },
    {
        label: i18n.t('common.beStolen'),
        code: 3,
        value: "abnormal",
    },
];


// 新开发不要用historyTimeInterval，就用HISTORYTIMEINTERVAL
export const historyTimeInterval = [
    {name: "1"+i18n.t('common.minute'), id: 1},
    {name: "2"+i18n.t('common.minute'), id: 2},
    {name: "5"+i18n.t('common.minute'), id: 5},
    {name: "10"+i18n.t('common.minute'), id: 10},
    {name: "15"+i18n.t('common.minute'), id: 15},
    {name: "30"+i18n.t('common.minute'), id: 30},
    {name: "60"+i18n.t('common.minute'), id: 60},
    {name: "2"+i18n.t('labDevice.host'), id: 120},
    {name: "4"+i18n.t('labDevice.host'), id: 240},
    {name: "6"+i18n.t('labDevice.host'), id: 360},
    {name: "12"+i18n.t('labDevice.host'), id: 720},
    {name: "24"+i18n.t('labDevice.host'), id: 1440},
]
// 以后新开发需要的时候就用下面，上面英文和别的地方一样，容易搞混
export const HISTORYTIMEINTERVAL = [
    {name: "1"+i18n.t('common.minute'), id: 1},
    {name: "2"+i18n.t('common.minute'), id: 2},
    {name: "5"+i18n.t('common.minute'), id: 5},
    {name: "10"+i18n.t('common.minute'), id: 10},
    {name: "15"+i18n.t('common.minute'), id: 15},
    {name: "30"+i18n.t('common.minute'), id: 30},
    {name: "60"+i18n.t('common.minute'), id: 60},
    {name: "2"+i18n.t('labDevice.host'), id: 120},
    {name: "4"+i18n.t('labDevice.host'), id: 240},
    {name: "6"+i18n.t('labDevice.host'), id: 360},
    {name: "12"+i18n.t('labDevice.host'), id: 720},
    {name: "24"+i18n.t('labDevice.host'), id: 1440},
]

export const THINGTYPE = {
    4: i18n.t('common.equipment'),
    7: i18n.t('route.alarmAcousto'),
    11: i18n.t('common.room'),
    14: i18n.t('route.signalSource'),
}

export const THINGTYPE2 = {
    1: i18n.t('hardware.hardware'),
    2: i18n.t('common.equipment'),
    3: i18n.t('common.room'),
    4: "站点",
    5: "车辆",
    6: "运单",
    101: i18n.t('route.pipetteGun')

}

/**
 * 审批状态
 */
 export const APPROVALSTATUS = [
    {
        label: i18n.t('labDevice.auditOpinionated'),
        code: 1,
        value: "naColor"
    },
    {
        label: i18n.t('labDevice.rejected'),
        code: 2,
        value: "abnormal"
    },
    {
        label: i18n.t('labDevice.consented'),
        code: 3,
        value: "normal",
    },
    {
        label: i18n.t('labDevice.withdraw'),
        code: 4,
        value: "withdraw",
    },
    {
        label: i18n.t('labDevice.completed'),
        code: 5,
        value: "completed",
    },
];

// 报警通知
export const ALARMARRAY = [
    {name: i18n.t('hardware.alarmArray0'), id: 0},
    {name: i18n.t('hardware.alarmArray1'), id: 1},
    {name: i18n.t('hardware.alarmArray2'), id: 5},
    {name: i18n.t('hardware.alarmArray3'), id: 10},
    {name: i18n.t('hardware.alarmArray4'), id: 15},
    {name: i18n.t('hardware.alarmArray5'), id: 20},
    {name: i18n.t('hardware.alarmArray6'), id: 30},
    {name: i18n.t('hardware.alarmArray7'), id: 45},
    {name: i18n.t('hardware.alarmArray8'), id: 60},
    {name: i18n.t('hardware.alarmArray9'), id: 120},
    {name: i18n.t('hardware.alarmArray10'), id: 180},
]

// 未扫码取枪语音播报设置
export const BROADCAST = [
    {name: i18n.t('labDevice.broadcast1'), num: 1},
    {name: i18n.t('labDevice.broadcast'), num: 2},
    {name: i18n.t('labDevice.unBroadcast'), num: 0},
]

// 流程编号
export const FLOW_NUMBER = {
    checkAccept: "proc_warehousing"
}

// 智能硬件类型
export const HARDWARETYPES = [
    {
        label: i18n.t('hardware.gateway1'),
        code: 11,
    },
    {
        label: i18n.t('hardware.device1'),
        code: 0,
    },
    {
        label: i18n.t('route.smartSocket'),
        code: 10,
    },
    {
        label: i18n.t('route.powerOutageAlarm'),
        code: 8,
    },
    {
        label: i18n.t('route.alarmAcousto'),
        code: 7,
    },
    {
        label: i18n.t('route.signalSource'),
        code: 14,
    }
]

// 使用率算法设置
export const PERIODTYPES = [
    {
        label: i18n.t('common.workday'),
        value: 1
    },
    {
        label: i18n.t('common.naturalDay'),
        value: 2
    },
    {
        label: i18n.t('common.timeInterval'),
        value: 0
    }
]

// 移液枪时间维度
export const GUNTIME = [
    {
        value: 1,
        label: i18n.t('common.day2')
    },
    {
        value: 2,
        label: i18n.t('common.week')
    },
    {
        value: 3,
        label: i18n.t('common.month')
    },
]

// 记录仪使用状态 1-正常，2-闲置，3-维修，4-送检，5-暂停
export const DEVICE_USE_STATUS = {
    1: {str: i18n.t("common.normal"), className: "normal"},
    2: {str: i18n.t("transport.leaveUnused"), className: "blueColor"},
    3: {str: i18n.t("hardware.maintain"), className: "withdraw"},
    4: {str: i18n.t("hardware.detected1"), className: "blueColor"},
    5: {str: i18n.t("hardware.stop"), className: "color666"},
}

// 月份
export const MONTHS = [
    {name: i18n.t('common.january'), id: 1},
    {name: i18n.t('common.february'), id: 2},
    {name: i18n.t('common.march'), id: 3},
    {name: i18n.t('common.april'), id: 4},
    {name: i18n.t('common.may'), id: 5},
    {name: i18n.t('common.june'), id: 6},
    {name: i18n.t('common.july'), id: 7},
    {name: i18n.t('common.august'), id: 8},
    {name: i18n.t('common.september'), id: 9},
    {name: i18n.t('common.october'), id: 10},
    {name: i18n.t('common.november'), id: 11},
    {name: i18n.t('common.december'), id: 12},
]
