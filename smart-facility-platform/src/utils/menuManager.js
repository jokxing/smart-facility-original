import i18n from "@/i18n";
export const shebei1 = [
    {
        name: "主页",
        icon: "icon-home1",
        path: "/ld/labdevice",
        identify: "LabDeviceManager"
    },
    {
        name: "实验室设备",
        icon: "icon-equipment3",
        path: "/ld/watchlabdevice",
        identify: "LabDeviceWatchedManager"
    },
    {
        name: "IT设备",
        icon: "icon-equipment4",
        path: "/ld/unwatchlabdevice",
        identify: "LabDeviceUnwatchedManager"
    },
    {
        name: "行政设备",
        icon: "icon-equipment2",
        path: "/ld/administration",
        identify: "AdministrationManager"
    },
    {
        name: "预约管理",
        icon: "icon-reserve",
        path: "/ld/order",
        identify: "OrderManager"
    },
    {
        name: "维保管理",
        icon: "icon-icon-repair",
        path: "/ld/maintenance",
        identify: "MaintenanceManager"
    },
    {
        name: "资产统计",
        icon: "icon-data",
        path: "/asset/statistic",
        identify: "AssetStatistics"
    },
    {
        path: "/lhd/pipetteGun",
        name: "移液枪",
        icon: "icon-unbundle",
        identify: "PipetteGun"
    },
    {
        path: "/ld/assetCount",
        name: "资产盘点",
        icon: "icon-unbundle",
        identify: "AssetCount"
    }
]
export const shebei2 = [
    {
        name: "主页",
        icon: "icon-home1",
        path: "/asset/statistic",
        identify: "AssetStatistics"
    },
    {
        name: "资产管理",
        icon: "icon-equipment3",
        path: "/asset",
        identify: "LabDeviceWatchedManager"
    },
    {
        name: "流程管理",
        icon: "icon-equipment5",
        path: "/asset/management",
        identify: "AssetManagement"
    },
    {
        name: "维保管理",
        icon: "icon-equipment2",
        path: "/asset/maintenance",
        identify: "AdministrationManager"
    },
    {
        name: "分类管理",
        icon: "icon-reserve",
        path: "/asset/classify",
        identify: "OrderManager"
    }
]
export const menuList = [
    {
        id: "lhd",
        name: i18n.t('route.hardware'),
        icon: require("../assets/bashboard/icon-instrument.png"),
        path: "/lhd/hardware/home",
        children: [
            {
                path: "/lhd/hardware/home",
                name: "主页",
                icon: "icon-home1",
                identify: "HardwareHome"
            },
            {
                path: "/lhd/gateway",
                name: "集中器管理",
                icon: "icon-gateway1",
                identify: "GatewayManager"
            },
            {
                path: "/lhd/device",
                name: "记录仪管理",
                icon: "icon-device1",
                identify: "RecorderManager"
            },
            {
                path: "/lhd/smartSocket",
                name: "设备管理器",
                icon: "icon-equipment5",
                identify: "SmartSocketManager"
            },
            {
                path: "/lhd/alertor",
                name: "声光报警器",
                icon: "icon-Audible-alarm",
                identify: "AlarmsManager"
            },
            {
                path: "/lhd/signal/source",
                name: "信号接收器",
                icon: "icon-signal-reception",
                identify: "SignalSource"
            },
            {
                path: "/lhd/powerOutageAlarm",
                name: "断电报警器",
                icon: "icon-power-outage1",
                identify: "PowerOutageAlarm"
            },
            // {
            //   path: "/lhd/detect",
            //   name: "送检管理",
            //   icon: "icon-icon-repair",
            //   identify: "detect"
            // },
            {
                path: "/lhd/downloadSuite",
                name: "工具包下载",
                icon: "icon-download2",
                identify: "downloadSuite"
            },
            {
                path: "/lhd/data/export",
                name: "数据导出",
                icon: "icon-download2",
                identify: "downloadSuite"
            },
            {
                path: "/lhd/pipetteGunRack",
                name: "移液枪管理器",
                icon: "icon-unbundle",
                identify: "PipetteGun"
            },
            {
                path: "/lhd/assetTag",
                name: "资产标签与网关",
                icon: "icon-unbundle",
                identify: "AssetTag"
            },
        ]
    },
    {
        id: "ld",
        name: i18n.t('route.labDevice'),
        icon: require("../assets/bashboard/icon-smart-hardware.png"),
        path: "/ld/labdevice",
        children: shebei1
    },
    {
        id: "rm",
        name: i18n.t('route.room'),
        icon: require("../assets/bashboard/icon-room.png"),
        path: "/rm/room",
        children: [
            {
                path: "/rm/room",
                name: "房间管理",
                icon: "icon-home1",
                identify: "RoomManager"
            },
            {
                path: "/rm/room/report",
                name: "巡查管理",
                icon: "icon-document",
                identify: "RoomReportManager"
            }
        ]
    },
    {
        id: "mnt",
        name: i18n.t('route.maintenance'),
        icon: require("../assets/bashboard/icon-instrument.png"),
        path: "/ld/maintenance",
        children: [
            {
                path: "/ld/maintenance",
                name: "维保管理",
                icon: "icon-icon-repair",
                identify: "MaintenanceManager"
            }
        ]
    },
    {
        id: "ds",
        name: i18n.t('route.statistics'),
        icon: require("../assets/bashboard/icon-statistical.png"),
        path: "/ds/statistics",
        children: [
            {
                path: "/ds/statistics",
                name: "数据统计",
                icon: "icon-statistics",
                identify: "StatisticsManager"
            },
            {
                path: "/ds/device/chart",
                name: "记录仪图表统计",
                icon: "icon-statistical",
                identify: "StatisticsManager"
            }
        ]
    },

    {
        id: "sys",
        name: i18n.t('route.system'),
        icon: require("../assets/bashboard/icon-system.png"),
        path: "/sys/user",
        children: [
            {
                name: "公司基本信息",
                icon: "icon-company",
                path: "/sys/base",
                identify: "companInfoManager"
            },
            {
                name: "个人基本信息",
                icon: "icon-staff-settings",
                path: "/sys/user",
                identify: "userInfoManager"
            },
            {
                name: "部门与成员",
                icon: "icon-employee",
                path: "/sys/department",
                identify: "DepartmentManager"
            },
            {
                name: "角色管理",
                icon: "icon-set-up",
                path: "/sys/role",
                identify: "RolePermissionManager"
            },
            {
                name: "日志",
                icon: "icon-log",
                path: "/sys/log",
                identify: "LogManager"
            },
            {
                name:"设备等级",
                path: "/sys/grade",
                icon: "SysGrade"
            },
            {
                name:"通知群组",
                path: "/sys/noticeGroup",
                icon: "NoticeGroup"
            },
        ]
    },
    // {
    //   id: "ccm",
    //   name: "中控地图设置",
    //   icon: "icon-map",
    //   path: "/dataV",
    // },
    {
        id: "ms",
        name: "地图设置",
        icon: "../../src/assets/bashboard/icon-map.png",
        path: "/ms/mapSet"
    }
];
