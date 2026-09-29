<template>
    <div v-loading="loading"
         :element-loading-text="loadingText">
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
                        :departmentId.sync="items.departmentId"
                        :select-tree-value.sync="items.departmentId"
                        @change="handleQuery"/>
                    <el-input
                        v-model.trim="items.keyword"
                        class="input-with-select"
                        clearable
                        :placeholder="$t('hardware.deviceSearch')"
                        @keyup.enter.native="handleQuery($STATUS.ALL)">
                        <el-button
                            slot="append"
                            icon="icon-search1"
                            class="el-button-host"
                            @click="handleQuery($STATUS.ALL)">
                        </el-button>
                    </el-input>
                </div>
                <div>
                    <el-button v-if="$store.state.level" class="icon-addto" type="primary" @click="handleAdd">
                        {{ $t("hardware.addSmartSocket") }}
                    </el-button>
                    <el-button v-if="$store.state.level" class="icon-setup" @click="multiSelect = !multiSelect">
                        {{ multiSelect ? $t('common.cancelMultiSelect') : $t('common.multiSelect') }}
                    </el-button>
                    <el-button v-if="$store.state.level" class="icon-upload"
                               @click="importFileVisible = !importFileVisible"> {{ $t('common.importHandle') }}
                    </el-button>
                    <el-button v-if="$store.state.level" class="icon-download1" @click="handleExport">
                        {{ $t('common.export') }}
                    </el-button>
                </div>
            </div>
            <div v-if="multipleSelection.length || multiSelect" class="choose-bar">
                <template>
                    <div class="checked">
                        {{ $t('common.multipleSelection') }}<span>{{
                            multipleSelection.length
                        }}</span>{{ $t('common.item') }}
                    </div>
                </template>
                <template>
<!--                    <el-button @click="handleBatchUpdate($refs.UpdateAlarmPlatform)">{{ $t('hardware.updateAlarmPlatform') }}</el-button>-->
                    <el-button @click="handleBatchUpdate($refs.UpdateAcousticOptic)">{{ $t('hardware.updateAcousticOptic') }}</el-button>
<!--                    <el-button @click="handleBatchUpdate($refs.UpdateDepartment)">{{ $t('common.owningDepartment') }}</el-button>-->
<!--                    <el-button @click="handleBatchUpdate($refs.UpdateExportTime)">{{ $t('hardware.updateExportTime') }}</el-button>-->
<!--                    <el-button @click="handleBatchUpdate($refs.UpdateAlarmTime)">{{ $t('hardware.updateAlarmTime') }}</el-button>-->
                    <el-button @click="handleBatchUpdate($refs.UpdateAlarmRules, true)">
                        {{ $t('hardware.updateAlarmRules1') }}
                    </el-button>
                    <el-button @click="handleBatchUpdate($refs.SetPrincipal)">{{
                            $t('common.setPrincipal')
                        }}
                    </el-button>
                    <el-button @click="handleBatchDeleteDevice">{{ $t('common.batchDelete') }}</el-button>
                </template>
            </div>
            <div class="sticky-head">
                <el-table
                    ref="multipleTable"
                    :data="smartSocket"
                    :default-sort="{order: 'descending'}"
                    :row-key="getRowKey"
                    size="medium"
                    stripe
                    border
                    @selection-change="handleSelectionChange"
                    @sort-change="sortChange">
                    <el-table-column
                        v-if="$store.state.level" fixed reserve-selection type="selection"
                        width="50"></el-table-column>
                    <el-table-column fixed label="#" type="index" width="70px">
                        <template slot-scope="scope">
                        <span v-if="`${total !== 0}`">
                            {{ (items.pageNum - 1) * items.pageSize + scope.$index + 1 }}
                        </span>
                        </template>
                    </el-table-column>
                    <el-table-column fixed :label="$t('common.name')" min-width="130" prop="name" sortable>
                        <template v-slot="scope">
                            <a @click="handleShowDrawer(scope.row)">
                                {{ scope.row.name }}
                            </a>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('hardware.devciceNo')" min-width="120" prop="no" sortable>
                        <template v-slot="scope">
                            <a @click="handleShowDrawer(scope.row)">
                                {{ scope.row.no }}
                            </a>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('hardware.value')" min-width="200">
                        <template v-slot="scope">
                            <hardwareValue :data="scope.row"/>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('common.owningDepartment')" min-width="120" prop="departmentName"
                                     sortable></el-table-column>

                    <!-- <el-table-column :label="$t('hardware.alarmScoped')" min-width="150">
                        <template v-slot="scope">
                            <div
                                v-for="item in scope.row.sensors"
                                :key="item.idx"
                                v-html="handleAlarm(item)"
                            ></div>
                        </template>
                    </el-table-column> -->
                    <el-table-column :label="$t('hardware.association')" min-width="150">
                        <template v-slot="scope">
                            <div v-if="scope.row.relevancyName">{{ scope.row.relevancyName }}</div>
                            <div v-else>{{ $t('hardware.notAssociation') }}</div>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('hardware.signalStrength')" min-width="160">
                        <template v-slot="scope">
                            <!-- <device-signal :data="scope.row"/> -->
                            {{ scope.row ? handleSignalStateFilter(scope.row) : '' }}
                            <div :class="scope.row.detectFlag ? 'abnormal' : ''">{{
                                    scope.row.detectFlag ? $t('hardware.detected') : ""
                                }}
                            </div>
                        </template>
                    </el-table-column>

                    <!--                <el-table-column :label="$t('hardware.detectionDate')" min-width="130">-->
                    <!--                    <template v-slot="scope">-->
                    <!--                        <div v-if="scope.row.reportDate">-->
                    <!--                          <span>{{ scope.row.reportDate.split(' ')[0] }}</span>-->
                    <!--                          <br />-->
                    <!--                          <span>{{ scope.row.reportDate.split(' ')[1] }}</span>-->
                    <!--                        </div>-->
                    <!--                    </template>-->
                    <!--                </el-table-column>-->
                    <el-table-column :label="$t('common.creatDate')" min-width="130" prop="createDate" sortable>
                        <template v-slot="scope">
                            <div v-if="scope.row.createDate">
                                {{ scope.row.createDate | localToUtc }}
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column v-if="$store.state.level" fixed="right" :label="$t('common.handle')"
                                     min-width="110">
                        <template v-slot="scope">
                            <el-col :span="8">
                                <el-button type="text" @click="handleDropdownMenu('UpdateDepartment', scope.row)">
                                    {{ $t('common.edit') }}
                                </el-button>
                            </el-col>
                            <el-col :span="8">
                                <el-button type="text" class="abnormal" @click="handleDeleteDevice(scope.row)">
                                    {{ $t('common.delete') }}
                                </el-button>
                            </el-col>
                            <!-- <el-col :span="12">
                                <el-button type="text" @click="handleDropdownMenu('SetPrincipal', scope.row.id)">{{ $t('common.principal') }}
                                </el-button>
                            </el-col> -->
                            <!-- <el-col :span="8">
                                <el-dropdown trigger="click" @command="handleDropdownMenu($event, scope.row)">
                                      <span class="el-dropdown-link el-icon-more" style="line-height:40px;">
                                      </span>
                                    <el-dropdown-menu slot="dropdown">
                                        <el-dropdown-item command="StandbyPower">{{ $t('hardware.standbyPower') }}</el-dropdown-item>
                                        <el-dropdown-item :disabled="scope.row.status === 0" command="UpdateAlarmRules">
                                            {{ $t('hardware.alarmRules') }}
                                        </el-dropdown-item>
                                        <el-dropdown-item :disabled="scope.row.status === 0" command="UpdateAcousticOptic">
                                            {{ $t('hardware.acousticOptic') }}
                                        </el-dropdown-item>
                                        <el-dropdown-item command="UpdateAlarmTime">{{ $t('hardware.alarmTime') }}</el-dropdown-item>
                                        <el-dropdown-item command="UpdateExportTime">{{ $t('hardware.exportTime') }}</el-dropdown-item>
                                        <el-dropdown-item command="UpdateAlarmPlatform">{{ $t('hardware.alarmPlatform') }}</el-dropdown-item>
                                    </el-dropdown-menu>
                                </el-dropdown>
                            </el-col> -->
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
        <Drawer
            :id.sync="id"
            :is-drawer.sync="isDrawer"
            @handle="handleClose"/>
        <DrawerNew
            :id.sync="id"
            :is-drawer.sync="isDrawerNew"
            :showUser="false"
            :showDepartment="false"
            :title-type="10"
            @handle="handleClose"
            :hideSensorsTypes="hideSensorsTypes"/>
        <create ref="create" @getList="getList"/>
        <UpdateAcousticOptic ref="UpdateAcousticOptic"/>
        <UpdateAlarmPlatform ref="UpdateAlarmPlatform"/>
        <UpdateAlarmTime ref="UpdateAlarmTime"/>
        <UpdateExportTime ref="UpdateExportTime"/>
        <UpdateDepartment ref="UpdateDepartment" :departments="$store.state.departments" @getList="getList"/>
        <SetPrincipal ref="SetPrincipal" :departments="$store.state.departments"/>
        <UpdateAlarmRules ref="UpdateAlarmRules" @handle="getList"/>
        <StandbyPower ref="StandbyPower"/>
        <ImportFile
            v-if="importFileVisible"
            :title="importTitle"
            @handleUpdateInit="handleUpdateInit"
            @hiddenModalVisible="hiddenModalVisible"></ImportFile>
    </div>
</template>

<script>
import StateCard from "@/components/StatCard";
import Pagination from "@/components/Pagination/index";
import HardwareValue from "@/components/HardwareValue/index";
import DeviceSignal from "@/components/DeviceSignal/index";
import {EQUIPMENT_TYPE, items} from "@/utils/constant";
import {
    getDeviceList,
    getEquipmentDashboard,
    removeBatchDevice,
} from "@/api/device";
import Create from "@/views/device/components/Create";
import UpdateAcousticOptic from "@/views/device/components/UpdateAcousticOptic";
import UpdateAlarmPlatform from "@/views/device/components/UpdateAlarmPlatform";
import UpdateAlarmTime from "@/views/device/components/UpdateAlarmTime";
import UpdateExportTime from "@/views/device/components/UpdateExportTime";
import UpdateDepartment from "@/views/device/components/UpdateDepartment";
import SetPrincipal from "@/components/SetPrincipal"
import UpdateAlarmRules from "@/views/device/components/UpdateAlarmRules";
import StandbyPower from "@/views/smartSocket/components/StandbyPower";
import mixin from "@/utils/mixin";
import SelectDepartment from "@c/SelectdePartment";
import ImportFile from "@/components/ImportFile";
import {postDeviceExportSupervisor} from "@/api/smartSocket";
import {alarmScope} from "@/utils/methods";
import DeviceTotal from "@c/DeviceTotal/index";
import moment from "moment";
import {signalStateFilter} from "@/utils/methods";

export default {
    name: "SmartSocket",
    inject: ["reload"],
    components: {
        SelectDepartment,
        StandbyPower,
        DeviceTotal,
        UpdateAlarmRules,
        UpdateDepartment,
        UpdateExportTime,
        UpdateAlarmTime,
        UpdateAlarmPlatform,
        UpdateAcousticOptic,
        StateCard,
        Pagination,
        HardwareValue,
        DeviceSignal,
        DrawerNew: () => import("@/views/device/components/DeviceDrawerNew"),
        Drawer: () => import("@/views/smartSocket/components/SmartSocketDrawer"),
        Create,
        SetPrincipal,
        ImportFile,
    },
    data() {
        const _this = this;
        return {
            loadingText: _this.$t('common.hintDefault'),
            totalObject: {
                overview: [
                    {num: 0, title: _this.$t('common.normalNum'), status: 1},
                    {num: 0, title: _this.$t('common.abnormalNum'), status: -1},
                    {num: 0, title: _this.$t('common.offLineNum'), status: -100},
                    {num: 0, title: _this.$t('common.notActivateNum'), status: -99},
                ],
                total: {title: _this.$t('hardware.deviceSum'), num: 0}
            },
            items: {
                pageSize: items.PAGE_SIZE,
                pageNum: items.PAGE_NUM,
                keyword: "",
                departmentId: null,
                equipmentType: EQUIPMENT_TYPE.SMART_SCOKET
            },
            smartSocket: [],
            total: 0,
            loading: false,
            isDrawer: false,
            isDrawerNew: false,
            multipleSelection: [],
            deviceId: null,
            id: null,
            // 导入弹窗
            importFileVisible: false,
            importTitle: "smartSocket",
            multiSelect: false,
            columnSort: {
                name: "", //名称
                num: "", //编号
                department: "", //部门
                createTime: "" //创建时间
            },
            hideSensorsTypes: [17, 1001]
        }
    },
    created() {
        const pageSize = localStorage.getItem("pageSize");
        if (pageSize) {
            this.items.pageSize = pageSize * 1;
        }
        this.getList();
    },
    mounted() {
        ;
    },
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
        smartSocket() {

        }
    },
    methods: {
        handleSignalStateFilter(data) {
            let weak = -82, center = -72, strong = 0
            return signalStateFilter(data.signalStrength, "dBm", weak, center, strong);
        },
        handleGetEquipmentDashboard() {
            getEquipmentDashboard({equipmentType: EQUIPMENT_TYPE.SMART_SCOKET}).then(res => {
                const {alarmCount, normalCount, offLineCount, noActivatedCount, total} = res.items;
                this.totalObject.total.num = total;
                this.totalObject.overview[0].num = normalCount;
                this.totalObject.overview[1].num = alarmCount;
                this.totalObject.overview[2].num = offLineCount;
                this.totalObject.overview[3].num = noActivatedCount;
            })
        },
        handleAlarm(item) {
            return alarmScope(item);
        },
        handleClose(val) {
            this.isDrawer = val;
        },
        getRowKey(row) {
            return row.id;
        },
        handleUpdateInit() {
            this.importFileVisible = false;
            this.reload();
        },
        // 隐藏弹窗
        hiddenModalVisible() {
            this.updateModalVisible = false;
            this.importFileVisible = false
        },
        handleQuery(index) {
            this.items.status = index;
            this.items.pageNum = items.PAGE_NUM;
            this.items.pageSize = items.PAGE_SIZE;
            this.getList();
        },
        handleAdd() {
            this.$refs.create.open(EQUIPMENT_TYPE.SMART_SCOKET);
        },
        handleSelectionChange(val) {
            this.multipleSelection = [];
            val.map(item => {
                this.multipleSelection.push(item.id);
            })
        },
        getList() {
            this.loading = true;
            this.items['sortName'] = this.columnSort;
            getDeviceList(this.items).then(res => {
                this.loading = false;
                if (res.code) {
                    if (res.items?.list?.length) {
                        res.items.list.forEach(item => {
                            item.createDate = item.createDate && this.$options.filters['localToUtc'](item.createDate)
                            item.reportDate = item.reportDate && this.$options.filters['localToUtc'](item.reportDate)
                            if (item.sensors.length) {
                                item.sensors = item.sensors.filter(v => !this.hideSensorsTypes.includes(v.type) && v)
                            }
                        })
                    }
                    this.smartSocket = res.items.list;
                    this.total = res.items.total;
                } else {
                    this.$message.error(res.message);
                }
            });
            this.handleGetEquipmentDashboard();
        },
        handleShowDrawer(row) {
            this.id = row.strId;
            this.deviceId = row.id;
            if (row.openTwoSystem) {
                this.isDrawerNew = true;
            } else {
                this.isDrawer = true;
            }
        },
        handleDropdownMenu(val, row) {
            this.$refs[val].open(0, row);
        },
        handleBatchUpdate(val, type) {
            if (!this.multipleSelection.length) {
                return this.$message.error(this.$t('hardware.selectSmartSocket'));
            }
            if (type) {
                val.open(1, this.smartSocket[0], this.multipleSelection);
            } else {
                val.open(1, this.multipleSelection);
            }
        },
        handleBatchDeleteDevice() {
            if (!this.multipleSelection.length) {
                return this.$message.error(this.$t('hardware.selectDeleteSmartSocket'));
            }
            this.$confirm(this.$t('hardware.deleteBatchSmartSocketMessage'), this.$t('hardware.deleteSmartSocket'), {
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
                        this.multipleSelection = [];
                        this.$refs.multipleTable.clearSelection();
                        this.$message.success(this.$t('common.deleteBatchSuccess'));
                        this.getList();
                    } else {
                        this.$message.error(this.$t('common.deleteError') + res.message);
                    }
                })
            }).catch(() => {
                this.$message.info(this.$t('common.deleteCanceled'))
            })
        },
        handleDeleteDevice(row) {
            this.$confirm(this.$t('hardware.selectSmartSocketMessage') + row.name + this.$t('hardware.selectSmartSocketMessage2'), this.$t('hardware.deleteSmartSocket'), {
                confirmButtonText: this.$t('common.confirm'),
                cancelButtonText: this.$t('common.cancel'),
                type: "warning",
            }).then(() => {
                removeBatchDevice({ids: [row.id]}).then(res => {
                    if (res.code) {
                        this.multipleSelection = [];
                        this.$message.success(this.$t('common.deleteSuccess'));
                        if (this.smartSocket.length === 1) {
                            this.items.pageNum = this.items.pageNum > 1 ? this.items.pageNum - 1 : 1;
                        }
                        this.getList();
                    } else {
                        this.$message.error(this.$t('common.deleteError') + res.message);
                    }
                })
            }).catch(() => {
                this.$message.info(this.$t('common.deleteCanceled'));
            })
        },
        handleExport() {
            new Promise(resolve => {
                this.$message.warning(this.$t('common.exportMessage'));
                setTimeout(() => {
                    resolve();
                }, 1500)
            }).then(() => {
                postDeviceExportSupervisor(this.items).then(res => {
                    const data = moment(new Date()).format("YYYYMMDDHHmmss");
                    mixin.methods.download(
                        res,
                        decodeURIComponent(this.$t('hardware.exportSmartSocket') + data, "UTF-8")
                    )
                })
            })
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
    },
}
</script>

<style lang="less" scoped>
@import "../../../src/style/device";
@import "../../style/table_sticky";
</style>
