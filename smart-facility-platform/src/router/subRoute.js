const childRouters = {
    '/lhd/hardware/home': {
        //
        path: "/lhd/hardware/home",
        name: "Gateway",
        component: r =>
            require.ensure([], () =>
                r(
                    require(/* webpackChunkName: "smartSocket" */ "../views/hardwareHome/HardwareHome")
                )
            ),
        meta: {
            title: "home"
        }
    },
    '/lhd/gateway': {
        //集中器
        path: "/lhd/gateway",
        name: "Gateway",
        component: r =>
            require.ensure([], () =>
                r(
                    require(/* webpackChunkName: "smartSocket" */ "../views/gateway/Gateway")
                )
            ),
        meta: {
            title: "gateway"
        }
    },
    '/lhd/device': {
        //记录仪
        path: "/lhd/device",
        name: "Device",
        component: () => import("../views/device/Device"),
        meta: {
            title: "device"
        },
    },
    '/rm/room': {
        //房间
        path: "/rm/room",
        name: "Room",
        component: () => import("../views/room/Room"),
        meta: {
            title: "home"
        }
    },
    '/rm/room/report': {
        //巡查管理
        path: "/rm/room/report",
        name: "RoomReport",
        component: () => import("../views/roomReport/RoomReport"),
        meta: {
            title: "roomReport"
        }
    },
    '/lhd/alertor': {
        //声光报警器
        path: "/lhd/alertor",
        name: "AlarmAcousto",
        component: () => import("../views/alarmAcousto/AlarmAcousto"),
        meta: {
            title: "alarmAcousto"
        }
    },
    "/lhd/powerOutageAlarm": {
        // 断电报警器
        path: "/lhd/powerOutageAlarm",
        name: "PowerOutageAlarm",
        component: () =>
            import("../views/powerOutageAlarm/PowerOutageAlarm"),
        meta: {
            title: "powerOutageAlarm"
        }
    },
    '/lhd/signal/source': {
        // 信号接收源
        path: "/lhd/signal/source",
        name: "SignalSource",
        component: () =>
            import("../views/signalSource/SignalSource"),
        meta: {
            title: "signalSource"
        }
    },
    "/lhd/data/export": {
        // 数据导出
        path: "/sys/data/export",
        name: "DataExport",
        component: () =>
            import("../views/dataExport/DataExport"),
        meta: {
            title: "dataExport"
        }
    },
    "/lhd/downloadSuite": {
        // 下载工具
        path: "/lhd/downloadSuite",
        name: "DownloadSuite",
        component: () => import("../views/downloadSuite/DownloadSuite"),
        meta: {
            title: "downloadSuite"
        }
    },
    "/lhd/assetTag": {
        // 资产标签与网关
        path: "/lhd/assetTag",
        name: "AssetTag",
        component: () => import("../views/assetTag/index"),
        meta: {
            title: "assetTag"
        },
    },
    "/ld/assetCount": {
        // 资产盘点
        path: "/ld/assetCount",
        name: "AssetCount",
        component: () => import("../views/assetCount/index"),
        meta: {
            title: "assetCount"
        },
        redirect: "/ld/assetCount/assetCount",
        children: [
            {
                // 盘点配置与资产移动明细
                path: "/ld/assetCount/assetCount",
                name: "AssetCount",
                component: () =>
                    import("../views/assetCount/AssetCount"),
                meta: {
                    title: "assetCount1"
                }
            },
            {
                // 资产统计月度报告与排行
                path: "/ld/assetCount/ReportAndRanking",
                name: "ReportAndRanking",
                component: () =>
                    import("../views/assetCount/ReportAndRanking"),
                meta: {
                    title: "reportAndRanking"
                }
            },
        ]
    },
    "/lhd/smartSocket": {
        path: "/lhd/smartSocket",
        name: "SmartSocket",
        component: r =>
            require.ensure([], () =>
                r(
                    require(/* webpackChunkName: "smartSocket" */ "../views/smartSocket/SmartSocket")
                )
            ),
        meta: {
            title: "smartSocket"
        }
    },
    "/lhd/detect": {
        path: "/lhd/detect",
        name: "Detect",
        component: () =>
            import(/* webpackChunkName: "detect" */ "../views/detect/Detect"),
        meta: {
            title: "detect"
        }
    },
    "/ds/statistics": {
        path: "/ds/statistics",
        name: "Statistics",
        component: () =>
            import(
                /* webpackChunkName: "statistics" */ "../views/statistics/Statistics"
                ),
        meta: {
            title: "statistics",
            name: "statistics",
            icon: "icon-statistics",
            noCache: true,
            jumpPath: "/statistics"
        }
    },
    "/ds/device/chart": {
        path: "/ds/device/chart",
        name: "DeviceChart",
        component: () =>
            import(/* webpackChunkName: "statistics" */ "../views/deviceChart/DeviceChart"),
        meta: {
            title: "deviceChart",
            name: "deviceChart",
            icon: "icon-statistics",
            noCache: true,
            jumpPath: "/statistics"
        }
    },
    "/ld/labdevice": {
        path: "/ld/labdevice",
        name: "Labdevice",
        component: () => import("../views/labDevice"),
        meta: {
            title: "home"
        }
    },
    "/asset": {
        path: "/asset",
        name: "Labdevice",
        component: () => import("../views/labDevice"),
        meta: {
            title: "asset"
        }
    },
    "AssetMaintenance": {
        path: "/asset/maintenance",
        name: "AssetMaintenance",
        component: () => import("../views/assetMaintenance/AssetMaintenance"),
        meta: {
            title: "maintenance"
        }
    },
    "/ld/classify/system": {
        path: "/ld/classify/system",
        name: "ClassifySystem",
        component: () => import("../views/classifySystem/ClassifySystem"),
        meta: {
            title: "assetClassify"
        }
    },
    "/asset/management": {
        path: "/asset/management",
        name: "AssetManagement",
        component: () => import("../views/assetManagement/AssetManagement"),
        meta: {
            title: "assetManagement"
        }
    },
    "/ld/watchlabdevice": {
        path: "/ld/watchlabdevice",
        name: "WatchedLabdevice",
        component: () => import("../views/labDevice"),
        meta: {
            title: "watchlabdevice"
        }
    },
    "/ld/unwatchlabdevice": {
        path: "/ld/unwatchlabdevice",
        name: "UnWatchedDevice",
        component: () => import("../views/labDevice"),
        meta: {
            title: "unwatchlabdevice"
        }
    },
    "/ld/administration": {
        path: "/ld/administration",
        name: "Administration",
        component: () => import("../views/labDevice"),
        meta: {
            title: "administration"
        }
    },
    "/ld/pipetteGun": {
        path: "/ld/pipetteGun",
        name: "gun",
        component: () => import("../views/pipetteGun/index"),
        meta: {
            title: "pipetteGun"
        },
        redirect: "/ld/pipetteGun/pipetteGun",
        children: [
            {
                // 移液枪
                path: "/ld/pipetteGun/pipetteGun",
                name: "PipetteGun",
                component: () =>
                    import("../views/pipetteGun/pipetteGun"),
                meta: {
                    title: "pipetteGun"
                }
            },
            {
                // 移液枪管理器
                path: "/ld/pipetteGun/pipetteGunRack",
                name: "pipetteGunRack",
                component: () =>
                    import("../views/pipetteGunRack/index"),
                meta: {
                    title: "pipetteGunRack"
                }
            },
        ]
    },
    "/ld/order": {
        path: "/ld/order",
        name: "OrderManager",
        component: () => import("../views/orderManager"),
        meta: {
            title: "orderManager"
        }
    },
    "/asset/statistic": {
        path: "/asset/statistic",
        name: "AssetStatistics",
        component: () => import("../views/assetStatistics/AssetStatistics"),
        meta: {
            title: "assetStatistics"
        }
    },
    "/ld/asset/process": {
        path: "/ld/asset/process",
        name: "AssetProcess",
        component: () => import("../views/assetProcess/AssetProcess"),
        meta: {
            title: "assetProcess"
        },
        redirect: "/ld/asset/process/checkAndAccept",
        children: [
            {
                path: "/ld/asset/process/purchaseRequest",
                name: "PurchaseRequest",
                component: () => import("../views/assetProcess/components/PurchaseRequest"),
                meta: {
                    title: "assetProcess"
                },
            },
            {
                path: "/ld/asset/process/checkAndAccept",
                name: "CheckAndAccept",
                component: () => import("../views/assetProcess/components/CheckAndAccept"),
                meta: {
                    title: "purchaseRequest"
                },
            },
            {
                path: "/ld/asset/process/requisition",
                name: "Requisition",
                component: () => import("../views/assetProcess/components/Requisition"),
                meta: {
                    title: "assetProcess",
                    bill: "processRequisition"
                },
            },
            {
                path: "/ld/asset/process/giveBack",
                name: "GiveBack",
                component: () => import("../views/assetProcess/components/FlowSheetList"),
                meta: {
                    title: "assetProcess",
                    bill: "退还"
                },
            },
            {
                path: "/ld/asset/process/borrow",
                name: "Borrow",
                component: () => import("../views/assetProcess/components/FlowSheetList"),
                meta: {
                    title: "assetProcess",
                    bill: "借用"
                },
            },
            {
                path: "/ld/asset/process/sendBack",
                name: "SendBack",
                component: () => import("../views/assetProcess/components/FlowSheetList"),
                meta: {
                    title: "assetProcess",
                    bill: "归还"
                },
            },
            {
                path: "/ld/asset/process/management",
                name: "Management",
                component: () => import("../views/assetProcess/components/FlowSheetList"),
                meta: {
                    title: "assetProcess",
                    bill: "报修"
                },
            }
        ]
    },
    "/ms/mapSet": {
        path: "/ms/mapSet",
        name: "MapSettings",
        component: () => import("../views/mapSettings/MapSettings"),
        meta: {
            title: "mapSettings"
        }
    },
    "/ld/maintenance": {
        path: "/ld/maintenance",
        name: "Maintenance",
        component: () => import("../views/maintenance"),
        meta: {
            title: "maintenance"
        }
    },
    "/sys/base": {
        path: "/sys/base",
        name: "SystemInfo",
        component: () => import("../views/system/Base.vue"),
        meta: {
            title: "sysbase"
        }
    },
    "/sys/user": {
        path: "/sys/user",
        name: "User",
        component: () => import("../views/system/User.vue"),
        meta: {
            title: "sysUser"
        }
    },
    "/sys/aliyunCostReportLog": {
        path: "/sys/aliyunCostReportLog",
        name: "aliyunCostReportLog",
        component: () => import("../views/system/aliyunCostReportLog.vue"),
        meta: {
            title: "aliyunCostReportLog"
        }
    },
    "/sys/department": {
        path: "/sys/department",
        name: "SystemDepartment",
        component: () => import("../views/system/Department.vue"),
        meta: {
            title: "sysDepartment"
        }
    },
    "/sys/role": {
        path: "/sys/role",
        name: "SystemRole",
        component: () => import("../views/system/Role.vue"),
        meta: {
            title: "sysRole"
        }
    },
    "/ld/approval/process": {
        path: "/ld/approval/process",
        name: "ApprovalProcess",
        component: () => import("../views/approvalProcess/ApprovalProcess.vue"),
        meta: {
            title: "approvalProcess"
        },
        redirect: "/ld/approval/process/assetDocument",
        children: [
            {
                path: "/ld/approval/process/assetDocument",
                name: "AssetDocument",
                component: () => import("../views/approvalProcess/components/AssetDocument.vue"),
                meta: {
                    title: "approvalProcess"
                },
            },
            {
                path: "/ld/approval/process/consumableDocument",
                name: "ConsumableDocument",
                component: () => import("../views/approvalProcess/components/ConsumableDocument.vue"),
                meta: {
                    title: "approvalProcess"
                },
            }
        ]
    },
    "/ld/approval/process/set/": {
        path: "/ld/approval/process/set/:id/:typeName",
        name: "ApprovalProcessSet",
        component: () => import("../views/approvalProcess/components/ApprovalProcessSet.vue"),
        meta: {
            title: "approvalProcessSet"
        },
    },
    "/sys/log": {
        path: "/sys/log",
        name: "SystemLog",
        component: () => import("../views/system/Log.vue"),
        meta: {
            title: "syslog"
        }
    },
    "/sys/grade": {
        path: "/sys/grade",
        name: "SysGrade",
        component: () => import("../views/system/SysGrade"),
        meta: {
            title: "sysGrade"
        }
    },
    "/sys/noticeGroup": {
        path: "/sys/noticeGroup",
        name: "NoticeGroup",
        component: () => import("../views/system/NoticeGroup"),
        meta: {
            title: "sysNoticeGroup"
        }
    },
    "/tp/transport": {
        path: "/tp/transport",
        name: "Transport",
        component: () => import("../views/transport"),
        meta: {
            title: "home"
        }
    },
    "/tp/transport/basicSetting": {
        path: "/tp/transport/basicSetting",
        name: "TransportBasicSetting",
        component: () => import("../views/transport/transportBasicSetting"),
        meta: {
            title: "basicSetting"
        }
    },
    "/tp/transport/refrigeratedTruck": {
        path: "/tp/transport/refrigeratedTruck",
        name: "refrigeratedTruck",
        component: () => import("../views/transport/refrigeratedTruck"),
        meta: {
            title: "冷藏车管理"
        }
    },
    "/tp/transport/waybill": {
        path: "/tp/transport/waybill",
        name: "transportWaybill",
        component: () => import("../views/transport/waybill"),
        meta: {
            title: "运单管理"
        }
    },
    "/tp/transport/commodity/maintain": {
        path: "/tp/transport/commodity/maintain",
        name: "CommodityMaintain",
        component: () => import("../views/transport/CommodityMaintain"),
        meta: {
            title: "品名维护"
        }
    },
    "/tp/transport/deliver/unit": {
        path: "/tp/transport/deliver/unit",
        name: "DeliverUnit",
        component: () => import("../views/transport/DeliverUnit"),
        meta: {
            title: "发货单位"
        }
    },
    "/tp/transport/receipt/unit": {
        path: "/tp/transport/receipt/unit",
        name: "ReceiptUnit",
        component: () => import("../views/transport/ReceiptUnit"),
        meta: {
            title: "收货单位"
        }
    },
}