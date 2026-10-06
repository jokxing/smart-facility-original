<template>
    <!-- 主页 -->
    <div class="transport">
        <div class="session">
            <el-descriptions :title="$t('transport.outlineStat')"></el-descriptions>
            <chart-dimension
                :type="sumItems.dateType"
                :is-show="false"
                :dimension-type="dataType"
                @handle="handleSumDateType"
                @handleTime="handleSumData">
            </chart-dimension>
            <div class="total m-20">
                <div class="total-card totality">
                    <div class="float-left">
                        <div class="total-title">{{ dashboard[0].label }}</div>
                        <div class="total-sum">
                            <span class="num">{{ dashboard[0].num }}</span>
                            <span></span>
                        </div>
                    </div>
                    <div class="total-img">
                        <div class="image"></div>
                    </div>
                </div>
                <div class="total-type">
                    <div class="total-type-bottom">
                        <template v-for="(item, index) in dashboard">
                            <div v-if="index > 0"
                                 :key="item.title"
                                 class="bottom-type-list">
                                <div class="type-list-num">
                                    <div class="type-list-num-title">{{ item.label }}</div>
                                    <div class="type-list-num-total">
                                        <span class="num">{{ item.num }}</span>
                                        <span></span>
                                    </div>
                                </div>
                                <div class="device-right-icon">
                                    <!--                                    <i :class="handleIcon(item.value)"></i>-->
                                </div>
                            </div>
                        </template>

                    </div>
                </div>
            </div>
            <!--   Chrome、火狐以及部分套壳浏览器接入的定位服务在国外，有较大限制，失败率高。     -->
            <el-descriptions :title="$t('transport.trackQuery')"></el-descriptions>
            <p v-if="isDemoHint" class="demo-clock-hint">演示时钟 2026-09-24 12:00，轨迹为模拟数据，不请求真实定位。</p>
            <div class="flex">
                <el-date-picker
                    class="w360 margin-small-right"
                    v-model="value1"
                    type="datetimerange"
                    @change="handleMapOrderDate"
                    value-format="yyyy-MM-dd HH:mm:ss"
                    :end-placeholder="$t('transport.endDate')"
                    :range-separator="$t('common.most')"
                    :start-placeholder="$t('transport.startDate')">
                </el-date-picker>
                <el-input
                    class="w240 margin-small-right"
                    v-model="mapOrderItems.professionNo"
                    :placeholder="$t('transport.inputTransportNo')"></el-input>
                <el-input
                    class="w240 margin-small-right"
                    v-model="mapOrderItems.carBoard"
                    :placeholder="$t('transport.inputCarBoard')"></el-input>
                <el-input
                    class="w240 margin-small-right"
                    v-model="mapOrderItems.keyword"
                    :placeholder="$t('transport.inputDriverNameOrTel')"></el-input>
                <el-select class="w160 margin-small-right" v-model="mapOrderItems.state">
                    <el-option v-for="item in wayBillStates" :label="item.text" :value="item.code"
                               :key="item.code"></el-option>
                </el-select>
                <el-button
                    type="primary"
                    icon="icon-search1"
                    @click="handleGetMapOrderList">
                </el-button>
                <el-button
                    icon="icon-reset"
                    @click="handleReset">
                </el-button>
            </div>
            <transport-map v-loading="mapLoading" :order-list.sync="orderList" :lineArr="lineArr" >
                <template v-slot:append>
                    <div class="map-car">
                        <el-collapse v-if="mapOrderList.length" v-model="activeNames1" accordion @change="handleChange($event, 'father')">
                            <el-collapse-item v-for="item in mapOrderList" :key="item.carId" :name="item.carId">
                                <template slot="title">
                                    <div class="collapse-header">
                                        <div class="h">{{ $t('transport.carBoard') }}：{{ item.carBoard }}</div>
                                        <div>{{ $t('transport.driver') }}：{{ item.driverName }}</div>
                                        <div>{{ $t('transport.departureTime') }}：{{ item.beginTime }}</div>
                                    </div>
                                </template>
                                <div class="map-transport">
                                    <div v-for="transport in item.orderInfoVos" class="collapse"
                                         :class="{change: activeNames2 == transport.orderId}"
                                         @click="handleChange(transport.orderId)">
                                        <div class="collapse-header">
                                            <div class="transport-status" :class="wayBillStatusColor(transport.state)">
                                                {{ wayBillStatus(transport.state) }}
                                            </div>
                                            <div class="clearfix">
                                                <span style="line-height: 1.5">
                                                    {{ $t('transport.transportNo1') }}: {{transport.transportNo }}</span>
                                                <i class="el-icon-arrow-right"
                                                   :class="{'is-active': activeNames2 === transport.orderId}"></i>
                                            </div>
                                        </div>
                                        <transition name="slide" mode="in-out">
                                            <div class="transport-content" v-if="activeNames2 === transport.orderId">
                                                <div>{{ $t('labDevice.monitorTime') }}：{{ transport.time }}</div>
                                                <div v-for="(sensor, index) in transport.sensorDate" :key="index">
                                                    {{ sensor.name }}： {{ sensor.date }}
                                                </div>
                                            </div>
                                        </transition>
                                    </div>
                                </div>
                            </el-collapse-item>
                        </el-collapse>
                        <div class="not-message" v-else>
                            <img src="../../../src/assets/transport/20230217-150942.png" alt="">
                            <div>{{ $t('transport.notMessage') }}</div>
                        </div>
                    </div>
                </template>
            </transport-map>
        </div>
        <div class="session">
            <el-descriptions :title="$t('transport.outAlarm')"></el-descriptions>
            <div class="clearfix">
                <chart-dimension
                    :type="overrunItems.dateType"
                    :is-show="false"
                    :dimension-type="dataType"
                    @handle="handleOverrunDateType"
                    @handleTime="handleOverrunData">
                    <template #right>
                        <el-input
                            v-model.trim="overrunItems.key"
                            class="input-with-select ml10"
                            clearable
                            :placeholder="$t('transport.searchOrderNo')"
                            @keyup.enter.native="handleClickGetOverrunItems">
                            <el-button
                                slot="append"
                                class="el-button-host"
                                icon="icon-search1"
                                @click="handleClickGetOverrunItems">
                            </el-button>
                        </el-input>
                    </template>
                </chart-dimension>
                <el-button class="icon-download1"
                           :disabled="overrunInfosExportDisabled"
                           :loading="overrunInfosExportDisabled"
                           @click="handlerExportHistoryAlarmRecord">&nbsp;{{ $t('route.dataExport') }}
                </el-button>
            </div>
            <transport-index-table v-loading="outScopedLoading" class="margin-center" :list="overrunList"/>
            <div class="paging">
                <pagination
                    v-show="overrunTotal > overrunItems.pageSize"
                    :limit.sync="overrunItems.pageSize"
                    :page.sync="overrunItems.pageNum"
                    :total="overrunTotal"
                    :page-sizes="$store.state.pageSizes"
                    @pagination="getHistoryAlarmRecord"/>
            </div>
        </div>
        <div class="session">
            <el-tabs v-model="activeName" @tab-click="handleClick">
                <el-tab-pane :label="$t('transport.chartsData')" name="1"></el-tab-pane>
                <el-tab-pane :label="$t('transport.GPSData')" name="2"></el-tab-pane>
            </el-tabs>
            <div class="clearfix condition">
                <div class="flex">
                    <chart-dimension
                        class="margin-small-right"
                        :type="dataItems.dateType"
                        :is-show="false"
                        :dimension-type="dataType"
                        @handle="handleGpsDateType"
                        @handleTime="handleGpsData">
                    </chart-dimension>
                    <el-input
                        v-if="activeName == 2"
                        v-model.trim="dataItems.key"
                        class="input-with-select"
                        clearable
                        :placeholder="$t('transport.searchOrderNo1')"
                        @keyup.enter.native="handlerGetGps()">
                        <el-button
                            slot="append"
                            class="el-button-host"
                            icon="icon-search1"
                            @click="handlerGetGps()">
                        </el-button>
                    </el-input>
                </div>
                <el-select
                    v-if="activeName == 1"
                    v-model="dataItems.historyTimeInterval"
                    class="select-change1 margin-small-right"
                    filterable
                    @change="handlerGetHistoryData"
                    :placeholder="$t('common.placeholder')">
                    <el-option
                        v-for="(item) in timeInterval"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id">
                    </el-option>
                </el-select>
                <el-button v-if="activeName == 2"
                           :disabled="gpsInfosExportDisabled"
                           :loading="gpsInfosExportDisabled"
                           class="icon-download1"
                           @click="handleExportGPSInfos">&nbsp;{{ $t('route.dataExport') }}
                </el-button>
            </div>
            <div class="h400" v-if="activeName ==1 ">
                <ve-line
                    v-loading="dataCharts.loading"
                    :height="'100%'"
                    :extend="options"
                    :data="dataCharts" v-if="dataCharts.rows.length"/>
                <data-empty v-loading="dataCharts.loading" :height="'100%'" v-else/>
            </div>
            <transport-index-table v-loading="loading1" :list="gpsList" :is-overrun="false" v-if="activeName == 2" class="margin-center"/>
            <div class="paging" v-if="activeName == 2">
                <pagination
                    v-show="gpsTotal > dataItems.pageSize"
                    :limit.sync="dataItems.pageSize"
                    :page.sync="dataItems.pageNum"
                    :total="gpsTotal"
                    :page-sizes="$store.state.pageSizes"
                    @pagination="handlerGetGps"/>
            </div>
        </div>
    </div>

</template>

<script>
import TransportMap from "@/views/transport/components/TransportMap";
import ChartDimension from "@c/ChartDimension";
import TransportIndexTable from "@/views/transport/components/TransportIndexTable";
import VeLine from "v-charts/lib/line.common";

require("echarts/lib/component/toolbox");
import "v-charts/lib/style.css"
import VeBar from "v-charts/lib/bar.common";
import Pagination from "@c/Pagination";
import DataEmpty from "@c/DataEmpty";
import {
    getTransportOrderDashboard,
    getHistoryAlarmRecord,
    getGpsList,
    indexGpsHistoryDataExport,
    getHistoryData,
    exportHistoryAlarmRecord,
    indexGraphics, getTransportOrderList, getTransportOrderGps
} from "@/api/transport";
import moment from "moment";
import mixin from "@/utils/mixin";
import {TIME_FORMAT, HISTORYTIMEINTERVAL} from "@/utils/constant";
import {getStartAndEndTime} from "@/utils/methods";
import {DEMO_NOW_MS, formatDemoDateTime} from "@/mock/clock";

const isDemo = process.env.VUE_APP_DEMO === "true";
function demoRange(days) {
    return [formatDemoDateTime(DEMO_NOW_MS - days * 86400000), formatDemoDateTime(DEMO_NOW_MS)];
}

export default {
    name: "Transport",
    components: {
        TransportIndexTable,
        TransportMap,
        ChartDimension,
        VeLine,
        Pagination,
        DataEmpty,
        VeBar
    },
    data() {
        const _this = this;
        this.options = {
            series: {
                areaStyle: {},
            },
            legend: {
                show: false
            },
            yAxis: {
                axisLabel: {
                    formatter: (value) => {
                        return value + " ℃"
                    }
                }
            }
        }
        this.toolbox = {
            show: true,
            feature: {
                dataZoom: {yAxisIndex: "none"},
                dataView: {readOnly: true},
                magicType: {type: ["line", "bar"]},
                restore: {},
                saveAsImage: {}
            }
        }
        return {
            timeInterval: HISTORYTIMEINTERVAL,
            overrunTotal: 0,
            gpsTotal: 0,
            total: 10,
            mapOrderItems: {
                beginTime: "",
                carBoard: "",
                driverName: "",
                endTime: "",
                professionNo: "",
                state: null,
                tel: "",
                keyword: "",
                orderId: "", // 运单id[当传运单ID的时候则查询运单的轨迹,不传则查车辆的轨迹]
                carId: "" // 车辆id
            },
            mapOrderList: [],
            sumItems: {
                dateType: 1,
                beginTime: "",
                endTime: ""
            },
            dashboard: [
                {num: 0, label: _this.$t('transport.transportSum')},
                {num: 0, label: _this.$t('transport.transportAbnormal')},
                {num: 0, label: _this.$t('transport.departNum')},
                // {num: 0, label: _this.$t('transport.waitNum')},
                {num: 0, label: _this.$t('transport.alarmNum')}
            ],
            // 超限
            overrunItems: {
                key: "",
                dateType: 1,
                beginTime: "",
                endTime: "",
                pageNum: 1,
                pageSize: 10
            },
            // 超限报警列表
            overrunList: [],
            dataType: [
                {INTERVAL: 1, LABEL: _this.$t('common.day2')},
                {INTERVAL: 2, LABEL: _this.$t('common.week')},
                {INTERVAL: 3, LABEL: _this.$t('common.month')},
            ],
            // gps信息列表
            gpsList: [],
            gpsInfosExportDisabled: false,
            overrunInfosExportDisabled: false,
            dataItems: {
                dateType: 1,
                pageNum: 1,
                pageSize: 10,
                beginTime: "",
                endTime: "",
                key: "",
                historyTimeInterval: 30,
            },
            activeName: "1",
            dataCharts: {
                "columns": [],
                "rows": [],
                loading: false
            },
            // gps轨迹
            lineArr: [],
            mapLoading: false,
            loading1: false,
            outScopedLoading: false,
            activeNames1: "",
            activeNames2: "",
            value1: [],
            wayBillStates: [
                {code: null, text: _this.$t('common.all')},
                {code: 1, text: _this.$t('transport.carLoadereed')},
                {code: 2, text: _this.$t('transport.inTransit')},
                {code: 3, text: _this.$t('transport.deliveried')},
            ],
            orderList: [],
            isDemoHint: isDemo
        };
    },
    created() {
        if (isDemo) {
            const range = demoRange(7);
            this.value1 = range.slice();
            this.mapOrderItems.beginTime = range[0];
            this.mapOrderItems.endTime = range[1];
        } else {
            this.value1[0] = this.mapOrderItems.beginTime = moment().subtract(7, "days").format("YYYY-MM-DD HH:mm:ss");
            this.value1[1] = this.mapOrderItems.endTime = moment().format("YYYY-MM-DD HH:mm:ss");
        }
        this.init();
    },
    mounted() {
    },
    methods: {
        handleMapOrderDate(val) {
            console.log(val)
            if (val) {
                this.mapOrderItems.beginTime = val[0];
                this.mapOrderItems.endTime = val[1];
            } else {
                this.mapOrderItems.beginTime = "";
                this.mapOrderItems.endTime = "";
            }

        },
        handleChange(val, type) {
            if (type === 'father') {
                if (val) {
                    this.activeNames1 = this.mapOrderItems.carId = val;
                    this.mapOrderItems.orderId = this.activeNames2 = "";
                }
            } else {
                if (this.activeNames2 != val) {
                    this.mapOrderItems.orderId = this.activeNames2 = val;
                } else {
                    this.mapOrderItems.orderId = this.activeNames2 = "";
                }
            }
            this.handleGetGpsDateList();
        },
        handleReset() {
            this.mapOrderItems = {
                beginTime: "",
                carBoard: "",
                driverName: "",
                endTime: "",
                professionNo: "",
                state: null,
                tel: "",
                keyword: ""
            }
            if (isDemo) {
                const range = demoRange(7);
                this.value1 = range.slice();
                this.mapOrderItems.beginTime = range[0];
                this.mapOrderItems.endTime = range[1];
            } else {
                this.value1[0] = this.mapOrderItems.beginTime = moment().subtract(7, "days").format("YYYY-MM-DD HH:mm:ss");
                this.value1[1] = this.mapOrderItems.endTime = moment().format("YYYY-MM-DD HH:mm:ss");
            }
            this.handleGetMapOrderList();
        },
        init() {
            this.handleGetTransportOrderDashboard();
            this.getHistoryAlarmRecord();
            this.handlerGetHistoryData();
            this.handleGetMapOrderList();
        },
        handleGetGpsDateList() {
            this.mapLoading = true;
          getTransportOrderGps(this.mapOrderItems).then(res => {
              if (res.code) {
                  this.lineArr = res.items.gps;
                  this.orderList = res.items.orderGPS;
              }
          }).finally(() => {
              this.mapLoading = false;
          })
        },
        handleGetMapOrderList() {
            delete this.mapOrderItems.carId;
            delete this.mapOrderItems.orderId;
            getTransportOrderList(this.mapOrderItems).then(res => {
                if (res.code) {
                    this.mapOrderList = res.items;
                    if (this.mapOrderList.length) {
                        this.handleChange(this.mapOrderList[0].carId, 'father')
                    } else {
                        this.lineArr = [];
                    }
                }
            })
        },
        // 选择今日,本周,本月
        handleSumDateType(val) {
            this.sumItems.dateType = val;
            this.sumItems.beginTime = "";
            this.sumItems.endTime = "";
            this.handleGetTransportOrderDashboard();
        },
        // 自定义时间
        handleSumData(val) {
            this.sumItems.endTime = moment(val[1]).format(TIME_FORMAT);
            this.sumItems.beginTime = moment(val[0]).format(TIME_FORMAT);
            this.sumItems.dateType = null;
            this.handleGetTransportOrderDashboard();
        },
        // 选择今日,本周,本月
        handleOverrunDateType(val) {
            this.overrunItems.dateType = val;
            this.overrunItems.beginTime = "";
            this.overrunItems.endTime = "";
            this.getHistoryAlarmRecord();
        },
        // 获取报警信息
        getHistoryAlarmRecord() {
            this.outScopedLoading = true;
            getHistoryAlarmRecord(this.overrunItems).then(res => {
                if (res.code) {
                    this.overrunList = res.items.list;
                    this.overrunTotal = res.items.total;
                }
            }).finally(() => {
                this.outScopedLoading = false;
            })
        },
        // 点击查询报警信息
        handleClickGetOverrunItems() {
            this.overrunItems.pageNum = 1
            this.getHistoryAlarmRecord()
        },
        // 获取首页统计信息
        handleGetTransportOrderDashboard() {
            getTransportOrderDashboard(this.sumItems).then(res => {
                if (res.code) {
                    this.dashboard[0].num = res.items.totalNum;
                    this.dashboard[1].num = res.items.abnormalNum;
                    this.dashboard[2].num = res.items.goNum;
                    // this.dashboard[3].num = res.items.warningNum;
                    this.dashboard[3].num = res.items.alarmNum;
                }
            })
        },
        // 自定义时间
        handleOverrunData(val) {
            this.overrunItems.endTime = moment(val[1]).format(TIME_FORMAT);
            this.overrunItems.beginTime = moment(val[0]).format(TIME_FORMAT);
            this.overrunItems.dateType = null;
        },
        // 选择今日,本周,本月
        handleGpsDateType(val) {
            this.dataItems.dateType = val;
            this.dataItems.beginTime = "";
            this.dataItems.endTime = "";
            if (this.activeName == "1") {
                this.handlerGetHistoryData()
            } else {
                this.handlerGetGps();
            }
        },
        // 获取首页GPS数据
        handlerGetGps() {
            this.loading1 = true;
            this.dataItems.historyTimeInterval = 1;
            getGpsList(this.dataItems).then(res => {
                if (res.code) {
                    this.gpsList = res.items.list;
                    this.gpsTotal = res.items.total;
                }
            }).finally(() => {
                this.loading1 = false;
            })
        },
        // 自定义时间
        handleGpsData(val) {
            this.dataItems.endTime = moment(val[1]).format(TIME_FORMAT);
            this.dataItems.beginTime = moment(val[0]).format(TIME_FORMAT);
            this.dataItems.dateType = null;
            if (this.activeName == "1") {
                this.handlerGetHistoryData()
            } else {
                this.handlerGetGps();
            }
        },
        // 切换tabs
        handleClick() {
            this.dataItems.dateType = 1;
            this.dataItems.beginTime = "";
            this.dataItems.endTime = "";
            this.dataItems.pageNum = 1;
            if (this.activeName === "1") {
                this.dataItems.historyTimeInterval = 30;
                this.handlerGetHistoryData();
            } else if (this.activeName === "2") {
                this.handlerGetGps();
            }
        },
        // 首页 GPS 导出
        handleExportGPSInfos() {
            this.gpsInfosExportDisabled = true;
            new Promise(resolve => {
                this.$message.warning(this.$t('common.exportMessage'));
                setTimeout(() => {
                    resolve();
                }, 1500)
            }).then(() => {
                indexGpsHistoryDataExport(this.dataItems).then(res => {
                    const data = moment(new Date()).format("YYYYMMDDHHmmss");
                    mixin.methods.download(
                        res,
                        decodeURIComponent(this.$t('transport.GPSExport') + data, "UTF-8")
                    )
                }).finally(() => {
                    this.gpsInfosExportDisabled = false;
                });
            }).catch(() => {
                this.gpsInfosExportDisabled = false;
            });
        },
        // 获取监测数据
        handlerGetHistoryData() {
            this.dataCharts.loading = true;
            getHistoryData(this.dataItems).then(res => {
                let data = res.items
                if (data['columns'] && data['rows']) {
                    this.dataCharts.columns = data.columns;
                    this.dataCharts.rows = data.rows;
                } else {
                    this.dataCharts.columns = [];
                    this.dataCharts.rows = [];
                }
            }).finally(() => {
                this.dataCharts.loading = false;
            })
        },
        // 导出报警信息
        handlerExportHistoryAlarmRecord() {
            this.overrunInfosExportDisabled = true;
            new Promise(resolve => {
                this.$message.warning(this.$t('common.exportMessage'));
                setTimeout(() => {
                    resolve();
                }, 1500)
            }).then(() => {
                exportHistoryAlarmRecord(this.overrunItems).then(res => {
                    const data = moment(new Date()).format("YYYYMMDDHHmmss");
                    mixin.methods.download(
                        res,
                        decodeURIComponent(this.$t('transport.dataExport') + data, "UTF-8")
                    )
                }).finally(() => {
                    this.overrunInfosExportDisabled = false;
                });
            }).catch(() => {
                this.overrunInfosExportDisabled = false;
            });
        },
    },
    computed: {
        wayBillStatus() {
            return function (val) {
                for (let i = 0; i < this.wayBillStates.length; i++) {
                    const item = this.wayBillStates[i];
                    if (item.code == val) {
                        return item.text
                    }
                }
            }
        },
        wayBillStatusColor() {
            return function (val) {
                let str = "";
                switch (val) {
                    case 3:
                        str = "arrived";
                        break
                    case 2:
                        str = "running";
                        break
                    default:
                        str = "";
                        break
                }
                return str
            }
        }
    },
};
</script>

<style lang="less" scoped>
@import "../../style/variable.less";

.condition {
    margin-bottom: 10px;
}

#container {
    width: 100%;
    height: 400px;
}

/deep/ .select-change1 {
    width: 100px !important;
    margin-left: 10px;
}

/deep/ .el-row--flex.is-justify-space-between {
    justify-content: start;
}

.transport-sum {
    width: 300px;
    height: 100px;
    background: linear-gradient(90deg, #3F6DA5 0%, #7EA0CF 100%);
    border-radius: 8px;
}

.h400 {
    height: 400px;
}

.ml10 {
    margin-left: 10px;
}

.bottom-type-list {
    background: #ECF3FF;
}

.type-list-num {
    color: @666 !important;

    .type-list-num-title {
        line-height: 25px;
    }

    .type-list-num-total {
        .num {
            font-size: 28px;
            color: @subjectColor !important;
        }
    }
}

.device-right-icon {
    right: 10px !important;

    i {
        font-size: 24px !important;
        color: #448AFF;
    }
}

.map {
    padding: 0;
    margin: 0;
    width: 100%;
    height: 500px;

    .map-car {
        position: absolute;
        top: 0;
        left: 0;
        width: 310px;
        height: 490px;
        background: #FFFFFF;
        overflow-y: auto;
        opacity: 0.95;
        border-radius: 16px;
        z-index: 3;
        margin: 5px 0 5px 5px;
        padding: 10px;

        /deep/ .el-collapse {
            border-top: none;
        }

        /deep/ .el-collapse-item__header {
            height: 100px;
            padding-left: 16px;
            position: relative;
            padding-top: 10px;
            border-bottom: 3px solid #EBEEF5;

            .el-collapse-item__arrow {
                position: absolute;
                top: 20px;
                right: 16px;
            }
        }

        /deep/ .el-collapse-item__content {
            padding-bottom: 0;
        }

        .collapse-header {
            display: block;
            color: #333333;
            .h {
                font-weight: Bold;
            }

            div {
                height: 24px;
                font-size: 14px;
                line-height: 1.5;
            }
        }

        .map-transport {
            padding-bottom: 20px;
            .collapse {
                margin: 0 5px;
                background: #ffffff;
                border-radius: 8px;
                border-bottom: 1px solid #EBEEF5;
                padding-bottom: 20px;
                font-size: 14px;

                .collapse-header {

                    color: #555555;
                    .transport-status {
                        width: 75px;
                        height: 25px;
                        background: #F4F4F4;
                        border-radius: 4px;
                        text-align: center;
                        line-height: 25px;
                        margin-bottom: 16px;

                        &.running {
                            background: #D9F3EA;
                        }

                        &.arrived {
                            background: #EAF2FF;
                        }
                    }

                    .clearfix {
                        margin-left: 16px;
                        margin-right: 20px;

                        .is-active {
                            -webkit-transform: rotate(90deg);
                            transform: rotate(90deg);
                        }
                    }
                }

                .transport-content {
                    margin-top: 10px;
                    margin-left: 16px;

                    div {
                        line-height: 1.5;
                    }
                }

                &.change {
                    background: #F5F9FF;
                }
            }

            .collapse:last-of-type {
                border-bottom: none !important;

            }
        }

        .not-message {
            font-size: 16px;
            text-align: center;
            color: #555555;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);

            img {
                width: 205px;
                height: auto;
            }
        }
    }
}

.m-20 {
    margin: 20px 0;
}

.flex {
    margin-bottom: 20px;

    .w160 {
        width: 160px;
    }

    .w240 {
        width: 240px;
    }

    .w360 {
        width: 360px;
    }
}

.slide-leave-active,.slide-enter-active {
    height: 74px;
    transition: all .3s ease;
}
.slide-enter, .slide-leave-to
    /* .slide-fade-leave-active for below version 2.1.8 */ {
    height: 0;
    opacity: 0;
}
.total-card {
    height: 80px;
    overflow: hidden;
    display: flex;
    justify-content: space-between;
    padding: 10px 20px 20px 40px;

    .float-left {
        flex: 1;

        .total-sum {
            margin-top: -10px;

            .num {
                font-size: 32px !important;
            }
        }
    }

    .total-img {
        width: 65px !important;
        height: 65px;
        margin-top: 25px;

        .image {
            width: 100% !important;
            height: 100% !important;
            background-size: 80% !important;
            background-position: 10px;
            float: right;
        }
    }
}

.total-height {
    height: 220px;
    overflow: hidden;
    padding: 30px 20px 20px 40px;

}

.total {
    width: 100%;
    display: flex;
    flex-wrap: wrap;

    .totality {
        width: 300px;
        background: url("../../assets/device/device-total.png") no-repeat;
        background-size: 100% 100%;
        color: @white;
        border-radius: 8px;
        position: relative;
        overflow: hidden;

        .total-title {
            font-size: 14px;
            line-height: 30px;
            margin-bottom: 10px;
        }

        .total-sum {
            .num {
                font-size: 40px;
                font-weight: 500;
                line-height: 30px;
                margin-right: 10px;
            }
        }

        .total-img {
            position: absolute;
            right: 20px;
            bottom: -10px;
            width: 100%;

            .image {
                float: right;
                width: 100px;
                height: 128px;
                background: url("../../assets/device/icon-total.png") no-repeat;
                background-size: 100% 100%;
            }
        }
    }

    .total-type {
        width: calc(100% - 300px);
        margin-bottom: -16px;

        .total-type-bottom {
            display: flex;
            flex-wrap: wrap;
        }

        .bottom-type-list {
            width: 18.7%;
            height: 80px;
            border-radius: 8px;
            padding: 10px 20px 20px 20px;
            display: flex;
            margin-left: 16px;
            margin-bottom: 16px;
            justify-content: space-between;
            overflow: hidden;
            position: relative;

            .type-list-num {
                color: @white;

                .num {
                    color: @white;
                }
            }

            .el-icon-warning-outline{
                font-size: 24px;
                color: #666;
            }

            .device-right-icon {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                text-align: center;
                line-height: 60px;
                position: absolute;
                right: -5px;
                top: 10px;

                i {
                    font-size: 42px;
                }
            }
        }

    }
}

.demo-clock-hint {
    color: #909399;
    font-size: 13px;
    margin: 0 0 12px 0;
}

</style>
