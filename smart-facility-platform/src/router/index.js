import Vue from "vue";
import VueRouter from "vue-router";
import Layout from "../views/layout/Layout";

Vue.use(VueRouter);
const floorDesignerRoute = {
    path: "/floor/designer",
    name: "FloorDesigner",
    component: () => import("../views/floorConfiguar/Layout.vue"),
    meta: {title: "floorConfiguar"}
};
const roomDesignerRoute = {
    path: "/room/designer",
    name: "RoomDesigner",
    component: () => import("../views/roomConfiguar/Layout.vue"),
    meta: {title: "roomConfiguar"}
};
const isDemo = process.env.VUE_APP_DEMO === "true";
export const routes = [
    {
        path: "/",
        component: Layout,
        redirect: "/dashboard",
        children: [
            {
                path: "/pro", //左列表结构
                component: () => import("../views/layout/SubLayout"),
                redirect: "/lhd/hardware/home",
                children: [
                    {
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
                    {
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
                    {
                        //记录仪
                        path: "/lhd/device",
                        name: "Device",
                        component: () => import("../views/device/Device"),
                        meta: {
                            title: "device"
                        },
                    },
                    {
                        //房间
                        path: "/rm/room",
                        name: "Room",
                        component: () => import("../views/room/Room"),
                        meta: {
                            title: "home"
                        }
                    },
                    {
                        //巡查管理
                        path: "/apply/room/report",
                        name: "RoomReport",
                        component: () => import("../views/roomReport/RoomReport"),
                        meta: {
                            title: "roomReport"
                        }
                    },
                    {
                        //声光报警器
                        path: "/lhd/alertor",
                        name: "AlarmAcousto",
                        component: () => import("../views/alarmAcousto/AlarmAcousto"),
                        meta: {
                            title: "alarmAcousto"
                        }
                    },
                    {
                        // 断电报警器
                        path: "/lhd/powerOutageAlarm",
                        name: "PowerOutageAlarm",
                        component: () =>
                            import("../views/powerOutageAlarm/PowerOutageAlarm"),
                        meta: {
                            title: "powerOutageAlarm"
                        }
                    },
                    {
                        // 信号接收源
                        path: "/lhd/signal/source",
                        name: "SignalSource",
                        component: () =>
                            import("../views/signalSource/SignalSource"),
                        meta: {
                            title: "signalSource"
                        }
                    },
                    {
                        // 数据导出
                        path: "/sys/data/export",
                        name: "DataExport",
                        component: () =>
                            import("../views/dataExport/DataExport"),
                        meta: {
                            title: "dataExport"
                        }
                    },
                    {
                        // 下载工具
                        path: "/sys/downloadSuite",
                        name: "DownloadSuite",
                        component: () => import("../views/downloadSuite/DownloadSuite"),
                        meta: {
                            title: "downloadSuite"
                        }
                    },
                    {
                        // 资产标签与网关
                        path: "/lhd/assetTag",
                        name: "AssetTag",
                        component: () => import("../views/assetTag/index"),
                        meta: {
                            title: "assetTag"
                        },
                    },
                    {
                        // 资产盘点
                        path: "/apply/assetCount",
                        name: "AssetCount",
                        component: () => import("../views/assetCount/index"),
                        meta: {
                            title: "assetCount"
                        },
                        redirect: "/apply/assetCount/assetCount",
                        children: [
                            {
                                // 盘点配置与资产移动明细
                                path: "/apply/assetCount/assetCount",
                                name: "AssetCount",
                                component: () =>
                                    import("../views/assetCount/AssetCount"),
                                meta: {
                                    title: "assetCount1"
                                }
                            },
                            {
                                // 资产统计月度报告与排行
                                path: "/apply/assetCount/ReportAndRanking",
                                name: "ReportAndRanking",
                                component: () =>
                                    import("../views/assetCount/ReportAndRanking"),
                                meta: {
                                    title: "reportAndRanking"
                                }
                            },
                        ]
                    },
                    {
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
                    {
                        path: "/lhd/doorMagneticCamera",
                        name: "DoorMagneticCamera",
                        component: r =>
                            require.ensure([], () =>
                                r(
                                    require("../views/doorMagneticCamera/index")
                                )
                            ),
                        meta: {
                            title: "doorMagneticCamera"
                        }
                    },
                    {
                        path: "/apply/detect",
                        name: "Detect",
                        component: () =>
                            import(/* webpackChunkName: "detect" */ "../views/detect/Detect"),
                        meta: {
                            title: "detect"
                        }
                    },
                    {
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
                    {
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
                    {
                        path: "/ld/labdevice",
                        name: "Labdevice",
                        component: () => import("../views/labDevice"),
                        meta: {
                            title: "home"
                        }
                    },
                    {
                        path: "/ld/use/stat/charts",
                        name: "useStatCharts",
                        component: () => import("../views/labDevice/useStatCharts"),
                        meta: {
                            title: "equipmentUseGrade"
                        }
                    },
                    {
                        path: "/ld/use/stat",
                        name: "useStat",
                        component: () => import("../views/labDevice/useStat"),
                        meta: {
                            title: "equipmentUseStat"
                        }
                    },
                    {
                        path: "/asset",
                        name: "Labdevice",
                        component: () => import("../views/labDevice"),
                        meta: {
                            title: "asset"
                        }
                    },
                    {
                        path: "/asset/maintenance",
                        name: "AssetMaintenance",
                        component: () => import("../views/assetMaintenance/AssetMaintenance"),
                        meta: {
                            title: "maintenance"
                        }
                    },
                    {
                        path: "/sys/classify/system",
                        name: "ClassifySystem",
                        component: () => import("../views/classifySystem/ClassifySystem"),
                        meta: {
                            title: "assetClassify"
                        }
                    },
                    {
                        path: "/asset/management",
                        name: "AssetManagement",
                        component: () => import("../views/assetManagement/AssetManagement"),
                        meta: {
                            title: "assetManagement"
                        }
                    },
                    {
                        path: "/ld/watchlabdevice",
                        name: "WatchedLabdevice",
                        component: () => import("../views/labDevice"),
                        meta: {
                            title: "watchlabdevice"
                        }
                    },
                    {
                        path: "/ld/unwatchlabdevice",
                        name: "UnWatchedDevice",
                        component: () => import("../views/labDevice"),
                        meta: {
                            title: "unwatchlabdevice"
                        }
                    },
                    {
                        path: "/ld/administration",
                        name: "Administration",
                        component: () => import("../views/labDevice"),
                        meta: {
                            title: "administration"
                        }
                    },
                    {
                        path: "/lhd/pipetteGun",
                        name: "gun",
                        component: () => import("../views/pipetteGun/index"),
                        meta: {
                            title: "pipetteGunRack"
                        },
                        redirect: "/lhd/pipetteGun/pipetteGun",
                        children: [
                            {
                                // 移液枪
                                path: "/lhd/pipetteGun/pipetteGun",
                                name: "PipetteGun",
                                component: () =>
                                    import("../views/pipetteGun/pipetteGun"),
                                meta: {
                                    title: "pipetteGun"
                                }
                            },
                            {
                                // 移液枪管理器
                                path: "/lhd/pipetteGun/pipetteGunRack",
                                name: "pipetteGunRack",
                                component: () =>
                                    import("../views/pipetteGunRack/index"),
                                meta: {
                                    title: "pipetteGunRack"
                                }
                            },
                        ]
                    },
                    {
                        path: "/apply/order",
                        name: "OrderManager",
                        component: () => import("../views/orderManager"),
                        meta: {
                            title: "orderManager"
                        }
                    },
                    {
                        path: "/asset/statistic",
                        name: "AssetStatistics",
                        component: () => import("../views/assetStatistics/AssetStatistics"),
                        meta: {
                            title: "assetStatistics"
                        }
                    },
                    {
                        path: "/apply/asset/process",
                        name: "AssetProcess",
                        component: () => import("../views/assetProcess/AssetProcess"),
                        meta: {
                            title: "assetProcess"
                        },
                        redirect: "/apply/asset/process/checkAndAccept",
                        children: [
                            {
                                path: "/apply/asset/process/purchaseRequest",
                                name: "PurchaseRequest",
                                component: () => import("../views/assetProcess/components/PurchaseRequest"),
                                meta: {
                                    title: "assetProcess"
                                },
                            },
                            {
                                path: "/apply/asset/process/checkAndAccept",
                                name: "CheckAndAccept",
                                component: () => import("../views/assetProcess/components/CheckAndAccept"),
                                meta: {
                                    title: "purchaseRequest"
                                },
                            },
                            {
                                path: "/apply/asset/process/requisition",
                                name: "Requisition",
                                component: () => import("../views/assetProcess/components/Requisition"),
                                meta: {
                                    title: "assetProcess",
                                    bill: "processRequisition"
                                },
                            },
                            {
                                path: "/apply/asset/process/giveBack",
                                name: "GiveBack",
                                component: () => import("../views/assetProcess/components/FlowSheetList"),
                                meta: {
                                    title: "assetProcess",
                                    bill: "退还"
                                },
                            },
                            {
                                path: "/apply/asset/process/borrow",
                                name: "Borrow",
                                component: () => import("../views/assetProcess/components/FlowSheetList"),
                                meta: {
                                    title: "assetProcess",
                                    bill: "借用"
                                },
                            },
                            {
                                path: "/apply/asset/process/sendBack",
                                name: "SendBack",
                                component: () => import("../views/assetProcess/components/FlowSheetList"),
                                meta: {
                                    title: "assetProcess",
                                    bill: "归还"
                                },
                            },
                            {
                                path: "/apply/asset/process/management",
                                name: "Management",
                                component: () => import("../views/assetProcess/components/FlowSheetList"),
                                meta: {
                                    title: "assetProcess",
                                    bill: "报修"
                                },
                            }
                        ]
                    },
                    {
                        path: "/ms/mapSet",
                        name: "MapSettings",
                        component: () => import("../views/mapSettings/MapSettings"),
                        meta: {
                            title: "mapSettings"
                        }
                    },
                    {
                        path: "/apply/maintenance",
                        name: "Maintenance",
                        component: () => import("../views/maintenance"),
                        meta: {
                            title: "maintenance"
                        }
                    },
                    {
                        path: "/sys/base",
                        name: "SystemInfo",
                        component: () => import("../views/system/Base.vue"),
                        meta: {
                            title: "sysbase"
                        }
                    },
                    {
                        path: "/sys/user",
                        name: "User",
                        component: () => import("../views/system/User.vue"),
                        meta: {
                            title: "sysUser"
                        }
                    },
                    {
                        path: "/sys/aliyunCostReportLog",
                        name: "aliyunCostReportLog",
                        component: () => import("../views/system/aliyunCostReportLog.vue"),
                        meta: {
                            title: "aliyunCostReportLog"
                        }
                    },
                    {
                        path: "/sys/department",
                        name: "SystemDepartment",
                        component: () => import("../views/system/Department.vue"),
                        meta: {
                            title: "sysDepartment"
                        }
                    },
                    {
                        path: "/sys/role",
                        name: "SystemRole",
                        component: () => import("../views/system/Role.vue"),
                        meta: {
                            title: "sysRole"
                        }
                    },
                    {
                        path: "/apply/approval/process",
                        name: "ApprovalProcess",
                        component: () => import("../views/approvalProcess/ApprovalProcess.vue"),
                        meta: {
                            title: "approvalProcess"
                        },
                        redirect: "/apply/approval/process/assetDocument",
                        children: [
                            {
                                path: "/apply/approval/process/assetDocument",
                                name: "AssetDocument",
                                component: () => import("../views/approvalProcess/components/AssetDocument.vue"),
                                meta: {
                                    title: "approvalProcess"
                                },
                            },
                            {
                                path: "/apply/approval/process/consumableDocument",
                                name: "ConsumableDocument",
                                component: () => import("../views/approvalProcess/components/ConsumableDocument.vue"),
                                meta: {
                                    title: "approvalProcess"
                                },
                            }
                        ]
                    },
                    {
                        path: "/apply/approval/process/set/:id/:typeName",
                        name: "ApprovalProcessSet",
                        component: () => import("../views/approvalProcess/components/ApprovalProcessSet.vue"),
                        meta: {
                            title: "approvalProcessSet"
                        },
                    },
                    {
                        path: "/sys/log",
                        name: "SystemLog",
                        component: () => import("../views/system/Log.vue"),
                        meta: {
                            title: "syslog"
                        }
                    },
                    {
                        path: "/sys/grade",
                        name: "SysGrade",
                        component: () => import("../views/system/SysGrade"),
                        meta: {
                            title: "sysGrade"
                        }
                    },
                    {
                        path: "/sys/noticeGroup",
                        name: "NoticeGroup",
                        component: () => import("../views/system/NoticeGroup"),
                        meta: {
                            title: "sysNoticeGroup"
                        }
                    },
                    {
                        path: "/sys/a/log",
                        name: "AlarmLog",
                        component: () => import("../views/alarmLog/index"),
                        meta: {
                            title: "alarmLog"
                        }
                    },
                    {
                        path: "/apply/transport",
                        name: "Transport",
                        component: () => import("../views/transport"),
                        meta: {
                            title: "home"
                        }
                    },
                    {
                        path: "/apply/transport/basicSetting",
                        name: "TransportBasicSetting",
                        component: () => import("../views/transport/transportBasicSetting"),
                        meta: {
                            title: "basicSetting"
                        }
                    },
                    {
                        path: "/apply/transport/refrigeratedTruck",
                        name: "refrigeratedTruck",
                        component: () => import("../views/transport/refrigeratedTruck"),
                        meta: {
                            title: "refrigeratedTruck"
                        }
                    },
                    {
                        path: "/apply/transport/waybill",
                        name: "transportWaybill",
                        component: () => import("../views/transport/waybill"),
                        meta: {
                            title: "waybill"
                        }
                    },
                    {
                        path: "/apply/transport/commodity/maintain",
                        name: "CommodityMaintain",
                        component: () => import("../views/transport/CommodityMaintain"),
                        meta: {
                            title: "maintain"
                        }
                    },
                    {
                        path: "/apply/transport/deliver/unit",
                        name: "DeliverUnit",
                        component: () => import("../views/transport/DeliverUnit"),
                        meta: {
                            title: "deliverUnit"
                        }
                    },
                    {
                        path: "/apply/transport/receipt/unit",
                        name: "ReceiptUnit",
                        component: () => import("../views/transport/ReceiptUnit"),
                        meta: {
                            title: "receiptUnit"
                        }
                  },
                  {
                      path: "/ld/deviceManagement",
                      name: "DeviceManagement",
                      component: () => import("../views/deviceManagement"),
                      meta: {
                          title: "equipmentComplex"
                      }
                  },
                    {
                        path: "/ld/LabDeviceMonthlyStat",
                        name: "LabDeviceMonthlyStat",
                        component: () => import("../views/labDeviceMonthlyStat"),
                        meta: {
                            title: "useRateMonth"
                        }
                    }
                ]
            },
            ...(!isDemo ? [roomDesignerRoute, floorDesignerRoute] : []),

        ]
    },
    {
        path: "/floor/view",
        name: "FloorView",
        component: () => import("../views/floorConfiguar/index.vue"),
        meta: {
            index: 2,
            title: "floorConfiguar"
        }
    },
    ...(isDemo ? [floorDesignerRoute, roomDesignerRoute] : []),
    {
        path: "/room/view",
        name: "RoomView",
        component: () => import("../views/roomConfiguar/index.vue"),
        meta: {
            index: 3,
            title: "roomConfiguar"
        }
    },
    {
        path: "/dashboard",
        name: "Dashboard",
        component: () => import("../views/dashboard/Dashboard"),
        meta: {
            title: "dashboard"
        }
    },
    {
        path: "/login",
        name: "Login",
        component: () => import("../views/login/Login"),
        meta: {
            title: "login"
        }
    },
    {
        path: "/runpeng/login",
        name: "Login",
        component: () => import("../views/login/Login"),
        meta: {
            title: "login"
        }
    },
    {
        //楼宇3D
        path: '/building',
        name: "Building",
        component: () => import("../views/building/Building"),
        meta: {
            index: 1,
            title: "building"
        }
    },
    {
        path: "/roomDataV/",
        name: "RoomDataV",
        component: () => import("../views/datav/RoomDataV"),
        meta: {
            title: "roomDataV"
        }
    },
    {
        path: "/floorDataV",
        name: "FloorDataV",
        component: () => import("../views/datav/FloorDataV"),
        meta: {
            title: "floorDataV"
        }
    },
    {
        path: "/502",
        name: "Error502",
        component: () => import("../views/502.vue"),
    }
];

// 重复点击路由报错问题
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err);
};

const router = new VueRouter({
    routes
});

export default router;
