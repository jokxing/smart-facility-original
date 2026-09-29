import Vue from "vue";
import "babel-polyfill"
import Vuex from "vuex";
import { SETMENUKEY, DRAWEROPEN, DRAWERCLOSE, SETMENU, SETLEVEL, SETDEPARTMENT } from "./mutationType";
import LabDevice from "./labDevice";
import System from "./system";
import Detail from "./detail";
import CenterController from "./centerController";
import Building from "./building";
import {Message} from "element-ui"

import {getProcessOrderHistoryQuery} from "@/api/activiti";
import moment from "moment";
import {BASE_URL, TIME_FORMAT} from "@/utils/constant";
import {getInstrumentCategoryInfoList} from "../api/labDevice";

Vue.use(Vuex);
export default new Vuex.Store({
    state: {
        activeKey: "", //当前激活的导航
        drawerVisible: false, //抽屉状态
        menu: "", //菜单
        level: 0,
        departments: [],
        loading: false,
        thingDetail: {}, // 设备/房间/硬件详情
        sensorsFlag: {}, // 探头
        deviceSensorsFlag: {}, //智能硬件探头
        sensorChangeId: null, // 选中的设备探头id
        pageSizes: [10,20,50,100,200,500],
        assetClassify: [],
        addressList: [],
        logoUrl: ""
    },
    getters: {},
    mutations: {
        [SETMENUKEY](state, key) {
            state.activeKey = key;
        },
        [DRAWEROPEN](state) {
            state.drawerVisible = true;
        },
        [DRAWERCLOSE](state) {
            state.drawerVisible = false;
        },
        [SETMENU](state, preload) {
            state.menu = preload.menu;
        },
        [SETLEVEL](state, preload) {
            state.level = preload;
        },
        [SETDEPARTMENT](state, preload) {
            state.departments = preload;
        },
        setLoading(state, preload) {
            state.loading = preload;
        },
        setThingDetail(state, preload){
            state.thingDetail = preload
        },
        setSensorsFlag(state, preload){
            state.sensorsFlag = preload
        },
        setDeviceSensorsFlag(state, preload){
            state.deviceSensorsFlag = preload
        },
        setSensorChangeId(state, preload) {
            state.sensorChangeId = preload
        },
        setAssetClassify(state, preload) {
            state.assetClassify = preload
        },
        setLogoUrl(state, preload) {
            state.logoUrl = preload
        }
    },
    actions: {
        /**
         * 资产流程管理列表
         * @param state
         * @param item 请求参数对象
         * {pageSize: 10,currentPage: 1,endTime: "",startTime: "",key: "",procStatus: null,type: 4}
         * @param date 时间范围
         * @returns {Promise<unknown>}
         */
        getFlowHistoryList(state, {item, date}) {
            if (Object.prototype.toString.call(date) === '[object Array]' && date.length) {
                item.startTime = moment(date[0]).format(TIME_FORMAT);
                item.endTime = moment(date[1]).format(TIME_FORMAT);
            } else {
                item.startTime = "";
                item.endTime = "";
            }
            return new Promise((resolve, reject) => {
                getProcessOrderHistoryQuery(item).then(res => {
                    if (res.code) {
                        res.items.list.map(item => {
                            if (item.content) {
                                Object.assign(item, JSON.parse(item.content));
                            }
                            item.createDate = moment(item.createDate).format(TIME_FORMAT);
                            item.updateDate = moment(item.updateDate).format(TIME_FORMAT);
                        })
                        resolve(res.items);
                    } else {
                        Message.error(res.message);
                    }
                }).catch(e => {
                    Message.error(e);
                    reject();
                })
            });
        },
        getAccessClassify({commit}, item) {
            return new Promise((resolve, reject) => {
                getInstrumentCategoryInfoList({keyword: item}).then(res => {
                    if (res.code) {
                        commit("setAssetClassify", res.items);
                        resolve(res.items)
                    }
                })
            }).catch(e => {
                reject()
            })
        }
     },
    modules: {
        lab: LabDevice, //实验室设备
        sys: System,
        detail: Detail,
        cmap: CenterController,
        building: Building
    }
});
