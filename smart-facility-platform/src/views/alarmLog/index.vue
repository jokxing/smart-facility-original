<template>
    <div v-loading="loading">
        <div class="session">
            <SelectDepartment
                :departmentId.sync="items.departmentId"
                @change="handleQuery()"
                :select-tree-value.sync="items.departmentId"/>
            <el-select
                class="margin-small-right"
                :placeholder="$t('system.alarmStatus')"
                clearable
                @change="handleQuery(null)"
                v-model="items.status">
                <el-option
                    v-for="item in alarmStatusList"
                    :label="item.label"
                    :value="item.value">
                </el-option>
            </el-select>
            <el-select
                class="margin-small-right"
                :placeholder="$t('hardware.monitorIndex')"
                clearable
                @change="handleQuery(null)"
                v-model="items.sensorCatId">
                <el-option
                    v-for="item in sensorList"
                    :label="item.name + (item.unit ? '（' + item.unit + '）' : '')"
                    :value="item.id">
                </el-option>
            </el-select>
            <el-date-picker
                type="datetimerange"
                :range-separator="$t('common.most')"
                :start-placeholder="$t('common.startDate')"
                :end-placeholder="$t('common.endDate')"
                value-format="yyyy-MM-dd HH:mm:ss"
                class="margin-small-right"
                :picker-options="pickerOptions"
                v-model="time"
                @change="handleSelectTime"/>
            <el-input
                v-model.trim="items.key"
                class="input-with-select margin-small-right"
                clearable
                :placeholder="$t('system.inputHardware')"
                @keyup.enter.native="handleQuery(null)">
                <el-button
                    slot="append"
                    class="el-button-host"
                    icon="icon-search1"
                    @click="handleQuery(null)">
                </el-button>
            </el-input>
            <el-button class="icon-reset" @click="handleInit"></el-button>
        </div>
        <div class="session">
            <el-row type="flex" justify="space-between">
                <el-button @click="handleAlarmProcess(null)">{{ $t('system.batchHandle') }}</el-button>
                <el-button v-if="$store.state.level" class="icon-download1" @click="handleExport">
                    {{ $t('common.export') }}
                </el-button>
            </el-row>
            <div class="sticky-head">
                <el-table
                    class="margin-center"
                    :data="list"
                    border
                    stripe
                    @selection-change="handleSelectionChange"
                    style="width: 100%">
                    <el-table-column
                        type="selection"
                        align="center"
                        width="55">
                    </el-table-column>
                    <el-table-column type="index" label="#" width="60">
                        <template v-slot="scope">
                            {{ items.pageNum > 1 ? (items.pageNum - 1) * items.pageSize + scope.$index + 1 : scope.$index + 1 }}
                        </template>
                    </el-table-column>
                    <el-table-column
                        prop="equipmentName"
                        :label="$t('hardware.devciceName')"
                        width="180">
                    </el-table-column>
                    <el-table-column
                        prop="equipmentNo"
                        :label="$t('hardware.devciceNo')"
                        width="180">
                    </el-table-column>
                    <el-table-column
                        prop="sensorAlias"
                        width="120"
                        :label="$t('hardware.monitorIndex')">
                    </el-table-column>
                    <el-table-column
                        prop="monitorSensorVal"
                        :label="$t('hardware.alarmValue')"
                        width="120">
                    </el-table-column>
                    <el-table-column
                        prop="statusStr"
                        :label="$t('hardware.status')"
                        width="90">
                        <template v-slot="scope">
                            <span class="abnormal" v-if="[2, 3].includes(scope.row.status)">
                                {{ scope.row.statusStr }}
                            </span>
                            <span v-else>{{ scope.row.statusStr }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column
                        prop="alarmRange"
                        :label="$t('hardware.alarmScoped')"
                        width="140">
                        <template v-slot="scope">
                        <span v-if="scope.row.monitorNormalMin !== undefined && scope.row.monitorNormalMax !== undefined">
                        {{ scope.row.monitorNormalMin }} ~ {{ scope.row.monitorNormalMax }}
                        </span>
                        </template>
                    </el-table-column>
                    <el-table-column
                        prop="alarmHandleUser"
                        :label="$t('labDevice.alarmStartTime')"
                        width="160">
                        <template v-slot="scope">
                            {{ scope.row.monitorAlarmStartTime | localToUtc }}
                        </template>
                    </el-table-column>
                    <el-table-column
                        prop="alarmHandleResult"
                        width="160"
                        :label="$t('system.alarmEndTime')">
                        <template v-slot="scope">
                            {{ scope.row.monitorAlarmEndTime | localToUtc }}
                        </template>
                    </el-table-column>
                    <el-table-column
                        prop="durationFormat"
                        width="110"
                        :label="$t('hardware.beepAlarmTime')">
                    </el-table-column>
                    <el-table-column
                        prop="departmentName"
                        :label="$t('common.owningDepartment')">
                    </el-table-column>
                    <el-table-column width="180" prop="objName" :label="$t('hardware.association')"/>
                    <el-table-column
                        fixed="right"
                        :label="$t('common.handle')"
                        width="110">
                        <template v-slot="scope">
                            <el-button
                                v-if="scope.row.monitorAlarmEndTime"
                                type="text"
                                :class="scope.row.process ? '' : 'abnormal'"
                                @click="handleAlarmProcess(scope.row)">
                                {{ scope.row.process ? $t('hardware.editDisposeAlarm') : $t('hardware.addDisposeAlarm') }}
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="paging">
                <pagination
                    v-show="total > 10"
                    :limit.sync="items.pageSize"
                    :page.sync="items.pageNum"
                    :total="total"
                    :page-sizes="$store.state.pageSizes"
                    @pagination="handleQuery(1)"/>
            </div>
        </div>
        <alarm-processing @refresh="handleRefresh" :items="selections" ref="alarmProcessing"/>
    </div>
</template>

<script>
import SelectDepartment from "@c/SelectdePartment";
import {getAllSensorTypeV2} from "../../api/monitorIndicator";
import AlarmProcessing from "../alarmLog/components/AlarmProcessing";
import {batchHandleException, exportAlarmRecord, getAlarmRecordList} from "../../api/alarmLog";
import moment from "moment";
import mixin from "@/utils/mixin";
import Pagination from "@/components/Pagination/index";
export default {
    name: "index",
    components: {
        AlarmProcessing,
        SelectDepartment,
        Pagination
    },
    data() {
        const _this = this;
        return {
            loading: false,
            items:{
                departmentId: null,
                key: "",
                status: null,
                startDate: null,
                endDate: null,
                sensorCatId: null,
                pageSize: 10,
                pageNum: 1,
            },
            selections: [],
            alarmStatusList: [
                {
                    label: _this.$t('hardware.taskStatus2'),
                    value: 1
                },
                {
                    label: _this.$t('system.unHandle'),
                    value: 2
                },
                {
                    label: _this.$t('system.alarmIng'),
                    value: 3
                }
            ],
            sensorList: [],
            list: [],
            time: [],
            total: 0,
            pickerOptions: {
                shortcuts: [{
                    text: _this.$t('common.recentlyWeek'),
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: _this.$t('common.recentlyMonth'),
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: _this.$t('common.recentlyThreeMonth'),
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                        picker.$emit('pick', [start, end]);
                    }
                }]
            },
        }
    },
    created() {
        this.handleGetSensorList();
        this.handleGetList();
    },
    methods: {
        handleSelectTime(val) {
            if (!val) {
                this.items.startDate = null;
                this.items.endDate = null;
            } else {
                this.items.startDate = val[0];
                this.items.endDate = val[1];
            }
            this.handleQuery();
        },
        handleQuery(val) {
            if (val) {
                this.handleGetList();
            } else {
                this.items.pageNum = 1;
                this.handleGetList();
            }
        },
        handleGetList() {
            this.loading = true;
            const params = {
                status: this.items.status ? [this.items.status] : [],
                departmentId: this.items.departmentId ? [this.items.departmentId] : [],
                key: this.items.key,
                sensorCatId: this.items.sensorCatId ? [this.items.sensorCatId] : [],
                startDate: this.items.startDate,
                endDate: this.items.endDate,
                pageSize: this.items.pageSize,
                pageNum: this.items.pageNum,
            };
            getAlarmRecordList(params).then(res => {
                if (res.code) {
                    this.list = res.items.list;
                    this.total = res.items.total || 0;
                } else {
                    this.$message.error(res.message);
                }
            }).finally(() => {
                this.loading = false;
            })
        },
        // 获取探头列表
        handleGetSensorList() {
            getAllSensorTypeV2().then(res => {
                if (res.code) {
                    this.sensorList = res.items;
                }
            })
        },
        handleInit() {
            this.items = {
                departmentId: null,
                alarmStatus: null,
                keyword: "",
                pageSize: 10,
                pageNum: 1,
            };
            this.time = [];
            this.handleQuery();
        },
        handleExport() {
            const _this = this;
            new Promise(resolve => {
                this.$message.warning(_this.$t("common.exportMessage"));
                setTimeout(() => {
                    resolve();
                }, 1500)
            }).then(() => {
                const params = {
                    status: this.items.status ? [this.items.status] : [],
                    departmentId: this.items.departmentId ? [this.items.departmentId] : [],
                    key: this.items.key,
                    sensorCatId: this.items.sensorCatId ? [this.items.sensorCatId] : [],
                    startDate: this.items.startDate,
                    endDate: this.items.endDate,
                };
                exportAlarmRecord(params).then(res => {
                    const data = moment(new Date()).format("YYYYMMDDHHmmss");
                    mixin.methods.download(
                        res,
                        decodeURIComponent(_this.$t("system.alarmHistory") + data, "UTF-8")
                    )
                })
            })
        },
        handleAlarmProcess(row) {
            if (row) {
                this.selections = [row];
            }
            this.$refs.alarmProcessing.open(this.selections);
        },
        handleSelectionChange(val) {
            console.log(val);
            this.selections = val;
        },
        handleRefresh() {
            this.handleGetList();
        },
    },
}
</script>
<style lang="less" src="../../style/table_sticky.less" scoped></style>

<style scoped>
</style>
