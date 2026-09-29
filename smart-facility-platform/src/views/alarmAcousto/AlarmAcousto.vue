<template>
    <div v-loading="loading"
         :element-loading-text="loadingText"
         class="alarm-acousto">
        <div class="session">
            <device-total
                :object="totalObject"
                @handle="handleQuery"
                @handleAll="handleQuery"/>
        </div>
        <div class="session">
            <div class="search-bar-container">
                <div>
                    <select-department
                        :department-id.sync="items.departmentId" :select-tree-value.sync="items.departmentId" @change="handleQuery(0)"/>
                    <el-input
                        v-model.trim="items.keyword"
                        class="input-with-select"
                        clearable
                        :placeholder="$t('common.inputKeyword')"
                        @keyup.enter.native="handleQuery(0)">
                        <el-button
                            slot="append"
                            class="el-button-host"
                            icon="icon-search1"
                            @click="handleQuery(0)">
                        </el-button>
                    </el-input>
                </div>
                <div v-if="$store.state.level">

                    <el-button class="icon-addto" type="primary" @click="handleAdd"> {{ $t("hardware.addSiren") }}</el-button>
                    <el-button v-if="$store.state.level" class="icon-setup" @click="multiSelect = !multiSelect">
                        {{ multiSelect ? $t('common.cancelMultiSelect') : $t('common.multiSelect') }}
                    </el-button>
                    <el-button class="icon-upload" @click="importFileVisible = !importFileVisible"> {{ $t('common.importHandle') }}</el-button>
                    <el-button class="icon-download1" @click="handleExport"> {{ $t('common.export') }}</el-button>
                </div>
            </div>
            <div v-if="multipleSelection.length || multiSelect" class="choose-bar">
                <template>
                    <div class="checked">
                        {{ $t('common.multipleSelection') }}<span>{{ multipleSelection.length }}</span>{{ $t('common.item') }}
                    </div>
                </template>
                <template>
                    <el-button @click="handleBatchUpdate($refs.UpdateAcousticOptic)">{{ $t('hardware.updateAcousticOptic') }}</el-button>
                    <el-button @click="handleBatchUpdate($refs.UpdateDepartment)">{{ $t('common.owningDepartment') }}</el-button>
                    <el-button @click="handleBatchUpdate($refs.BeepAlarmTime)">{{ $t('hardware.updateBeepAlarmTime') }}</el-button>
                    <el-button @click="handleBatchDeleteDevice">{{ $t('common.batchDelete') }}</el-button>
                </template>
            </div>
            <div class="sticky-head">
            <el-table
                ref="multipleTable"
                :data="alertor"
                :default-sort="{order: 'descending'}"
                :row-key="getRowKey"
                border
                size="medium"
                stripe
                @selection-change="handleSelectionChange"
                @sort-change="sortChange">
                <el-table-column v-if="$store.state.level" :reserve-selection="true" fixed type="selection"
                                 width="50"></el-table-column>
                <el-table-column fixed label="#" type="index" width="70px">
                    <template slot-scope="scope">
            <span v-if="`${total !== 0}`">{{
                    (items.pageNum - 1) * items.pageSize + scope.$index + 1
                }}</span>
                    </template>
                </el-table-column>
                <el-table-column fixed :label="$t('common.name')" min-width="130" prop="name" sortable>
                    <template slot-scope="scope">
                        <a @click="handleShowDrawer(scope.row)">{{ scope.row.name }}</a>
                    </template>
                </el-table-column>
                <el-table-column fixed :label="$t('common.no')" prop="no" min-width="130" sortable>
                    <template slot-scope="scope">
                        <a @click="handleShowDrawer(scope.row)">{{ scope.row.no }}</a>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('common.owningDepartment')" min-width="150" prop="departmentName" sortable/>
                <el-table-column :label="$t('hardware.status')" min-width="80">
                    <template slot-scope="scope">
                        <span :class="{ 'abnormal': scope.row.status === -1 }">
                          {{ onLineStatus(scope.row.status) }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('common.creatDate')" min-width="130" prop="createDate" sortable>
                    <template v-slot="scope">
                        {{ scope.row.createDate | localToUtc }}
                    </template>
                </el-table-column>
                <el-table-column :label="$t('hardware.isOnLine')" min-width="80">
                    <template slot-scope="scope">
            <span :class="scope.row.status === $STATUS.OFFLINE ? 'abnormal' : 'normal'">
              {{ handleStatus(scope.row.status) }}
            </span>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('hardware.signalStrength')" :min-width="100">
                    <template slot-scope="scope">
                        <device-signal :type="1" :data="scope.row"/>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('common.reportDate')" min-width="160" prop="reportDate" sortable>
                    <template v-slot="scope">
                        {{ scope.row.reportDate | localToUtc }}
                    </template>
                </el-table-column>
                <el-table-column v-if="$store.state.level" fixed="right" :label="$t('common.handle')" prop="index" min-width="150">
                    <template slot-scope="scope">
                        <el-col :span="12">
                            <el-button type="text" @click="handleDropdownMenu('UpdateDepartment', scope.row)">{{ $t('common.edit') }}
                            </el-button>
                        </el-col>
                        <el-col :span="12">
                            <el-button class="abnormal" type="text" @click="handleDelete(scope.row)">{{ $t('common.delete') }}</el-button>
                        </el-col>
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
                    @pagination="getList"/>
            </div>
        </div>
        <Create ref="Create" @handle="getList"/>
        <div>
            <Drawer :id.sync="alertorId" :is-drawer.sync="isDrawer"/>
        </div>
        <UpdateAcousticOptic ref="UpdateAcousticOptic" @handle="getList"/>
        <UpdateAlarmPlatform ref="UpdateAlarmPlatform" @handle="getList"/>
        <UpdateAlarmTime ref="UpdateAlarmTime" @handle="getList"/>
        <UpdateExportTime ref="UpdateExportTime" @handle="getList"/>
        <UpdateDepartment ref="UpdateDepartment" :departments="$store.state.departments" @handle="getList"/>
        <alarm-rules ref="AlarmRules" @handle="getList"/>
        <beep-alarm-time ref="BeepAlarmTime" @handle="getList"/>
        <ImportFile
            v-if="importFileVisible"
            :title="importTitle"
            @handleUpdateInit="handleUpdateInit"
            @hiddenModalVisible="hiddenModalVisible"></ImportFile>
    </div>
</template>

<script>
import StateCard from "@/components/StatCard"
import {EQUIPMENT_TYPE, items} from "@/utils/constant";
import Create from "@/views/alarmAcousto/components/Create";
import Pagination from "@/components/Pagination"
import {getDeviceList, getEquipmentDashboard, removeBatchDevice} from "@/api/device";
import UpdateDepartment from "@/views/device/components/UpdateDepartment";
import SelectDepartment from "@c/SelectdePartment";
import ImportFile from "@c/ImportFile/index";
import {outputPowerDevice} from "@/api/powerOutage";
import mixin from "@/utils/mixin";
import UpdateExportTime from "@/views/device/components/UpdateExportTime";
import UpdateAlarmTime from "@/views/device/components/UpdateAlarmTime";
import UpdateAlarmPlatform from "@/views/device/components/UpdateAlarmPlatform";
import UpdateAcousticOptic from "@/views/device/components/UpdateAcousticOptic";
import AlarmRules from "@/views/alarmAcousto/components/AlarmRules";
import BeepAlarmTime from "@/views/alarmAcousto/components/BeepAlarmTime";
import {judgeAlerter, onLineStatus, sensorType} from "@/utils/methods";
import DeviceTotal from "@c/DeviceTotal/index";
import moment from "moment";
import DeviceSignal from "@c/DeviceSignal/index";

export default {
    name: "AlarmAcousto",
    components: {
        SelectDepartment,
        UpdateDepartment,
        UpdateExportTime,
        UpdateAlarmTime,
        UpdateAlarmPlatform,
        DeviceSignal,
        UpdateAcousticOptic,
        Drawer: () => import("@/views/alarmAcousto/components/AlerterDrawer"),
        ImportFile,
        Create,
        StateCard,
        AlarmRules,
        BeepAlarmTime,
        DeviceTotal,
        Pagination
    },
    data() {
        const _this = this;
        return {
            onLineStatus,
            totalObject: {
                overview: [
                    {num: 0, title: _this.$t('common.normalNum'), status: 1},
                    {num: 0, title: _this.$t('common.abnormalNum'), status: -1},
                    {num: 0, title: _this.$t('common.offLineNum'), status: -100},
                    {num: 0, title: _this.$t('common.notActivateNum'), status: -99},
                ],
                total: {title: _this.$t('hardware.alertorSum'), num: 0}
            },
            items: {
                pageSize: items.PAGE_SIZE,
                pageNum: items.PAGE_NUM,
                keyword: "",
                departmentId: null,
                equipmentType: EQUIPMENT_TYPE.ALERTOR,
                status: 0
            },
            multipleSelection: [],
            loading: false,
            alertor: [],
            total: 0,
            isDrawer: false,
            alertorId: "",
            // 导入弹窗
            importFileVisible: false,
            importTitle: "alerter",
            multiSelect: false,
            loadingText: _this.$t('common.hintDefault'),
            columnSort: {
                name: "", //名称
                num: "", //编号
                department: "", //部门
                createTime: "" //创建时间
            }
        }
    },
    inject: ["reload"],
    watch: {
        multipleSelection: function (value) {
            this.multiSelect = Boolean(value.length);
        },
        multiSelect: function (value) {
            if (!value) {
                this.multipleSelection = [];
                this.$refs.multipleTable.clearSelection();
            }
        },
        alertor() {

        }
    },
    created() {
        const pageSize = localStorage.getItem("pageSize");
        if (pageSize) {
            this.items.pageSize = pageSize * 1;
        }
        this.getList();
        getEquipmentDashboard({equipmentType: EQUIPMENT_TYPE.ALERTOR}).then(res => {
            const {alarmCount, normalCount, offLineCount, total, noActivatedCount} = res.items;
            this.totalObject.total.num = total;
            this.totalObject.overview[0].num = normalCount;
            this.totalObject.overview[1].num = alarmCount;
            this.totalObject.overview[2].num = offLineCount;
            this.totalObject.overview[3].num = noActivatedCount;
        })
    },
    methods: {
        alerterType(value) {
            return judgeAlerter(value);
        },
        alarmType(item) {
            if (judgeAlerter(item.no)) {
                return {str: item.status === 1 ? this.$t('common.normal') : (item.status === -100 ? this.$t('common.offLine'): this.$t('common.abnormal')), status: item.status};
            } else {
                return {
                    str: item.defenceAlarmStatus && item.powerFailure ? this.$t('common.normal') : this.$t('common.abnormal'),
                    status: item.defenceAlarmStatus
                };
            }
        },
        getRowKey(row) {
            return row.id;
        },
        handleSensorType(value) {
            return sensorType(value);
        },
        handleBatchUpdate(val, type) {
            if (!this.multipleSelection.length) {
                return this.$message.error(this.$t("hardware.selectAlertor"));
            }
            if (type) {
                val.open(1, this.alertor[0], this.multipleSelection);
            } else {
                val.open(1, this.multipleSelection);
            }
        },
        handleSelectionChange(val) {
            this.multipleSelection = [];
            val.map(item => {
                this.multipleSelection.push(item.id);
            })
        },
        // 上传成功后更新初始化
        handleUpdateInit() {
            this.importFileVisible = false;
            this.reload();
        },
        // 隐藏弹窗
        hiddenModalVisible() {
            this.updateModalVisible = false;
            this.importFileVisible = false
        },
        handleExport() {
            new Promise(resolve => {
                this.$message.warning(this.$t("common.exportMessage"));
                setTimeout(() => {
                    resolve();
                }, 2500)
            }).then(() => {
                outputPowerDevice(this.items).then(res => {
                    const data = moment(new Date()).format("YYYYMMDDHHmmss");
                    mixin.methods.download(
                        res,
                        decodeURIComponent(this.$t("hardware.alertorExport") + data, "UTF-8")
                    )
                })
            })
        },
        handleBatchDeleteDevice() {
            if (!this.multipleSelection.length) {
                return this.$message.error(this.$t("hardware.selectDelectAlertor"));
            }
            this.$confirm(this.$t("hardware.deleteBacthAlertorMessage"), this.$t("hardware.deleteAlertor"), {
                confirmButtonText: this.$t('common.confirm'),
                cancelButtonText: this.$t('common.cancel'),
                type: "warning",
            }).then(() => {
                this.loading = true;
                this.loadingText = this.$t('common.hintDelete');
                removeBatchDevice({ids: this.multipleSelection}).then(res => {
                    this.loading = false;
                    this.loadingText = this.$t('common.hintDefault');
                    if (res.code) {
                        this.$message.success(this.$t('common.deleteBatchSuccess'));
                        this.multipleSelection = [];
                        this.$refs.multipleTable.clearSelection();
                        this.reload();
                    } else {
                        this.$message.error(this.$t('common.deleteError') + res.message);
                    }
                })
            }).catch(() => {
                this.$message.info(this.$t('common.deleteCanceled'))
            })
        },
        handleDropdownMenu(val, row) {
            let obj;
            if (val == "AlarmRules") {
                obj = row.no;
            } else {
                obj = row;
            }
            this.$refs[val].open(0, obj);
        },
        handleQuery(index) {
            this.items.status = index;
            this.getList();
        },
        getList() {
            this.loading = true;
            this.items['sortName'] = this.columnSort;
            getDeviceList(this.items).then(res => {
                this.loading = false;
                if (res.code) {
                    this.alertor = res.items.list;
                    this.total = res.items.total;
                } else {
                    this.$message.error(res.message)
                }
            })
        },
        handleAdd() {
            this.$refs.Create.open(0);
        },
        handleDelete(row) {
            this.$confirm(this.$t('common.deletePrincipalMessage1') + row.name + this.$t('hardware.deletePowerOutageMessage2'), this.$t('hardware.deleteAlertor'), {
                confirmButtonText: this.$t('common.confirm'),
                cancelButtonText: this.$t('common.cancel'),
                type: "warning",
            }).then(() => {
                removeBatchDevice({ids: [row.id]}).then(res => {
                    if (res.code) {
                        this.$message.success(this.$t('common.deleteSuccess'));
                        if (this.alertor.length === 1) {
                            this.items.pageNum = this.items.pageNum > 1 ? this.items.pageNum - 1 : 1;
                        }
                        this.getList();
                    } else {
                        this.$message.error(res.message);
                    }
                })
            })
        },
        handleShowDrawer(row) {
            this.isDrawer = true;
            this.alertorId = row.strId;
        },
        handleStatus(value) {
            if (value === -100) {
                return this.$t('common.offLine')
            } else if (value === 0) {
                return this.$t('common.notActivate')
            } else {
                if (value === 1 || value < 0 || value != -100) {
                    return this.$t('common.isLine')
                }
            }
        },
        sortChange(e) {
            var propName = e.prop;
            var sortOrder = e.order;
            if (sortOrder && sortOrder == 'ascending') {
                sortOrder = 'asc';
            }
            if (sortOrder && sortOrder == 'descending') {
                sortOrder = 'desc';
            }
            Object.keys(this.columnSort).forEach((key) => {
                this.columnSort[key] = '';
            })
            if (e.prop == 'no') {
                propName = 'num';
            } else if (e.prop == 'createDate') {
                propName = 'createTime';
            } else if (e.prop == 'departmentName') {
                propName = 'department';
            } else if (e.prop == 'name') {
                propName = 'name';
            } else {
                propName = '';
            }
            if (propName && sortOrder) {
                this.columnSort[propName] = sortOrder;
            }
            this.getList();
        }
    }
}
</script>
<style lang="less" src="../../style/table_sticky.less" scoped></style>
