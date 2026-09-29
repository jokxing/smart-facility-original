<template>
    <div v-loading="loading" v-if="isSensorsArr">
        <el-descriptions :title="$t('hardware.monitorMessage')" class="monitor-button">
            <template v-if="$store.state.level" slot="extra">
                <el-button
                    v-for="item in dimensions"
                    :key="item.INTERVAL"
                    :class="interval === item.INTERVAL && 'is-active'"
                    :disabled="dataCharts.loading"
                    @click="handleCutTime(item.INTERVAL)">
                    {{ item.LABEL }}
                </el-button>
                <el-button @click="handleCustom">
                    {{ isCustom ? $t('common.cancelCustom') : $t('common.custom') }}
                </el-button>
                <el-date-picker
                    v-show="isCustom"
                    v-model="datetimer"
                    ref="datePicker"
                    type="datetimerange"
                    :range-separator="$t('common.most')"
                    :start-placeholder="$t('common.startDate')"
                    :end-placeholder="$t('common.endDate')"
                    :picker-options="pickerOptions"
                    @change="handleDateTime">
                </el-date-picker>
                <el-button
                    :disabled="dataCharts.loading"
                    class="el-icon-refresh"
                    @click="handleUpdate">
                    {{ $t('labDevice.reset') }}
                </el-button>
                <el-select
                    v-model="historyTimeInterval"
                    class="select-change1 margin-small-right"
                    filterable
                    @change="init"
                    :placeholder="$t('common.placeholder')">
                    <el-option
                        v-for="(item) in timeInterval"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id">
                    </el-option>
                </el-select>
                <el-button
                    type="primary"
                    class="icon-query-data"
                    style="margin-left: 0"
                    @click="$refs.monitorInfoSeeHistoryData.open(objId, type, sensors)"> {{ $t('hardware.seeHistroy') }}
                </el-button>
            </template>
        </el-descriptions>

        <div class="charts-type">
            <div v-if="type === 1">
                <template v-for="item in sensors">
                    <el-button
                        class="but"
                        :key="item.objSensorId"
                        :class="item.objSensorId === objSensorId && 'is-active'"
                        :disabled="dataCharts.loading"
                        @click="handleCutSensor(item)">
                        {{ item.sensorAlias }}
                    </el-button>
                </template>
            </div>
            <div v-else>
                <template v-for="item in sensors">
                    <el-button
                        :key="item.id"
                        class="but"
                        :class="[item.id === objSensorId && 'is-active', item.deleteFlag ? 'abnormal' : '']"
                        :disabled="dataCharts.loading"
                        @click="handleCutSensor(item)">
                        {{ item.sensorAlias }}{{ item.deleteFlag ? '（' + $t('hardware.unbinded') + "）" : "" }}
                    </el-button>
                </template>
            </div>
        </div>

        <LineMarkChart :dataCharts="dataCharts"/>
        <MonitorInfoSeeHistoryData ref="monitorInfoSeeHistoryData"/>
    </div>
</template>

<script>
import LineMarkChart from "@/components/LineMarkChart";
import MonitorInfoSeeHistoryData from "@/components/MonitorInfoSeeHistoryData";
import {HISTORYTIMEINTERVAL, TIME_DIMENSION} from "@/utils/constant";
import {getMonitorInfo} from "@/api/monitorIndicator";
import moment from "moment";
import {concurrentRequest} from "../../utils/methods";
import {DEMO_NOW_MS, formatDemoDateTime} from "@/mock/clock";

const isDemo = process.env.VUE_APP_DEMO === "true";

export default {
    components: {
        LineMarkChart,
        MonitorInfoSeeHistoryData
    },
    props: {
        objId: {
            type: Number,
            default: null
        },
        sensors: {
            type: Array,
            default: []
        },
        // type 1硬件 2设备，3房间
        type: {
            type: Number,
            default: 2
        }
    },
    data() {
        const _this = this;
        return {
            loading: false,
            historyTimeInterval: 5,
            timeInterval: HISTORYTIMEINTERVAL,
            objSensorId: 0,
            dimensions: TIME_DIMENSION,
            interval: 4,
            datetimer: [],
            dataCharts: {
                columns: ["createDate", "data"],
                rows: [],
                loading: false,
                name: "",
                unit: "",
                type: null,
                max: null,
                min: null,
            },
            beginTime: "",
            endTime: "",
            isCustom: false,
            isSensorsArr: false,
            signalSwitchStatus: null,
            pickerOptions: {
                disabledDate(time) {
                    if (_this.datetimer && _this.datetimer.length) {
                        const currentTime = _this.datetimer[0];
                        const threeMonths = 60 * 60 * 1000 * 24 * 90;
                        if (currentTime) {
                            return time.getTime() > currentTime.getTime() + threeMonths || time.getTime() < currentTime.getTime() - threeMonths;
                        }
                    } else {
                        return false
                    }
                },
                onPick({minDate, maxDate}) {
                    // 当第一时间选中才设置禁用
                    if (minDate && !maxDate && _this.datetimer) {
                        _this.$set(_this.datetimer, 0, minDate);
                    }
                    if (maxDate && _this.datetimer) {
                        _this.$set(_this.datetimer, 1, maxDate);
                    }
                },
            }
        }
    },
    mounted() {
        var sensorsArr = [];
        for (var i = 0; i < this.sensors.length; i++) {
            sensorsArr.push(this.sensors[i])
            // if(this.type === 1){
            //     sensorsArr.push(this.sensors[i])
            // }else{
            //     if(this.sensors[i].inlay !== 3 && this.sensors[i].showAlarmFlag === 1){
            //         sensorsArr.push(this.sensors[i])
            //     }
            // }
        }
        if (sensorsArr.length > 0) {
            this.isSensorsArr = true;
            this.objSensorId = this.type === 1 ? sensorsArr[0].objSensorId : sensorsArr[0].id;
            this.signalSwitchStatus = sensorsArr[0].signalSwitchStatus;
            this.initSensors(
                sensorsArr[0].sensorAlias,
                sensorsArr[0].unit,
                sensorsArr[0].normalMax,
                sensorsArr[0].normalMin,
                sensorsArr[0].monitorSensorCatId
            );
            this.init();
        } else {
            this.isSensorsArr = false;
        }
    },
    methods: {
        handleTimeSection(beginTime, endTime, interval) {
            let begin = new Date(beginTime.replace(/-/g, '/')).getTime();
            const end = new Date(endTime.replace(/-/g, '/')).getTime();
            const time = 24 * 60 * 60 * 1000;
            let data = {
                historyTimeInterval: this.historyTimeInterval,
                objSensorId: this.objSensorId,
                type: this.type,
                beginTime: "",
                endTime: "",
                interval: interval,
                objId: this.objId
            };
            const requestAll = [];
            if (end - begin >= 30 * time) {
                let begin1 = JSON.parse(JSON.stringify(begin));
                let end1 = begin1;
                this.loading = true;
                let index = 0;
                this.dataCharts.loading = true;
                while (begin1 < end) {
                    end1 = end1 + 2 * time;
                    const beginTime = moment(begin1).format("YYYY-MM-DD HH:mm:ss");
                    const endTime = moment(end1).format("YYYY-MM-DD HH:mm:ss");
                    requestAll[index] = {
                        ...data,
                        beginTime,
                        endTime
                    };
                    index ++;
                    begin1 = end1;
                }
                let resultIndex = 0;
                concurrentRequest(requestAll, 3, (item) => {
                    const params = JSON.parse(JSON.stringify(item));
                    params.interval = "";
                    return this.handleData(params).then(res => {
                        if (res.code && this.interval === item.interval) {
                            const original = this.dataCharts.rows.concat(res.items);
                            this.dataCharts.rows = original.sort((a, b) => {
                                const aCreatDate = new Date(a.createDate.replace(/-/g, '/')).getTime();
                                const bCreatDate = new Date(b.createDate.replace(/-/g, '/')).getTime();
                                return new Date(aCreatDate) - new Date(bCreatDate);
                            });
                            resultIndex += 1;
                            if (resultIndex === requestAll.length) {
                                this.dataCharts.loading = false;
                                this.loading = false;
                            }
                            if (this.dataCharts.rows.length > 0) {
                                this.dataCharts.loading = false;
                                this.loading = false;
                            }
                        }
                    });
                })
            }
        },
        init() {
            var data = {
                historyTimeInterval: this.historyTimeInterval,
                objSensorId: this.objSensorId,
                type: this.type,
                beginTime: this.beginTime,
                endTime: this.endTime,
                interval: this.interval,
                objId: this.objId
            }
            if (!this.interval || ![6,7].includes(this.interval)) {
                this.loading = true;
                getMonitorInfo(data).then(res => {
                    this.loading = false;
                    if (res.code === 1) {
                        for (var i = 0; i < res.items.length; i++) {
                            res.items[i].data = parseFloat(res.items[i].data);
                            res.items[i].id = parseFloat(res.items[i].id)
                        }
                        this.dataCharts.rows = res.items
                    }
                }).catch(err => {
                    this.loading = false;
                })
            } else if ([6,7].includes(this.interval)) {
                const num = this.interval === 6 ? 30 : 90;
                let beginTime;
                let endTime;
                if (isDemo) {
                    endTime = formatDemoDateTime(DEMO_NOW_MS);
                    beginTime = formatDemoDateTime(DEMO_NOW_MS - num * 86400000);
                } else {
                    endTime = moment().format('YYYY-MM-DD HH:mm:ss');
                    beginTime = moment().subtract(num, 'days').format('YYYY-MM-DD HH:mm:ss');
                }
                this.handleTimeSection(beginTime, endTime, this.interval);
            }  else {
                this.handleTimeSection(this.beginTime, this.endTime);
            }

        },
        async handleData(data) {
            return await getMonitorInfo(data);
        },
        initSensors(sensorAlias, unit, max, min, sensorId) {
            this.dataCharts.name = sensorAlias;
            this.dataCharts.unit = unit ? unit : '';
            this.dataCharts.max = typeof (max) === 'number' ? max : 'null';
            this.dataCharts.min = typeof (min) === 'number' ? min : 'null';
            this.dataCharts.type = Number(sensorId);
        },
        // 选择指标
        handleCutSensor(item) {
            this.objSensorId = this.type === 1 ? item.objSensorId : item.id;
            this.initSensors(item.sensorAlias, item.unit, item.normalMax, item.normalMin, item.monitorSensorCatId);
            this.dataCharts.rows = [];
            this.signalSwitchStatus = item.signalSwitchStatus;
            this.init();
        },
        // 选择时间
        handleCutTime(index) {
            this.interval = index;
            this.datetimer = [];
            this.endTime = this.beginTime = "";
            this.dataCharts.rows = [];
            this.init();
        },
        // 自定义按钮
        handleCustom() {
            this.isCustom = !this.isCustom;
            if (!this.isCustom) {
                this.interval = 4;
                this.datetimer = [];
                this.init();
            }
        },
        // 自定义时间
        handleDateTime(val) {
            if (val && val.length) {
                this.beginTime = moment(val[0]).format("YYYY-MM-DD HH:mm:ss");
                this.endTime = moment(val[1]).format("YYYY-MM-DD HH:mm:ss");
                this.interval = null;
                this.init();
            }
        },
        // 重置
        handleUpdate() {
            this.interval = 4;
            this.datetimer = [];
            this.endTime = this.beginTime = "";
            this.isCustom = false;
            this.init();
        }
    },
}
</script>

<style lang="less" scoped>
@import "../../style/variable.less";

/deep/ .select-change1 {
    width: 100px !important;
    margin-left: 10px;
}

.monitor-button {
    .el-button {
        margin-left: 10px;
    }

    .el-range-editor--medium.el-input__inner {
        width: 360px;
        margin-left: 10px;
    }

    .is-active {
        background: @subjectColor !important;
        color: @white !important;
    }

    .el-date-editor {
        &.is-active {
            background: #F4F4F9 !important
        }
    }

    .el-date-editor {
        width: 354px;
    }
}

@media screen and (max-width: 1380px) {
    .monitor-button {
        .el-button {
            padding-right: 8px;
            padding-left: 8px;
        }
    }
}
</style>
