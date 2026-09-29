<template>
    <div class="history-alarm-record" v-loading="loading">
        <el-row type="flex" justify="space-between">
            <el-col :span="type !== 1 ? 22 : 24">
                <el-tabs v-model="activeName" @tab-click="handleClick">
                    <template v-if="type === 1">
                        <el-tab-pane
                            v-for="item in sensors"
                            :key="item.idx"
                            :name="(item.idx + '')"
                            :label="item.sensorAlias">
                        </el-tab-pane>
                    </template>
                    <template v-else>
                        <el-tab-pane
                            v-for="item in sensors"
                            :key="item.objSensorId"
                            :name="item.objSensorId"
                            :label="item.sensorAlias">
                        </el-tab-pane>
                    </template>
                    <el-tab-pane :label="$t('common.offLineAlarm')" name="offlineAlarm"></el-tab-pane>
                    <el-tab-pane v-if="type !== 1" :label="$t('labDevice.myAlarm')" name="myAlarm"></el-tab-pane>
                </el-tabs>
            </el-col>
            <el-button
                v-if="type !== 1"
                class="h40"
                type="primary"
                @click="handleExport">
                {{ $t('common.export') }}
            </el-button>
        </el-row>
        <Table v-if="activeName !== 'myAlarm'" :tableData="tableData" :data="list">
            <template slot-scope="data">
                <div v-if="data.prop === 'objType'">
                    {{ THINGTYPE2[Number(data.data.objType)] }}
                </div>
                <div v-if="type === 1 && data.prop === 'objName'">
                    {{ Number(data.data.objType) === 1 ? thingDetail.name : data.data.objName }}
                </div>
                <div v-if="data.prop === 'alarmRange'">
                    <span v-if="data.data.monitorNormalMin !== undefined && data.data.monitorNormalMax !== undefined">
                        {{ data.data.monitorNormalMin }} ~ {{ data.data.monitorNormalMax }}
                    </span>
                </div>
                <div v-if="data.prop === 'alarmTime'">
                    <div>
                        {{ $t('labDevice.startTime') }}：{{ data.data.alarmStartTime | localToUtc }}
                    </div>
                    <div>
                        {{
                            $t('labDevice.endTime')
                        }}：{{
                            data.data.alarmFlag ? $options.filters['localToUtc'](data.data.monitorAlarmEndTime) : ""
                        }}
                    </div>
                </div>
                <div v-if="data.prop === 'operation'">
                    <el-button
                        v-if="data.data.alarmFlag && activeName !== 'offlineAlarm'"
                        type="text"
                        :class="data.data.process ? '' : 'abnormal'"
                        @click="handleAlarmProcess(data.data)">
                        {{ data.data.process ? $t('hardware.editDisposeAlarm') : $t('hardware.addDisposeAlarm') }}
                    </el-button>
                </div>
            </template>
        </Table>
        <Table v-else :tableData="myAlarmRecordTable" :data="myAlarmRecordData">
            <template slot-scope="data">
                <el-table-column
                    v-if="data.prop !== 'objType' && data.prop !== 'receptionList'"
                    label="#"
                    type="index"
                    :index="getIndex">
                </el-table-column>

                <div v-if="type === 1 && data.prop === 'objType'">
                    {{ THINGTYPE2[Number(data.data.objType)] }}
                </div>

                <div v-if="data.prop === 'receptionList'">
                    <span v-for="(item,index) in data.data.receptionList" :key="index">
                        {{ item }}
                    </span>
                </div>
            </template>
        </Table>
        <div class="paging">
            <pagination
                v-show="total > pageSize"
                :limit.sync="pageSize"
                :page.sync="pageNum"
                :total="total"
                @pagination="getList"/>
        </div>

        <AlarmProcessing ref="AlarmProcessing" @handle="getList"/>
        <alarm-log-export ref="alarmLogExport"/>
    </div>
</template>

<script>
import {postMonitorIndicatorHistoryAlarmRecord, getMonitorIndicatorMyAlarmRecord} from "@/api/monitorIndicator";
import {getHistoryDeviceAlarm} from "@/api/device";
import Table from "@c/Tables";
import Pagination from "@/components/Pagination/index";
import AlarmProcessing from "@/components/AlarmProcessing";
import {THINGTYPE2} from "@/utils/constant";
import AlarmLogExport from "@/views/labDevice/components/AlarmLogExport";

export default {
    components: {
        AlarmLogExport,
        Table,
        Pagination,
        AlarmProcessing
    },
    props: {
        id: {
            type: Number,
            default: null
        },
        // 1硬件 2设备，3房间
        type: {
            type: Number,
            default: null
        },
        no: {
            type: String,
            default: null
        }
    },
    data() {
        const _this = this;
        return {
            THINGTYPE2,
            loading: false,
            thingDetail: this.$store.state.thingDetail,
            objSensorId: "",
            monitorSensorCatId: null,
            sensors: [],
            activeName: "",
            pageNum: 1,
            pageSize: 10,
            total: 0,
            tableData: [
                {
                    label: "#",
                    type: "index"
                },
                {
                    label: _this.$t('hardware.owningDevice'),
                    prop: "equipmentName"
                },
                {
                    label: _this.$t('hardware.alarmValue'),
                    prop: "monitorSensorVal"
                },
                {
                    label: _this.$t('hardware.alarmScoped'),
                    prop: "alarmRange",
                    isSlot: true
                },
                {
                    label: _this.$t('labDevice.alarmTime'),
                    prop: "alarmTime",
                    width: "230",
                    isSlot: true
                },
                {
                    label: _this.$t('hardware.beepAlarmTime'),
                    prop: "durationFormat"
                },
                {
                    label: _this.$t('common.handle'),
                    prop: "operation",
                    isSlot: true,
                    width: "100"
                }
            ],
            list: [],
            myAlarmRecordTable: [
                {
                    label: "#",
                    prop: "index",
                    isSlotColumn: true
                },
                {
                    label: _this.$t('hardware.owningDevice'),
                    prop: "equipmentName",
                    width: "150"
                },
                {
                    label: _this.$t('hardware.sensorAlias'),
                    prop: "sensorAlias"
                },
                {
                    label: _this.$t('hardware.alarmValue'),
                    prop: "monitorSensorVal",
                },
                {
                    label: _this.$t('hardware.alarmScoped'),
                    prop: "alarmRange",
                },
                {
                    label: _this.$t('hardware.alarmType'),
                    prop: "noticeType"
                },
                {
                    label: _this.$t('common.receptionUse'),
                    prop: "userName"
                },
                {
                    label: _this.$t('common.receptionType'),
                    prop: "receptionList",
                    isSlot: true,
                    width: "200"
                },
                {
                    label: _this.$t('common.receptionTime'),
                    prop: "time",
                    width: "180"
                },
            ],
            myAlarmRecordData: []
        }
    },
    created() {
        if (this.type === 1) {
            this.tableData = [
                {
                    label: "#",
                    type: "index"
                },
                {
                    label: this.$t('hardware.bindType'),
                    prop: "objType",
                    isSlot: true
                },
                {
                    label: this.$t('hardware.bindThings'),
                    prop: "objName",
                    isSlot: true
                },
                {
                    label: this.$t('hardware.alarmValue'),
                    prop: "monitorSensorVal"
                },
                {
                    label: this.$t('hardware.alarmScoped'),
                    prop: "alarmRange",
                    isSlot: true
                },
                {
                    label: this.$t('labDevice.alarmTime'),
                    prop: "alarmTime",
                    width: "230",
                    isSlot: true
                },
                {
                    label: this.$t('hardware.beepAlarmTime'),
                    prop: "durationFormat"
                },
                {
                    label: this.$t('hardware.updateValue'),
                    prop: "monitorAlarmEndVal"
                },
                {
                    label: this.$t('common.handle'),
                    prop: "operation",
                    isSlot: true,
                    width: "80"
                }
            ];
            this.myAlarmRecordTable = [
                {
                    label: "#",
                    prop: "index",
                    isSlotColumn: true
                },
                {
                    label: this.$t('hardware.bindType'),
                    prop: "objType",
                    isSlot: true
                },
                {
                    label: this.$t('hardware.sensorAlias'),
                    prop: "sensorAlias"
                },
                {
                    label: this.$t('hardware.alarmValue'),
                    prop: "monitorSensorVal",
                },
                {
                    label: this.$t('hardware.alarmScoped'),
                    prop: "alarmRange",
                },
                {
                    label: this.$t('hardware.alarmType'),
                    prop: "noticeType"
                },
                {
                    label: this.$t('common.receptionUse'),
                    prop: "userName"
                },
                {
                    label: this.$t('common.receptionType'),
                    prop: "receptionList",
                    isSlot: true,
                    width: "200"
                },
                {
                    label: this.$t('common.receptionTime'),
                    prop: "time",
                    width: "180"
                },
            ]
        }
    },
    watch: {
        '$store.state.deviceSensorsFlag'() {
            if (this.type == 1) {
                this.init()
            }
        }
    },
    mounted() {
        if (this.type != 1) {
            this.init()
        }
    },
    methods: {
        handleExport() {
            this.$refs.alarmLogExport.open(this.sensors, this.type, {id: this.id,no: this.no});
        },
        init() {
            if (this.type === 1) {
                var sensorsFlag = this.$store.state.deviceSensorsFlag;
            } else {
                var sensorsFlag = this.$store.state.sensorsFlag;
            }
            this.sensors = [];
            if (sensorsFlag.length > 0) {
                for (var i = 0; i < sensorsFlag.length; i++) {
                    this.sensors.push(sensorsFlag[i])
                }
                if (this.sensors.length > 0) {
                    if (this.type === 1) {
                        this.objSensorId = this.sensors[0].objSensorIds;
                        this.activeName = this.sensors[0].idx + ""
                    } else {
                        this.objSensorId = this.sensors[0].objSensorId;
                        this.activeName = this.objSensorId
                    }
                } else {
                    this.activeName = 'offlineAlarm'
                }
                this.monitorSensorCatId = this.sensors[0].monitorSensorCatId;
                this.getList()
            } else {
                this.activeName = 'offlineAlarm'
            }
        },
        getList() {
            if (this.activeName === 'myAlarm') {
                this.getMyAlarmRecord();
                return
            }
            if (this.activeName === 'offlineAlarm') {
                var data = {
                    objId: this.id,
                    objType: this.type,
                    thingsCreateDate: this.thingDetail.createDate,
                    monitorSensorCatId: this.monitorSensorCatId,
                    pageNum: this.pageNum,
                    pageSize: this.pageSize
                }
            } else {
                var data = {
                    objSensorIds: this.type === 1 ? this.objSensorId : [this.objSensorId],
                    thingsCreateDate: this.thingDetail.createDate,
                    monitorSensorCatId: this.monitorSensorCatId,
                    pageNum: this.pageNum,
                    pageSize: this.pageSize
                }
            }
            this.loading = true;
            postMonitorIndicatorHistoryAlarmRecord(data).then(res => {
                this.loading = false;
                if (res.code === 1) {
                    this.list = res.items.list;
                    this.total = res.items.total
                }
            })
        },
        getMyAlarmRecord() {
            var data = {
                createDate: this.thingDetail.createDate,
                objId: this.thingDetail.id,
                objType: this.type,
                monitorSensorCatId: this.monitorSensorCatId,
                pageNum: this.pageNum,
                pageSize: this.pageSize
            }
            this.loading = true;
            getMonitorIndicatorMyAlarmRecord(data).then(res => {
                this.loading = false;
                if (res.code === 1) {
                    this.myAlarmRecordData = res.items.list;
                    this.total = res.items.total;
                }
            })
        },
        getDeviceAlarm() {
            var data = {
                deviceId: this.thingDetail.id,
                monitorSensorCatId: this.monitorSensorCatId,
                pageNum: this.pageNum,
                pageSize: this.pageSize,
            }
            getHistoryDeviceAlarm(data).then(res => {
                if (res.code === 1) {
                    this.myAlarmRecordData = res.items.list;
                    this.total = res.items.total;
                }
            })
        },
        handleAlarmProcess(row) {
            this.$refs.AlarmProcessing.open(row)
        },
        handleClick() {
            let sensorsFlag = null;
            if (this.type === 1) {
                sensorsFlag = this.$store.state.deviceSensorsFlag;
            } else {
                sensorsFlag = this.$store.state.sensorsFlag;
            }
            console.log(this.sensors)
            for (var i = 0; i < this.sensors.length; i++) {
                if (this.type === 1) {
                    if (this.sensors[i].idx === parseInt(this.activeName)) {
                        this.monitorSensorCatId = this.sensors[i].monitorSensorCatId
                    }
                } else {
                    if (this.sensors[i].objSensorId === this.activeName) {
                        this.monitorSensorCatId = this.sensors[i].monitorSensorCatId
                    }
                }
            }
            this.pageNum = 1;
            this.pageSize = 10;
            this.total = 0;
            if (this.activeName !== "myAlarm") {
                if (sensorsFlag.length > 0) {
                    if (this.type === 1) {
                        for (var i = 0; i < sensorsFlag.length; i++) {
                            if (sensorsFlag[i].idx === Number(this.activeName)) {
                                this.objSensorId = sensorsFlag[i].objSensorIds
                            }
                        }
                    } else {
                        this.objSensorId = this.activeName;
                    }
                    this.getList()
                }
            } else {
                // if(this.type === 1){
                //     this.getDeviceAlarm()
                // }else{
                //     this.getMyAlarmRecord()
                // }
                this.getMyAlarmRecord()
            }
        },
        getIndex(index) {
            const page = this.pageNum
            const pagesize = this.pageSize
            // 当前页数 - 1 * 每页数据条数 + index + 1
            return (page - 1) * pagesize + index + 1
        },
    },
}
</script>

<style lang="less" scoped>
.history-alarm-record {
    /deep/ .el-table .el-table__body td .cell:empty::after,
    /deep/ .el-table .el-table__body td .cell > span:empty::after,
    /deep/ .el-table .el-table__body td .cell .approval:empty::after,
    /deep/ .el-table .el-table__body td .cell div:empty::after,
    /deep/ .el-table .el-table__body td .cell .line-limit-length:empty::after {
        content: '-';
    }
}

.h40 {
    height: 40px;
}
</style>