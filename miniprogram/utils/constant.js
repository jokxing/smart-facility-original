import baseUrl from './config.js'
import i18n from "../lang/index.js"
// 图片拼接路径
export const BASE_URL = baseUrl + "/api/file/picUrl?fileName=";

// 参数状态
export const MONITORSTATUS = [
	{
		label: i18n.t('other.normal'),
		code: 1,
		value: "normal",
	},
	{
		label: i18n.t('other.abnormal'),
		code: 2,
		value: "abnormal",
	},
	{
		label: i18n.t('other.offLine'),
		code: -100,
		value: "offLine",
	},
	{
		label: "-",
		code: 4,
		value: ""
	},
];

// 运行状态
export const LABSTATUS = [
    {
        label: i18n.t('other.run'),
        code: 1,
        value: "run",
    },
    {
        label: i18n.t('other.standby'),
        code: 2,
        value: "standby",
    },
    {
        label: i18n.t('other.standby'),
        code: 0,
        value: "off",
    },
    {
        label: i18n.t('other.maintain'),
        code: 3,
        value: "maintain",
    },
    {
        label: "-",
        code: 4,
        value: ""
    }
];

/**** 参数状态：新建0、正常1 为绿色 ****/
export const GREENSTATUS = [0 ,1];

/**** 特殊记录仪处理图表显示 ****/
export const DATA_ZOOM = {
    17: [true, i18n.t('other.break'), i18n.t('other.normal')],
    16: [true, i18n.t('other.open'), i18n.t('other.close1')],
    26: [true, i18n.t('other.retting'), i18n.t('other.notRetting')],
    33: [true, i18n.t('other.close2'), i18n.t('other.open')]
};
export const DATAZOOM = {
    16: [true, i18n.t('other.open'), i18n.t('other.close1')],
	17: [true, i18n.t('other.break'), i18n.t('other.notBroken')],
	26: [true, i18n.t('other.retting'), i18n.t('other.notRetting')],
	33: [true, i18n.t('other.open'), i18n.t('other.close2')],
	45: [true, i18n.t('other.break'), i18n.t('other.notBroken')],
	48: [true, i18n.t('other.abnormal'), i18n.t('other.normal')],
	1001: [true, i18n.t('other.break'), i18n.t('other.notBroken')],
};

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

/**
 *  26 水浸, 16 断电, 17 门磁
 * @type {{"26": boolean, "16": boolean, "17": boolean}}
 */

export const DEVICE_ID = {
    16: true,
    17: true,
    26: true,
    33: true,
	45: true,
	48: true,
	1001: true
}

/**
 * 移液枪归位状态
 */
 export const GUNSTATUS = [
    {
        label: i18n.t('other.homing'),
        code: 0,
        value: "homing"
    },
    {
        label: i18n.t('other.noHoming'),
        code: 1,
        value: "noHoming",
    },
    {
        label: i18n.t('other.errorHoming'),
        code: 2,
        value: "errorHoming"
    },
];

/**
 * 移液枪架状态
 */
 export const GUNRACKSTATUS = [
    {
        label: i18n.t('other.newCreate'),
        code: 0,
        value: "noHoming"
    },
    {
        label: i18n.t('other.isLine'),
        code: 1,
        value: "normal",
    },
    {
        label: i18n.t('other.offLine'),
        code: -100,
        value: "offline"
    },
];

/**
 * 绑定状态
 */
 export const BINDSTATUS = [
    {
        label: i18n.t('other.bind'),
        code: 0,
        value: "golden"
    },
    {
        label: i18n.t('other.isbind'),
        code: 1,
        value: "grey999",
    },
];

/**
 * 资产标签状态
 */
 export const ASSETTAGSTATUS = [
    {
        label: i18n.t('home.monitoring'),
        code: 1,
        value: "blueColor"
    },
    {
        label: i18n.t('other.notConnect'),
        code: 0,
        value: "offLine"
    },
    {
        label: i18n.t('other.notMonitored'),
        code: 2,
        value: "color666",
    },
];

// 播报设置
export const BROADCAST = [
    {name: i18n.t('other.broadCast'), num: 1},
    {name: i18n.t('other.broadCast1'), num: 2},
    {name: i18n.t('other.broadCast2'), num: 0},
]

// 设备类型
export const INSTRUMENTTYPE = [
    {
        label: i18n.t('other.labDevice'),
        code: 1,
    },
    {
        label: i18n.t('other.administrativeDevice'),
        code: 2,
    },
    {
        label: i18n.t('other.iTDevice'),
        code: 3,
    },
];
