<template>
    <div class="statistics">
        <el-descriptions :title="'▍ ' + $t('statistics.all')"></el-descriptions>

        <div class="clearfix bg">
            <template v-for="item in overview">
                <StatisticsCard :data="item" :key="item.id"/>
            </template>
        </div>
        <el-descriptions class="margin-center" :title="'▍ ' + $t('statistics.alarmAll')"></el-descriptions>
        <el-row type="flex" :gutter="16" justify="space-between">
            <el-col :span="8">
                <RingChart class="bg-canvas" :dataCharts="instrumentOverview" :title-text="$t('statistics.labDeviceAlarm')"/>
            </el-col>
            <el-col :span="8">
                <RingChart class="bg-canvas" :dataCharts="eqiupmentData" :title-text="$t('statistics.roomAlarm')"/>
            </el-col>
            <el-col :span="8">
                <RingChart class="bg-canvas" :dataCharts="equipmentOverview" :title-text="$t('statistics.deviceAlarm')"/>
            </el-col>
        </el-row>
        <el-descriptions class="margin-center" :title="'▍ ' + $t('statistics.deviceAlarmStat')"></el-descriptions>
        <div class="bg">
            <histogram-chart :height="'400px'" :data-charts="eqiupmentAlarmData" :legend-show="true"/>
        </div>
        <!-- 4B：设备状态饼图已开放 -->
        <el-descriptions class="margin-center" :title="'▍ ' + $t('statistics.labDeviceStatusStat')"></el-descriptions>
        <div class="">
            <EquipmentStatePieCharts/>
        </div>
        <!-- 4C：设备使用统计已开放 -->
        <el-descriptions class="margin-center" :title="'▍ ' + $t('statistics.labDeviceUserStat')"></el-descriptions>
        <div class="bg">
            <chart-dimension
                :type="equipmentUse.dateType"
                :interval="equipmentUse.queryType"
                :interval-type.sync="useStatisc"
                :dimension-type="dataType"
                @handle="handleUsers"
                @change="handleUserInterval"
                @handleTime="handleUserTime">
                <template #left>
                    <el-select v-model="equipmentUse.type" @change="handleEquipmentUsers" class="margin-small-right usage-rate">
                        <el-option :value="0" :label="$t('common.all')"></el-option>
                        <el-option :value="1" :label="$t('route.watchlabdevice')"></el-option>
                        <el-option :value="2" :label="$t('route.administration')"></el-option>
                        <el-option :value="3" :label="$t('route.unwatchlabdevice')"></el-option>
                    </el-select>
                </template>
            </chart-dimension>
                <ve-bar
                    v-if="eqiupmentCharts.rows.length"
                    :extend="useOptions"
                    v-loading="eqiupmentCharts.loading"
                    :data="eqiupmentCharts"/>
                <data-empty v-loading="eqiupmentCharts.loading" v-else/>

        </div>
                <!-- 4D：设备使用率排行已开放 -->
        <el-descriptions class="margin-center" :title="'▍ ' + $t('statistics.labDeviceUserRateStat')"></el-descriptions>
        <div class="bg">
            <chart-dimension
                :type="useRanKing.dateType"
                :interval="useRanKing.periodType"
                :interval-type.sync="usePush"
                :dimension-type="dataType"
                @handle="handleUseRanKingDateType"
                @change="handleUseRanKingInterval"
                @handleTime="handleEquipmentData">
                <template #left>
                    <el-select v-model="useRanKing.queryType" @change="handleUseRanKingType"
                               class="margin-small-right usage-rate">
                        <el-option :value="1" :label="$t('statistics.labDeviceUserRate')"></el-option>
                        <el-option :value="2" :label="$t('statistics.dayUserRate')"></el-option>
                        <el-option :value="3" :label="$t('statistics.aDayUserRate')"></el-option>
                    </el-select>
                </template>
                <template #right>
                    <el-button class="icon-reset ml" @click="handleUseRanKingReset">&nbsp;{{ $t('labDevice.reset') }}</el-button>
                    <el-button type="text" @click="$refs.UseRanHighSearch.open({type: useRanKing.periodType, start: useRanKing.periodBeginTime, end: useRanKing.periodEndTime})">{{ $t('statistics.highSearch') }}</el-button>
                </template>
            </chart-dimension>
            <el-table
                class="margin-center"
                :data="useRanKings">
                <el-table-column type="index" :label="$t('labDevice.ranking')" width="80"/>
                <el-table-column
                    prop="instrumentName"
                    :label="$t('labDevice.labDeviceName')"
                    width="200">
                </el-table-column>
                <el-table-column
                    prop="name"
                    :label="$t('labDevice.rate') + '(100%)'">
                    <template v-slot="{row}">
                        <div class="use-rate">
                            <span>{{ row.useRate }}%</span>
                            <el-progress :show-text="false" :text-inside="true" :stroke-width="26"
                                         :percentage="row.useRate * 1"></el-progress>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="variationRate"
                    width="200"
                    :label="$t('labDevice.monthBasis')">
                    <template v-slot="{row}">
                        <span :class="row.changed ? 'normal' : 'abnormal'" class="margin-small-right">{{ row.variationRate }} %</span>
                        <span :class="row.changed ? 'normal' : 'abnormal'">{{ row.changed ? "↑" : "↓" }} </span>
                    </template>

                </el-table-column>
                <!--   changed变化标志 true 增长，false 下降     -->
            </el-table>
            <div class="paging">
                <pagination
                    v-show="equipmentPowerItems.total > equipmentPowerItems.pageSize"
                    :limit.sync="equipmentPowerItems.pageSize"
                    :page.sync="equipmentPowerItems.pageNum"
                    :total="equipmentPowerItems.total"
                    :page-sizes="[7]"
                    :layout="'total, prev, pager, next, jumper'"
                    @pagination="getHandleEquipmentPowerList"/>
            </div>
        </div>
        <use-ran-high-search ref="UseRanHighSearch" @handle="handleHigthSearch"/>
    </div>
</template>

<script>
import StatisticsCard from "@/views/statistics/components/StatisticsCard";
import RingChart from "@/components/RingChart"
import BarChart from "@/components/BarChart"
import LineChart from "@/components/LineChart"
import HistogramChart from "@/components/HistogramChart";
import Pagination from "@/components/Pagination"
import {
    getStatisticAlarmOverview,
    getStatisticElectricity,
    getStatisticEquipmentAlarm,
    getStatisticInstrumentUse, getStatisticInstrumentUseRanKing,
    getStatisticOverview,
} from "@/api/statistic";
import ChartDimension from "@/components/ChartDimension";
import UseRanHighSearch from "@/components/UseRanHighSearch";
import EquipmentStatePieCharts from "@/views/labDevice/components/EquipmentStateStasticalPie";
import {items, TIME_FORMAT} from "@/utils/constant";
import moment from "moment";
import VeBar from "v-charts/lib/bar.common";
import DataEmpty from "@c/DataEmpty"
export default {
    name: "Statistics",
    components: {
        StatisticsCard,
        RingChart,
        BarChart,
        UseRanHighSearch,
        EquipmentStatePieCharts,
        LineChart,
        HistogramChart,
        ChartDimension,
        Pagination,
        VeBar,
        DataEmpty
    },
    data() {
        const _this = this;
        return {
            // 4A–4E stats sections open
            colors: ['#BFBFBF', '#FEC000', '#262626', '#0070c0', '#808080'],
            overview: [
                {
                    title: _this.$t('statistics.labDeviceAll'),
                    path: "/ld/labdevice",
                    id: "ld",
                    total: 0,
                    normal: 0,
                    error: 0,
                    offLine: 0,
                    unit: "台"
                },
                {
                    title: _this.$t('statistics.roomAll'),
                    path: "/rm/room",
                    id: "rm",
                    total: 0,
                    normal: 0,
                    error: 0,
                    offLine: 0,
                    unit: "间"
                },
                {
                    title: _this.$t('statistics.deviceAll'),
                    path: "/lhd/hardware/home",
                    id: "lhd",
                    total: 0,
                    normal: 0,
                    error: 0,
                    offLine: 0,
                    unit: "台"
                }
            ],
            eqiupmentData: {
                loading: false,
                columns: ["name", "count"],
                rows: [],
            },
            eqiupmentAlarmData: {
                loading: false,
                columns: ["lineName",],
                rows: [],
                formatter: _this.$t('common.next')
            },
            useOptions: {
                legend: {
                    show: false
                },
                tooltip: {
                    show: true,
                    formatter: (params) => {
                        return this.timeTransform(params)
                    }
                },
                grid: {
                    x: 30,
                    y: 40,
                    x2: 30,
                    y2:40
                },
                xAxis: {
                    type: "value",
                    minInterval: 3600,
                    max: 3600 * 5,
                    axisLabel: {
                        formatter: (value) => {
                            if (this.equipmentUse.queryType === 0) {
                                return Math.floor(value / 3600) + "h"
                            }
                            if (this.equipmentUse.queryType === 1) {
                                return Math.floor(value) + _this.$t('common.next');
                            }
                            return value + "kW·h";
                        }
                    }
                },
                series: {
                    name: _this.$t('hardware.duration'),
                    type: "bar",
                    barMaxWidth: 20,
                }
            },
            equipmentPowerItems: {
                pageNum: 1,
                pageSize: 7,
                total: 0
            },
            equipmentUse: {
                beginTime: "",
                dateType: 1,
                endTime: "",
                pageNum: 1,
                pageSize: 10,
                type: 0,
                queryType: 0
            },
            eqiupmentCharts: {
                loading: false,
                columns: ["instrumentName", "useTime"],
                rows: [],
                formatter: " 秒",
                name: _this.$t('hardware.duration')
            },
            instrumentOverview: {
                loading: false,
                columns: ["alarmName", "count"],
                rows: []
            },
            equipmentOverview: {
                loading: false,
                columns: ["typeName", "count"],
                rows: []
            },
            useStatisc: [
                {index: 0, label: _this.$t('hardware.duration')},
                {index: 1, label: _this.$t('labDevice.degree')},
                {index: 2, label: _this.$t('labDevice.electricity1')}
            ],
            usePush: [
                {index: 1, label: _this.$t('common.workday')},
                {index: 2, label: _this.$t('common.naturalDay')}
            ],
            dataType: [
                {INTERVAL: 1, LABEL: _this.$t('common.day2')},
                {INTERVAL: 2, LABEL:  _this.$t('common.week')},
                {INTERVAL: 3, LABEL:  _this.$t('common.month')},
            ],
            useRanKing: {
                queryType: 1,
                beginTime: "",
                endTime: "",
                dateType: 1,
                periodBeginTime: "",
                periodEndTime: "",
                periodType: 1
            },
            useRanKings: []
        }
    },
    created() {
        this.init();
    },
    methods: {
        async init() {
            getStatisticOverview().then(res => {
                const {items} = res;
                this.overview = [
                    {
                        title: this.$t('statistics.labDeviceAll'),
                        path: "/ld/labdevice",
                        id: "ld",
                        total: items.instrumentTotal ? items.instrumentTotal : 0,
                        normal: items.instrumentNormalCount ? items.instrumentNormalCount : 0,
                        error: items.instrumentAlarmCount ? items.instrumentAlarmCount : 0,
                        offLine: items.instrumentOffLineCount ? items.instrumentOffLineCount : 0,
                        unit: this.$t('common.stand')
                    },
                    {
                        title: this.$t('statistics.roomAll'),
                        path: "/rm/room",
                        id: "rm",
                        total: items.roomTotal ? items.roomTotal : 0,
                        normal: items.roomNormalCount ? items.roomNormalCount : 0,
                        error: items.roomAlarmCount ? items.roomAlarmCount : 0,
                        offLine: items.roomOffLineCount ? items.roomOffLineCount : 0,
                        unit: this.$t('room.meta')
                    },
                    {
                        title: this.$t('statistics.deviceAll'),
                        path: "/lhd/hardware/home",
                        id: "lhd",
                        total: items.equipmentTotal ? items.equipmentTotal : 0,
                        normal: items.equipmentNormalCount ? items.equipmentNormalCount : 0,
                        error: items.equipmentAlarmCount ? items.equipmentAlarmCount : 0,
                        offLine: items.equipmentOffLineCount ? items.equipmentOffLineCount : 0,
                        unit: this.$t('common.stand')
                    }
                ]
            });
            this.eqiupmentAlarmData.loading = true;
            getStatisticEquipmentAlarm().then(res => {
                this.eqiupmentAlarmData.loading = false;
                this.eqiupmentAlarmData.columns = ["lineName"];
                this.eqiupmentAlarmData.rows = [];
                const items = (res && res.items) || [];
                for (let i = 0; i < items.length; i++) {
                    let obj = {lineName: items[i].lineName};
                    for (let j = 0; j < items[i].data.length; j++) {
                        let str = items[i].data[j].typeName;
                        this.eqiupmentAlarmData.columns.push(str)
                        obj[str] = items[i].data[j].count;
                    }
                    this.eqiupmentAlarmData.columns = [...new Set(this.eqiupmentAlarmData.columns)];
                    this.$set(this.eqiupmentAlarmData.rows, i, obj);
                }
            });
            this.instrumentOverview.loading = true;
            this.equipmentOverview.loading = true;
            this.eqiupmentData.loading = true;
            getStatisticAlarmOverview().then(res => {
                const {instrumentOverview, equipmentOverview, labOverview} = res.items;
                this.instrumentOverview.loading = false;
                this.eqiupmentData.loading = false;
                this.equipmentOverview.loading = false;
                this.equipmentOverview.columns = ["name", "count"];
                this.instrumentOverview.columns = ["name", "count"];
                this.eqiupmentData.columns = ["name", "count"];
                this.instrumentOverview.rows = instrumentOverview && instrumentOverview.length ? instrumentOverview : [];
                this.eqiupmentData.rows = labOverview && labOverview.length ? labOverview : [];
                this.equipmentOverview.rows = equipmentOverview && equipmentOverview.length ? equipmentOverview : [];
            });
            this.handleEquipmentUsers();
            this.handleGetInstrumentUserRanKing();
        },
        timeTransform(sec) {
            if (this.equipmentUse.queryType !== 0) {
                return sec[0].seriesName + ": " + sec[0].data + (this.equipmentUse.queryType === 1 ? " 次" : " kW·h");
            }
            let d = Math.floor(sec[0].data / (60 * 60 * 24));
            let dh = sec[0].data % (60 * 60 * 24);
            let h = Math.floor(dh / (60 * 60));
            let ms = dh % (60 * 60);
            let m = Math.floor(ms / 60);
            let s = ms % 60;
            let timeStr = "";
            console.log(d)
            if (d) {
                timeStr += `${d}` + this.$t('common.day1');
            }
            if (h) {
                timeStr += `${h}h`;
            }
            if (m) {
                timeStr += `${m}\``;
            }
            if (s) {
                timeStr += `${s}\`\``;
            }
            if (!timeStr) {
                timeStr = 0;
            }
            return sec[0].seriesName + ": " + timeStr;
        },
        getHandleEquipmentUserList() {
            this.handleEquipmentUsers();
        },
        getHandleEquipmentPowerList() {
            this.handleElectricity(this.equipmentPowerActive);
        },
        handleUsers(val) {
            this.equipmentUse.dateType = val;
            this.equipmentUse.endTime = "";
            this.equipmentUse.beginTime = "";
            this.handleEquipmentUsers();
        },
        handleEquipmentUsers() {
            this.eqiupmentCharts.loading = true;
            this.eqiupmentCharts.rows = [];
            getStatisticInstrumentUse(this.equipmentUse).then(res => {
                this.eqiupmentCharts.loading = false;
                if (res.code) {
                    if (res.items['instrumentUseList']) {
                        res.items.instrumentUseList.map(item => {
                            this.eqiupmentCharts.rows.unshift(item)
                        })
                        const max = Math.max.apply(Math,this.eqiupmentCharts.rows.map(item => { return item.useTime }))
                        if (max >= 3600 * 5) {
                            delete  this.useOptions.xAxis.max;
                        }
                    }
                } else {
                    this.$message.error(res.message)
                }
            })
        },
        // 使用统计自定义时间
        handleUserTime(val) {
            this.equipmentUse.endTime = moment(val[1]).format(TIME_FORMAT);
            this.equipmentUse.beginTime = moment(val[0]).format(TIME_FORMAT);
            this.equipmentUse.dateType = null;
            this.handleEquipmentUsers();
        },
        // 使用统计按时长、次数、功耗维度
        handleUserInterval(val) {
            this.equipmentUse.queryType = val;
            if (val === 0) {
                this.eqiupmentCharts.columns = ["instrumentName", "useTime"];
                this.useOptions.series.name = this.$t('hardware.duration');
                this.useOptions.xAxis.minInterval = 3600;
                this.useOptions.xAxis.max = 3600 * 5;
            }
            if (val === 1) {
                this.eqiupmentCharts.columns = ["instrumentName", "useCount"];
                this.useOptions.series.name = this.$t('labDevice.degree');
                this.useOptions.xAxis.minInterval = 1;
                delete  this.useOptions.xAxis.max;
            }
            if (val === 2) {
                this.eqiupmentCharts.columns = ["instrumentName", "electricPower"];
                this.useOptions.series.name = this.$t('labDevice.electricity1');
                delete  this.useOptions.xAxis.minInterval;
                delete  this.useOptions.xAxis.max;
            }
            this.handleEquipmentUsers();
        },
        // 使用率
        handleGetInstrumentUserRanKing() {
            getStatisticInstrumentUseRanKing(this.useRanKing).then(res => {
                if (res.code) {
                    this.useRanKings = res.items;
                }
            })
        },
        // 使用率自定义时间
        handleEquipmentData(val) {
            this.useRanKing.endTime = moment(val[1]).format(TIME_FORMAT);
            this.useRanKing.beginTime = moment(val[0]).format(TIME_FORMAT);
            this.useRanKing.dateType = null;
            this.handleGetInstrumentUserRanKing();
        },
        // 使用率时间类型
        handleUseRanKingDateType(val) {
            this.useRanKing.dateType = val;
            this.useRanKing.endTime = "";
            this.useRanKing.beginTime = "";
            this.handleGetInstrumentUserRanKing();
        },
        // 使用率工作日，自然日
        handleUseRanKingInterval(val) {
            this.useRanKing.periodType = val;
            this.handleGetInstrumentUserRanKing();
        },
        // 使用率平均率等类型
        handleUseRanKingType() {
            this.handleGetInstrumentUserRanKing();
        },
        // 使用率重置
        handleUseRanKingReset() {
            this.useRanKing = {
                queryType: 1,
                beginTime: "",
                endTime: "",
                dateType: 1,
                periodBeginTime: "",
                periodEndTime: "",
                periodType: 1
            }
            this.handleGetInstrumentUserRanKing();
        },
        // 高级查询
        handleHigthSearch(obj) {
            this.useRanKing.periodBeginTime = obj.periodBeginTime;
            this.useRanKing.periodEndTime = obj.periodEndTime;
            this.useRanKing.periodType = obj.periodType;
            this.handleGetInstrumentUserRanKing();
        }
    }
}
</script>

<style lang="less" scoped>

.bg {
    padding: 20px;
    border-radius: 8px;
    background: #FFFFFF;
}

.bg-canvas {
    border-radius: 8px;
    background: #ffffff;
}

/deep/ .el-descriptions__title {
    color: #3F51B5 !important;
    line-height: 30px;
}
.ml {
    margin-left: 10px;
}
.use-rate {
    width: 100%;
    display: flex;
    /deep/ .el-progress {
        margin-left: 10px;
        flex: 1;
    }
}
</style>
