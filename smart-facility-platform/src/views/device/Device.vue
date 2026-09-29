<template>
    <div
        v-loading="loading"
        :element-loading-text="loadingText">
        <div class="session">
            <device-total
                :object="totalObject"
                ref="deviceTotal"
                :is-type="true"
                @handle="handleQuery"
                @handleAll="handleQueryDeviceType"
                @change="handleQueryDeviceType"/>
        </div>
        <div class="session">
            <div class="search-bar-container">
                <div>
                    <SelectDepartment
                        :departmentId.sync="items.departmentId"
                        :select-tree-value.sync="items.departmentId"
                        @change="getValue"/>
                    <!--                     <el-select-->
                    <!--                        v-model="items.relevancy"-->
                    <!--                        class="input-with-select margin-small-right"-->
                    <!--                        clearable-->
                    <!--                        @change="getValue">-->
                    <!--                        <el-option-->
                    <!--                            v-for="item in relevancys"-->
                    <!--                            :key="item.value"-->
                    <!--                            :value="item.value"-->
                    <!--                            :label="item.label">-->
                    <!--                        </el-option>-->
                    <!--                    </el-select>-->
                    <el-input
                        v-model.trim="items.keyword"
                        class="input-with-select"
                        clearable
                        :placeholder="$t('hardware.deviceSearch')"
                        @keyup.enter.native="handleQuery($STATUS.ALL)">
                        <el-button
                            slot="append"
                            class="el-button-host"
                            icon="icon-search1"
                            @click="handleQuery($STATUS.ALL)">
                        </el-button>
                    </el-input>
                </div>
                <div>
                    <el-button v-if="$store.state.level" type="primary" class="icon-addto" @click="handleAdd">
                        {{ $t('hardware.addDevice') }}
                    </el-button>
                    <el-button v-if="$store.state.level" class="icon-setup" @click="multiSelect = !multiSelect">
                        {{ multiSelect ? $t('common.cancelMultiSelect') : $t('common.multiSelect') }}
                    </el-button>
                    <el-button v-if="$store.state.level" class="icon-upload"
                               @click="importFileVisible = !importFileVisible"> {{ $t('common.importHandle') }}
                    </el-button>
                    <el-button v-if="$store.state.level" class="icon-download1" @click="handleExport"> {{ $t('common.export') }}</el-button>
                </div>
            </div>
            <div v-if="multipleSelection.length || multiSelect" class="choose-bar">
                <template>
                    <div class="checked">
                        {{ $t('common.multipleSelection') }}<span>{{ multipleSelection.length }}</span>{{ $t('common.item') }}
                    </div>
                </template>
                <template>
                    <!--                    <el-button @click="handleBatchUpdate($refs.UpdateAlarmPlatform)">{{ $t('hardware.updateAlarmPlatform') }}</el-button>-->
                    <el-button @click="handleBatchUpdate($refs.UpdateAcousticOptic)">{{ $t('hardware.updateAcousticOptic') }}</el-button>
                    <el-button @click="handleBatchUpdate($refs.UpdateExportTime)">{{ $t('hardware.updateExportTime') }}</el-button>
                    <!--                    <el-button @click="handleBatchUpdate($refs.UpdateAlarmTime)">{{ $t('hardware.updateAlarmTime') }}</el-button>-->
                    <el-button @click="handleBatchUpdate($refs.UpdateAlarmRules, true)">{{ $t('hardware.updateAlarmRules1') }}</el-button>
                    <el-button @click="handleBatchUpdate($refs.SetPrincipal)">{{ $t('common.setPrincipal') }}</el-button>
                    <el-button @click="handleBatchUpdateUseStatus($refs.changeUseStatus)">{{ $t('hardware.fixUseStatus') }}</el-button>
                    <el-button @click="handleBatchDeleteDevice">{{ $t('common.batchDelete') }}</el-button>
                </template>
            </div>
            <device-table
                :device="device"
                :items="items"
                ref="multipleTable"
                @handle="handleSelectionChange"
                :total="total"
                @columnsort="sortChange">
                <template #checked>
                    <el-table-column v-if="$store.state.level" :reserve-selection="true"  fixed type="selection"
                                     width="50"/>
                </template>
                <template #handle>
                    <el-table-column v-if="$store.state.level" fixed="right"  :label="$t('common.handle')" min-width="110">
                        <template v-slot="scope">
                            <el-col :span="12">
                                <el-button type="text" @click="handleDropdownMenu('UpdateDepartment', scope.row)">{{ $t('common.edit') }}
                                </el-button>
                            </el-col>
                            <el-col :span="12">
                                <el-button type="text" class="abnormal" @click="handleDeleteDevice(scope.row)">{{ $t('common.delete') }}
                                </el-button>
                            </el-col>
                            <!--                            <el-col :span="12">-->
                            <!--                                <el-button type="text" @click="handleDropdownMenu('SetPrincipal', scope.row.id)">{{ $t('common.principal') }}-->
                            <!--                                </el-button>-->
                            <!--                            </el-col>-->
                            <!--                            <el-col :span="8" class="icon-more2">-->
                            <!--                                <el-dropdown trigger="click" @command="handleDropdownMenu($event, scope.row)">-->
                            <!--                                      <span class="el-dropdown-link el-icon-more">-->
                            <!--                                      </span>-->
                            <!--                                    <el-dropdown-menu slot="dropdown">-->
                            <!--&lt;!&ndash;                                        <el-dropdown-item :disabled="scope.row.status === 0" command="UpdateAlarmRules">&ndash;&gt;-->
                            <!--&lt;!&ndash;                                            {{ $t('hardware.alarmRules') }}&ndash;&gt;-->
                            <!--&lt;!&ndash;                                        </el-dropdown-item>&ndash;&gt;-->
                            <!--                                        <el-dropdown-item :disabled="scope.row.status === 0"-->
                            <!--                                                          command="UpdateAcousticOptic">{{ $t('hardware.acousticOptic') }}-->
                            <!--                                        </el-dropdown-item>-->
                            <!--                                        <el-dropdown-item command="UpdateAlarmTime">{{ $t('hardware.alarmTime') }}</el-dropdown-item>-->
                            <!--                                        <el-dropdown-item command="UpdateExportTime">{{ $t('hardware.exportTime') }}</el-dropdown-item>-->
                            <!--                                        <el-dropdown-item command="UpdateAlarmPlatform">{{ $t('hardware.alarmPlatform') }}</el-dropdown-item>-->
                            <!--                                    </el-dropdown-menu>-->
                            <!--                                </el-dropdown>-->
                            <!--                            </el-col>-->
                        </template>
                    </el-table-column>

                </template>
            </device-table>
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
            :isDrawer.sync="isDrawer"/>
        <create ref="create" @getList="getList"/>
        <UpdateAcousticOptic ref="UpdateAcousticOptic" @handle="getList"/>
        <UpdateAlarmPlatform ref="UpdateAlarmPlatform" @handle="getList"/>
        <UpdateAlarmTime ref="UpdateAlarmTime" @handle="getList"/>
        <UpdateExportTime ref="UpdateExportTime" @handle="getList"/>
        <UpdateDepartment ref="UpdateDepartment" @handle="getList"/>
        <SetPrincipal ref="SetPrincipal" @handle="getList"/>
        <UpdateAlarmRules ref="UpdateAlarmRules" @handle="getList"/>
        <change-use-status ref="changeUseStatus" @handle="getList"/>
        <ImportFile
            v-if="importFileVisible"
            :title="importTitle"
            @handleUpdateInit="handleUpdateInit"
            @hiddenModalVisible="hiddenModalVisible"></ImportFile>
    </div>
</template>

<script>
import ImportFile from "@/components/ImportFile";
import Pagination from "@/components/Pagination/index";
import HardwareValue from "@/components/HardwareValue/index";
import DeviceSignal from "@/components/DeviceSignal/index";
import {EQUIPMENT_TYPE, items} from "@/utils/constant";
import {getEquipmentSortList, outputEquipmentDevice, removeBatchDevice, postDeviceBindThings} from "@/api/device";
import {alarmScope} from "@/utils/methods";
import Create from "@/views/device/components/Create";
import UpdateAcousticOptic from "@/views/device/components/UpdateAcousticOptic";
import UpdateAlarmPlatform from "@/views/device/components/UpdateAlarmPlatform";
import UpdateAlarmTime from "@/views/device/components/UpdateAlarmTime";
import UpdateExportTime from "@/views/device/components/UpdateExportTime";
import UpdateDepartment from "@/views/device/components/UpdateDepartment";
import SetPrincipal from "@/components/SetPrincipal"
import UpdateAlarmRules from "@/views/device/components/UpdateAlarmRules";
import mixin from "@/utils/mixin";
import SelectDepartment from "@c/SelectdePartment";
import DeviceTotal from "@c/DeviceTotal/index"
import moment from "moment";
import DeviceTable from "@c/DeviceTable/index";
import ChangeUseStatus from "@/views/device/components/changeUseStatus";

export default {
    name: "Device",
    inject: ["reload"],
    components: {
        ChangeUseStatus,
        DeviceTable,
        SelectDepartment,
        UpdateAlarmRules,
        DeviceTotal,
        UpdateDepartment,
        UpdateExportTime,
        UpdateAlarmTime,
        UpdateAlarmPlatform,
        UpdateAcousticOptic,
        ImportFile,
        Pagination,
        HardwareValue,
        DeviceSignal,
        Drawer: () => import("@/views/device/components/DeviceDrawerNew"),
        Create,
        SetPrincipal,
    },
    data() {
        const _this = this;
        return {
            loadingText: _this.$t('common.hintDefault'),
            totalObject: {
                deviceType: [
                    {code: 0, name: "全部", count: 0},
                    {code: 1, name: "温湿度", count: 0},
                    {code: 2, name: "温度", count: 0},
                    {code: 3, name: "水浸", count: 0},
                    {code: 4, name: "二氧化碳", count: 0},
                    {code: 5, name: "压差", count: 0},
                    {code: 6, name: "氧气", count: 0},
                    {code: 7, name: "压力", count: 0},
                ],
                overview: [
                    {num: 0, title: _this.$t('common.normalNum'), status: 1},
                    {num: 0, title: _this.$t('common.abnormalNum'), status: -1},
                    {num: 0, title: _this.$t('common.offLineNum'), status: -100},
                    {num: 0, title: _this.$t('common.notActivateNum'), status: -99},
                    {num: 0, title: _this.$t('hardware.useStatusNum'), status: 101},
                ],
                total: {title: _this.$t('hardware.deviceSum'), num: 0}
            },
            loading: false,
            device: [],
            relevancys: [
                {
                    label: "已关联",
                    value: 1
                },
                {
                    label: "未关联",
                    value: 0
                }
            ],
            items: {
                pageSize: items.PAGE_SIZE,
                pageNum: items.pageNum,
                status: 0,
                departmentId: null,
                deviceType: 0,
                equipmentType: 0,
                relevancy: null
            },
            total: 0,
            isDrawer: false,
            id: null,
            multipleSelection: [],
            selectTreeValue: null, // 初始ID（可选）
            // 导入弹窗
            importFileVisible: false,
            importTitle: "device",
            multiSelect: false,
            columnSort: {
                name: "", //名称
                num: "", //编号
                department: "", //部门
                createTime: "" //创建时间
            }
        }
    },
    watch: {
        multipleSelection: function (value) {
            this.multiSelect = Boolean(value.length);
        },
        multiSelect: function (value) {
            if (!value) {
                this.multipleSelection = [];
                this.$refs.multipleTable.$refs.table.clearSelection();
            }
        }
    },
    mounted() {
        const pageSize = localStorage.getItem("pageSize");
        if (pageSize) {
            this.items.pageSize = pageSize * 1;
        }
        this.getList();
    },
    methods: {
        getRowKey(row) {
            return row.id;
        },
        // 上传成功后更新初始化
        handleUpdateInit() {
            this.importFileVisible = false;
            this.reload();
        },
        // 隐藏弹窗
        hiddenModalVisible() {
            this.updateModalVisible = false;
            this.importFileVisible = false;
        },
        getValue() {
            this.handleQuery(this.items.status);
        },
        handleQueryDeviceType(type) {
            this.$refs.multipleTable.$refs.table.clearSelection();
            this.items.status = 0;
            this.$refs.deviceTotal.isBottom = null;
            this.handleQuery(this.items.status, type);
        },
        handleQuery(index = this.items.status, type = this.items.deviceType) {
            this.items.status = index ?? this.items.status;
            this.items.deviceType = type ?? this.items.deviceType;
            this.items.pageNum = items.PAGE_NUM;
            this.items.pageSize = items.PAGE_SIZE;
            this.getList();
        },
        handleAdd() {
            this.$refs.create.open(EQUIPMENT_TYPE.DEVICE);
        },
        handleSelectionChange(val) {
            this.multipleSelection = [];
            val.map(item => {
                this.multipleSelection.push(item);
            })
        },
        handleAlarm(item) {
            return alarmScope(item);
        },
        getList() {
            this.loading = true;
            this.items['sortName'] = this.columnSort;
            getEquipmentSortList(this.items).then(res => {
                this.loading = false;
                if (!res.code) {
                    return this.$message.error(res.message);
                }
                this.device = res.items.list;
                this.totalObject.deviceType = [];
                this.totalObject.deviceType = this.totalObject.deviceType.concat(res.items.deviceSortCount.typeSorts);
                const {alarmCount, normalCount, offLineCount,noActivatedCount, closeMonitor} = res.items;
                this.totalObject.total.num = res.items.deviceSortCount.deviceCount;
                this.totalObject.overview[0].num = normalCount;
                this.totalObject.overview[1].num = alarmCount;
                this.totalObject.overview[2].num = offLineCount;
                this.totalObject.overview[3].num = noActivatedCount;
                this.totalObject.overview[4].num = closeMonitor;
                this.total = res.items.total;
            })
        },
        handleShowDrawer(id) {
            this.id = id;
            this.isDrawer = true;
        },
        handleDropdownMenu(val, row) {
            this.$refs[val].open(0, row);
        },
        handleBatchUpdate(val, type) {
            if (!this.multipleSelection.length) {
                return this.$message.error(this.$t('hardware.changeDevice'));
            }
            if (type) {
                if (this.items.deviceType || this.multipleSelection.length === 1) {
                    let arr = this.device[0];
                    if (this.multipleSelection.length === 1) {
                        arr = this.multipleSelection[0];
                    }
                    const ids = Array.from(this.multipleSelection, ({id}) => id)
                    val.open(1, arr, ids);
                } else {
                    this.$refs.multipleTable.$refs.table.clearSelection();
                    this.$message.error(this.$t('hardware.changeDeviceType'));
                }
            } else {
                const arr = Array.from(this.multipleSelection, ({id}) => id)
                val.open(1, arr);
            }
        },
        handleBatchUpdateUseStatus(val) {
            if (!this.multipleSelection.length) {
                return this.$message.error(this.$t('hardware.changeDevice'));
            }
            val.open(this.multipleSelection)
        },
        // 批量删除
        handleBatchDeleteDevice() {
            if (!this.multipleSelection.length) {
                return this.$message.error(this.$t('hardware.changeDeleteDevice'));
            }
            this.$confirm(this.$t('hardware.deleteDeviceBatchMessage'), this.$t('hardware.deleteDeviceTitle'), {
                confirmButtonText: this.$t('common.confirm'),
                cancelButtonText: this.$t('common.cancel'),
                type: "warning",
            }).then(() => {
                var data = {ids: Array.from(this.multipleSelection, ({id}) => id)};
                this.handleDeviceBindThings(data, 2)
            }).catch(() => {
                this.$message.info(this.$t('common.deleteCanceled'));
            })
        },
        // 删除
        handleDeleteDevice(row) {
            this.$confirm(this.$t('hardware.deleteDeviceMessage1') + row.name + this.$t('hardware.deleteDeviceMessage2'), this.$t('hardware.deleteDeviceTitle'), {
                confirmButtonText: this.$t('common.confirm'),
                cancelButtonText: this.$t('common.cancel'),
                type: "warning",
            }).then(() => {
                var data = {ids: [row.id]}
                this.handleDeviceBindThings(data, 1)
            }).catch(() => {
                this.$message.info(this.$t('common.deleteCanceled'));
            })

        },
        // 硬件是否绑定了设备/房间
        handleDeviceBindThings(data,type){
            // type 1单个 2批量
            postDeviceBindThings(data).then(res => {
                if(res.code){
                    if(res.code === 1){
                        if(res.items.length > 0){
                            var message = "";
                            var items = res.items;
                            for(var i = 0; i < items.length; i++){
                                if(type === 1){
                                    message = this.$t('hardware.isBindMessage') + (items[i].objType === 2 ? this.$t('common.equipment') : this.$t('common.room')) + items[i].objNo
                                }else{
                                    message += this.$t('hardware.device') + items[i].equipmentNo + this.$t('hardware.binded') + (items[i].objType === 2 ? this.$t('common.equipment') : this.$t('common.room')) + items[i].objNo + `<br/>`
                                }
                            }
                            this.$alert(message, this.$t('common.hint'),{
                                dangerouslyUseHTMLString: true
                            });
                        }else{
                            this.handleRemoveDevice(data, type)
                        }
                    }else{
                        this.$message.error(res.message);
                    }
                }else{
                    this.$message.error(res.message);
                }
            })
        },
        // 删除请求
        handleRemoveDevice(data,type) {
            // type 1单个 2批量
            this.loading = true;
            removeBatchDevice(data).then(res => {
                this.loading = false;
                if (res.code) {
                    if(type === 1){
                        this.$message.success(this.$t('common.deleteSuccess'));
                        if (this.device.length === 1) {
                            this.items.pageNum = this.items.pageNum > 1 ? this.items.pageNum - 1 : 1;
                        }
                    }else{
                        this.$message.success(this.$t('common.deleteBatchSuccess'));
                        this.multipleSelection = [];
                        this.$refs.multipleTable.$refs.table.clearSelection();
                    }
                    this.getList();
                } else {
                    this.$message.error(this.$t('common.deleteError') + res.message);
                }
            })
        },
        handleExport() {
            new Promise(resolve => {
                this.$message.warning(this.$t('common.exportMessage'));
                setTimeout(() => {
                    resolve();
                }, 1500)
            }).then(() => {
                outputEquipmentDevice({
                    departmentId: this.items.departmentId,
                    equipmentType: EQUIPMENT_TYPE.DEVICE,
                    keyword: this.items.keyword,
                }).then(res => {
                    const data = moment(new Date()).format("YYYYMMDDHHmmss");
                    mixin.methods.download(
                        res,
                        decodeURIComponent(this.$t('hardware.deviceExport') + data, "UTF-8")
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
.icon-more2 {
    height: 40px;
    line-height: 40px;
    text-align: center;
}

</style>
