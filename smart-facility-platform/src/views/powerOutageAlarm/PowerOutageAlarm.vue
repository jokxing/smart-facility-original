<template>
  <div v-loading="loading"
       :element-loading-text="loadingText"
       class="power-outage-alarm">
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
              :select-tree-value.sync="items.departmentId" @change="handleQuery"/>
          <el-input
              v-model.trim="items.keyword"
              class="input-with-select"
              clearable
              :placeholder="$t('common.inputKeyword')"
              @keyup.enter.native="handleQuery()">
            <el-button
                slot="append"
                class="el-button-host"
                icon="icon-search1"
                @click="handleQuery()">
            </el-button>
          </el-input>
        </div>
        <div>
          <el-button v-if="$store.state.level" type="primary" class="icon-addto" @click="handleAdd"> {{ $t("hardware.addSiren") }}
          </el-button>
          <el-button v-if="$store.state.level" class="icon-setup" @click="multiSelect = !multiSelect">
            {{ multiSelect ? $t('common.cancelMultiSelect') : $t('common.multiSelect') }}
          </el-button>
<el-button v-if="$store.state.level" class="icon-upload" @click="importFileVisible = !importFileVisible"> {{ $t('common.importHandle') }}</el-button>
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
          <el-button @click="handleBatchUpdate($refs.UpdateAlarmPlatform)">{{ $t('hardware.updateAlarmPlatform') }}</el-button>
          <el-button @click="handleBatchUpdate($refs.UpdateAcousticOptic)">{{ $t('hardware.updateAcousticOptic') }}</el-button>
          <el-button @click="handleBatchUpdate($refs.UpdateDepartment)">{{ $t('common.owningDepartment') }}</el-button>
          <el-button @click="handleBatchUpdate($refs.UpdateExportTime)">{{ $t('hardware.updateExportTime') }}</el-button>
          <el-button @click="handleBatchUpdate($refs.UpdateAlarmTime)">{{ $t('hardware.updateAlarmTime') }}</el-button>
          <el-button @click="handleBatchUpdate($refs.SetPrincipal)">{{ $t('common.setPrincipal') }}</el-button>
          <el-button @click="handleBatchDeleteDevice">{{ $t('common.batchDelete') }}</el-button>
        </template>
      </div>
        <div class="sticky-head">
            <el-table
          ref="multipleTable"
          :data="powerOutage"
          :default-sort="{order: 'descending'}"
          :row-key="getRowKey"
          size="medium"
          stripe
          border
          @selection-change="handleSelectionChange"
          @sort-change="sortChange">
        <el-table-column
            v-if="$store.state.level"
            :reserve-selection="true" fixed type="selection"
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
        <el-table-column fixed :label="$t('common.no')" min-width="120" prop="no" sortable>
          <template slot-scope="scope">
            <a @click="handleShowDrawer(scope.row)">{{ scope.row.no }}</a>
          </template>
        </el-table-column>
          <el-table-column :label="$t('common.owningDepartment')" min-width="150" prop="departmentName" sortable/>
          <el-table-column :label="$t('hardware.status')" min-width="80" prop="status" sortable>
          <template slot-scope="scope">
            <span :class="scope.row.powerFailure == 1 || scope.row.status == 0 ? '' : 'abnormal'">
              {{ status(scope.row) }}
            </span>
          </template>
        </el-table-column>
          <el-table-column :label="$t('hardware.association')" min-width="150">
              <template v-slot="scope">
                  <div v-if="scope.row.relevancyName">{{ scope.row.relevancyName }}</div>
                  <div v-else>{{ $t('hardware.notAssociation') }}</div>
              </template>
          </el-table-column>
        <el-table-column :label="$t('common.creatDate')" min-width="130" prop="createDate" sortable>
            <template v-slot="scope">
                {{ scope.row.createDate | localToUtc }}
            </template>
        </el-table-column>
        <el-table-column :label="$t('hardware.isOnLine')" min-width="80" prop="statusStr" sortable>
          <template slot-scope="scope">
            <span :class="![0,1].includes(scope.row.status) ? 'abnormal' : 'normal'">
              {{ handleStatus(scope.row.status) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('hardware.signalStrength')" min-width="100">
          <template slot-scope="scope">
            <device-signal :type="1" :data="scope.row"/></template>
        </el-table-column>
        <el-table-column :label="$t('common.reportDate')" min-width="150" prop="reportDate" sortable>
            <template v-slot="scope">
                {{ scope.row.reportDate | localToUtc }}
            </template>
        </el-table-column>
        <el-table-column v-if="$store.state.level" fixed="right" :label="$t('common.handle')" prop="index" min-width="110">
          <template slot-scope="scope">
            <el-col :lg="12">
              <el-button type="text" @click="handleDropdownMenu('UpdateDepartment', scope.row)">{{ $t('common.edit') }}</el-button>
            </el-col>
            <el-col :lg="12">
              <el-button type="text" class="abnormal" @click="handleDelete(scope.row)">{{ $t('common.delete') }}</el-button>
            </el-col>
            <el-col :lg="12">
              <el-button type="text" @click="handleDropdownMenu('SetPrincipal', scope.row.id)">{{ $t('common.principal') }}</el-button>
            </el-col>
            <el-col :lg="12">
              <el-dropdown trigger="click" @command="handleDropdownMenu($event, scope.row)">
                <span class="el-dropdown-link el-icon-more"></span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item :disabled="scope.row.status === 0"  command="UpdateAcousticOptic">{{ $t('hardware.acousticOptic') }}</el-dropdown-item>
                  <el-dropdown-item command="UpdateAlarmTime">{{ $t('hardware.alarmTime') }}</el-dropdown-item>
                  <el-dropdown-item command="UpdateExportTime">{{ $t('hardware.exportTime') }}</el-dropdown-item>
                  <el-dropdown-item command="UpdateAlarmPlatform">{{ $t('hardware.alarmPlatform') }}</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
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
    <ImportFile
        v-if="importFileVisible"
        :title="importTitle"
        @handleUpdateInit="handleUpdateInit"
        @hiddenModalVisible="hiddenModalVisible"></ImportFile>
    <Drawer :id.sync="powerId" :is-drawer.sync="isDrawer"/>
    <PowerDrawerNew :id.sync="powerId" :is-drawer.sync="isDrawerNew" />
    <create ref="create" @getList="getList"/>
    <UpdateAlarmPlatform ref="UpdateAlarmPlatform" @handle="getList"/>
    <UpdateAlarmTime ref="UpdateAlarmTime" @handle="getList"/>
    <UpdateExportTime ref="UpdateExportTime" @handle="getList"/>
    <UpdateDepartment ref="UpdateDepartment" :departments="$store.state.departments" @handle="getList"/>
    <UpdateAcousticOptic ref="UpdateAcousticOptic" @handle="getList"/>
    <SetPrincipal ref="SetPrincipal" :departments="$store.state.departments" @handle="getList"/>
    <UpdateDepartment ref="UpdateDepartment" @handle="getList"/>
  </div>
</template>

<script>
import StateCard from "@/components/StatCard";
import {ALERTOR_STATUS, EQUIPMENT_TYPE, items} from "@/utils/constant";
import Create from "@/views/device/components/Create";
import {getDeviceList, getEquipmentDashboard, removeBatchDevice, postDeviceBindThings} from "@/api/device";
import Pagination from "@/components/Pagination/index";
import UpdateDepartment from "@/views/device/components/UpdateDepartment";
import SelectDepartment from "@c/SelectdePartment";
import ImportFile from "@/components/ImportFile";
import {outputPowerDevice} from "@/api/powerOutage";
import mixin from "@/utils/mixin";
import SetPrincipal from "@c/SetPrincipal/index";
import UpdateExportTime from "@/views/device/components/UpdateExportTime";
import UpdateAlarmTime from "@/views/device/components/UpdateAlarmTime";
import UpdateAlarmPlatform from "@/views/device/components/UpdateAlarmPlatform";
import UpdateAcousticOptic from "@/views/device/components/UpdateAcousticOptic";
import ElTreeSelect from "@c/SelectTree/index";
import DeviceTotal from "@c/DeviceTotal/index";
import DeviceSignal from "@c/DeviceSignal/index";
import moment from "moment";

export default {
    components: {
        ElTreeSelect,
        SelectDepartment,
        Drawer: () => import("@/views/powerOutageAlarm/components/PowerDrawer"),
        PowerDrawerNew: () => import("./components/PowerDrawerNew"),
        StateCard,
        Create,
        Pagination,
        DeviceTotal,
        SetPrincipal,
        UpdateDepartment,
        UpdateExportTime,
        UpdateAlarmTime,
        UpdateAlarmPlatform,
        UpdateAcousticOptic,
        DeviceSignal,
        ImportFile
    },
    name: "PowerOutageAlarm",
    inject: ["reload"],
    data() {
        const _this = this;
        return {
            totalObject: {
                overview: [
                    {num: 0, title: _this.$t('hardware.aboutageNum'), status: 1},
                    {num: 0, title: _this.$t('hardware.outageNum'), status: -1},
                    {num: 0, title: _this.$t('common.offLineNum'), status: -100},
                    {num: 0, title: _this.$t('common.notActivateNum'), status: -99},
                ],
                total: {title: _this.$t('hardware.powerOutageSum'), num: 1}
            },
            loadingText: _this.$t('common.hintDefault'),
            items: {
                pageSize: items.PAGE_SIZE,
                pageNum: items.PAGE_NUM,
                departmentId: null,
                equipmentType: EQUIPMENT_TYPE.POWER_OUTAGE,
            },
            loading: false,
            powerOutage: [],
            isDrawer: false,
            isDrawerNew: false,
            powerId: "",
            total: 0,
            importFileVisible: false,
            importTitle: "powerAlarm",
            multipleSelection: [],
            multiSelect: false,
            columnSort: {
                name: "", //名称
                num: "", //编号
                department: "", //部门
                createTime: "" //创建时间
            }
        }
    },
    computed: {
        status() {
            return function (row) {
                if (row.status == 0) {
                    return this.$t("common.notActivate");
                } else if (row.status == -100) {
                    return this.$t('common.offLine')
                } else if (row.status == 1) {
                    if (row.powerFailure === ALERTOR_STATUS.NORMAL) {
                        return this.$t('hardware.aboutage');
                    } else {
                        return this.$t('hardware.outage');
                    }
                }

            }
        }
    },
    created() {
        const pageSize = localStorage.getItem("pageSize");
        if (pageSize) {
            this.items.pageSize = pageSize * 1;
        }
        this.getList();
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
    },

    methods: {
        handleBatchUpdate(val) {
            if (!this.multipleSelection.length) {
                return this.$message.error(this.$t('hardware.selectPowerOutage'));
            }
            val.open(1, this.multipleSelection);
        },
        getRowKey(row) {
            return row.id;
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
        handleDropdownMenu(val, row) {
            this.$refs[val].open(0, row);
        },
        handleExport() {
            new Promise(resolve => {
                this.$message.warning(this.$t('common.exportMessage'));
                setTimeout(() => {
                    resolve();
                }, 1500)
            }).then(() => {
                outputPowerDevice(this.items).then(res => {
                    const data = moment(new Date()).format("YYYYMMDDHHmmss");
                    mixin.methods.download(
                        res,
                        decodeURIComponent(this.$t('hardware.powerOutageExport') + data, "UTF-8")
                    )
                })
            })
        },
        handleGetEquimenpentDashboard() {
            getEquipmentDashboard({equipmentType: EQUIPMENT_TYPE.POWER_OUTAGE}).then(res => {
                const {normalCount, total, powerFailureCount,offLineCount,noActivatedCount} = res.items;
                this.totalObject.total.num = total;
                this.totalObject.overview[0].num = normalCount;
                this.totalObject.overview[1].num = powerFailureCount;
                this.totalObject.overview[2].num = offLineCount;
                this.totalObject.overview[3].num = noActivatedCount;
            });
        },
        handleQuery(index) {
            if (index === -1) {
                this.items.status = 0;
            } else if (index === 0) {
                this.items.status = "";
            } else {
                this.items.status = index;
            }
            this.getList();
        },
        handleAdd() {
            this.$refs.create.open(EQUIPMENT_TYPE.POWER_OUTAGE);
        },
        handleEdit(row) {
            this.$refs.UpdateDepartment.open(0, row);
        },
        getList() {
            this.loading = true;
            this.items['sortName'] = this.columnSort;
            getDeviceList(this.items).then(res => {
                this.loading = false;
                if (res.code) {
                    this.powerOutage = res.items.list;
                    this.total = res.items.total;
                }
            });
            this.handleGetEquimenpentDashboard();
        },
        // 批量删除
        handleBatchDeleteDevice() {
            if (!this.multipleSelection.length) {
                return this.$message.error(this.$t('hardware.deletePowerOutage'));
            }
            this.$confirm(this.$t('hardware.deleteBatchPowerOutageMessage'), this.$t('hardware.deletePowerOutage'), {
                confirmButtonText: this.$t('common.confirm'),
                cancelButtonText: this.$t('common.cancel'),
                type: "warning",
            }).then(() => {
                var data = {ids: this.multipleSelection};
                this.handleDeviceBindThings(data, 2)
            }).catch(() => {
                this.$message.info(this.$t('common.deleteCanceled'))
            })
        },
        // 删除
        handleDelete(row) {
            this.$confirm(this.$t('common.deletePrincipalMessage1') + row.name + this.$t('hardware.deletePowerOutageMessage2'), this.$t('hardware.deletePowerOutage'), {
                confirmButtonText: this.$t('common.confirm'),
                cancelButtonText: this.$t('common.cancel'),
                type: "waring"
            }).then(() => {
                var data = {ids: [row.id]}
                this.handleDeviceBindThings(data, 1)
            })
        },// 硬件是否绑定了设备/房间
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
        // 打开详情页
        handleShowDrawer(row) {
            this.powerId = row.strId;
            if(row.openTwoSystem){
                this.isDrawerNew = true;
            }else{
                this.isDrawer = true;
            }
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
