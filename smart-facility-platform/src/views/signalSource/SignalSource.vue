<template>
    <div class="signal-source">
        <div class="session">
            <div class="total">
                <div class="total-card totality cursor" @click="handleGatherBoxClick()">
                    <div class="float-left">
                        <div class="total-title">{{ $t("hardware.signalSourceSum") }}</div>
                        <div class="total-sum">
                            <span class="num">{{ overflowObject.total }}</span>
                            <!--              <span>{{ $t('common.individual') }}</span>-->
                        </div>
                    </div>
                    <div class="total-img">
                        <div class="image"></div>
                    </div>
                </div>
                <div class="total-type">
                    <div class="total-type-bottom">
                        <div v-for="item in overflowObject.line"
                             :key="item.title"
                             :class="[handleStatus(item.status).color, isTop === item.status ? 'is-active' : '']"
                             class="bottom-type-list cursor"
                             @click="handleGatherBoxClick(item.status)">
                            <div class="type-list-num">
                                <div class="type-list-num-title">{{ item.name }}</div>
                                <div class="type-list-num-total">
                                    <span class="num">{{ item.count }}</span>
                                    <!--                  <span>{{ $t('common.individual') }}</span>-->
                                </div>
                            </div>
                            <div :class="handleStatus(item.status).iconColor" class="device-right-icon">
                                <i :class="handleStatus(item.status).icon"></i>
                            </div>
                        </div>
                    </div>
                    <div class="total-type-bottom">
                        <div v-for="item in overflowObject.switch"
                             :key="item.title"
                             class="bottom-type-list switch cursor"
                             :class="isBottom === item.code ? 'is-active' : ''"
                             @click="handleSwitchStatus(item.code)">
                            <div class="type-list-num">
                                <div class="type-list-num-title">{{ item.name }}</div>
                                <div class="type-list-num-total">
                                    <span class="num">{{ item.count }}</span>
                                    <!--                  <span>{{ $t('common.individual') }}</span>-->
                                </div>
                            </div>
                            <div class="device-right-icon">
                                <i :class="handleIcon(item.code)"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="session">
            <div class="search-bar-container">
                <div>
                    <select-department
                        :department-id.sync="items.departmentId" :select-tree-value.sync="items.departmentId"
                        @change="handleQuery(0)"/>
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

                    <el-button class="icon-addto" type="primary" @click="handleAdd"> {{
                            $t("hardware.addSignalSource")
                        }}
                    </el-button>
                    <el-button v-if="$store.state.level" class="icon-delete1" @click="multiSelect = !multiSelect">
                        {{ multiSelect ? $t('common.cancelMultiSelect') : $t('common.multiSelect') }}
                    </el-button>
                    <el-button class="icon-upload" @click="importFileVisible = !importFileVisible">
                        {{ $t('common.importHandle') }}
                    </el-button>
                    <el-button class="icon-download1" @click="handleExport"> {{ $t('common.export') }}</el-button>
                </div>
            </div>
            <div class="sticky-head">
                <el-table
                    ref="multipleTable"
                    v-loading="loading"
                    :data="signal"
                    :default-sort="{order: 'descending'}"
                    :row-key="getRowKey"
                    stripe
                    border
                    @selection-change="handleSelectionChange"
                    @sort-change="sortChange"
                >
                    <el-table-column v-if="$store.state.level" :reserve-selection="true" fixed type="selection"
                                     width="50"></el-table-column>
                    <el-table-column fixed label="#" type="index" width="70px">
                        <template slot-scope="scope">
                <span v-if="`${total !== 0}`">
                  {{ (items.pageNum - 1) * items.pageSize + scope.$index + 1 }}
                </span>
                        </template>
                    </el-table-column>
                    <el-table-column fixed :label="$t('common.name')" min-width="130" prop="name" sortable>
                        <template slot-scope="scope">
                            <a @click="handleShowDrawer(scope.row)">{{ scope.row.name }}</a>
                        </template>
                    </el-table-column>
                    <el-table-column fixed :label="$t('common.no')" min-width="130" prop="no" sortable>
                        <template slot-scope="scope">
                            <a @click="handleShowDrawer(scope.row)">{{ scope.row.equipmentNo }}</a>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('common.owningDepartment')" min-width="150" prop="departmentName"
                                     sortable/>
                    <el-table-column :label="$t('hardware.status')" min-width="80" prop="switchStatus" sortable>
                        <template slot-scope="scope">
                <span :class="scope.row.switchStatus ? 'abnormal' : '' ">
                  {{
                        scope.row.runStatus == 0 ? $t('common.notActivate') : scope.row.switchStatus ? $t("common.close1") : $t("common.open")
                    }}
                </span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('common.creatDate')" min-width="130" prop="createDate" sortable>
                        <template v-slot="scope">
                            {{ scope.row.createDate | localToUtc }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('hardware.isOnLine')" min-width="100" prop="runStatus" sortable>
                        <template slot-scope="scope">
                <span :class="scope.row.runStatus === $STATUS.OFFLINE? 'abnormal' : 'normal'">
                  {{ handleRunStatus(scope.row.runStatus) }}
                </span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('common.reportDate')" min-width="160" prop="reportDate" sortable>
                        <template v-slot="scope">
                            {{ scope.row.reportDate | localToUtc }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('common.handle')" min-width="110">
                        <template slot-scope="scope">
                            <el-button type="text" @click="handleDropdownMenu('UpdateDepartment', scope.row)">
                                {{ $t('common.edit') }}
                            </el-button>
                            <el-button class="abnormal" type="text" @click="handleDelete(scope.row)">
                                {{ $t('common.delete') }}
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
                    @pagination="getList"/>
            </div>
        </div>
        <create ref="create" @getList="getList"/>
        <signal-source-drawer v-if="isDrawer" :id.sync="signalId" :is-drawer.sync="isDrawer"/>
        <UpdateDepartment ref="UpdateDepartment" @handle="getList"/>
        <ImportFile
            v-if="importFileVisible"
            :title="importTitle"
            @handleUpdateInit="handleUpdateInit"
            @hiddenModalVisible="hiddenModalVisible"></ImportFile>
    </div>
</template>

<script>
import SelectDepartment from "@c/SelectdePartment";
import {EQUIPMENT_TYPE, items} from "@/utils/constant";
import Create from "@/views/device/components/Create";
import ImportFile from "@c/ImportFile/index";
import Pagination from "@c/Pagination/index";
import SignalSourceDrawer from "@/views/signalSource/components/SignalSourceDrawer";
import {getSignalList, getSignalStatistics, postDeviceExportReceiver} from "@/api/signal";
import moment from "moment";
import mixin from "@/utils/mixin";
import {removeBatchDevice} from "@/api/device";
import UpdateDepartment from "@/views/device/components/UpdateDepartment";

export default {
    name: "signalSource",
    components: {
        SignalSourceDrawer,
        Create,
        SelectDepartment,
        ImportFile,
        UpdateDepartment,
        Pagination
    },
    data() {
        const _this = this;
        return {
            loading: false,
            signal: [],
            items: {
                departmentId: null,
                pageSize: items.PAGE_SIZE,
                pageNum: items.PAGE_NUM,
                status: null,
                keyword: "",
                equipmentType: EQUIPMENT_TYPE.SIGNAL,
                switchStatus: null
            },
            total: 0,
            importFileVisible: false,
            multiSelect: false,
            importTitle: "signal",
            isDrawer: false,
            isTop: null,
            isBottom: null,
            overflowObject: {
                line: [
                    {name: _this.$t('common.isLine'), count: 0, status: 1},
                    {name: _this.$t('common.offLine'), count: 0, status: -100},
                    {name: _this.$t('common.notActivate'), count: 0, status: -99},
                ],
                switch: [
                    {name: _this.$t('common.open'), count: 0, code: 0},
                    {name: _this.$t('common.close1'), count: 0, code: 1},
                ],
                total: 0
            },
            signalId: "",
            multipleSelection: [],
            columnSort: {
                name: "", //名称
                num: "", //编号
                department: "", //部门
                createTime: "" //创建时间
            }
        }
    },
    created() {
        const pageSize = localStorage.getItem("pageSize");
        if (pageSize) {
            this.items.pageSize = pageSize * 1;
        }
        this.handleInit();
    },
    watch: {
        multiSelect: function (newValue) {
            if (newValue) {
                this.handleBatchDeleteDevice()
            } else {
            }
        },
        signal() {
        }
    },
    mounted() {
        ;
    },
    methods: {
        getRowKey(row) {
            return row.signalId;
        },
        handleIcon(value) {
            switch (value) {
                case 1:
                    return "icon-equipment3";
                case 0:
                    return "icon-equipment4";
            }
        },
        handleInit() {
            this.getList();
        },
        async getList() {
            this.loading = true;
            try {
                this.items['sortName'] = this.columnSort;
                const res = await getSignalList(this.items);
                const resCount = await getSignalStatistics();
                this.loading = false;
                if (res.code) {
                    this.signal = res.items.list;
                    this.total = res.items.total;
                    this.handleCountData(resCount);
                } else {
                    this.$message.error(res.message)
                }
            } catch (e) {
                this.loading = false;
                this.$message.error(e);
            }
        },
        handleDropdownMenu(val, row) {
            this.$refs[val].open(0, {id: row.signalId, departmentId: row.departmentId, name: row.name});
        },
        handleCountData(res) {
            if (res.code && res["items"]) {
                this.overflowObject.line[0].count = res.items.onlineCount;
                this.overflowObject.line[1].count = res.items.offlineCount;
                this.overflowObject.line[2].count = res.items.noActivatedCount;
                this.overflowObject.switch[0].count = res.items.openStatusCount;
                this.overflowObject.switch[1].count = res.items.closeStatusCount;
                this.overflowObject.total = res.items.total;
            }
        },
        handleSelectionChange(val) {
            this.multipleSelection = [];
            val.map(item => {
                this.multipleSelection.push(item.signalId);
            })
        },
        handleShowDrawer(row) {
            this.isDrawer = true;
            this.signalId = row.encodeId;
        },
        handleQuery(index) {
            this.items.status = index;
            this.items.pageNum = items.PAGE_NUM;
            this.items.pageSize = items.PAGE_SIZE;
            this.getList();
        },
        handleAdd() {
            this.$refs.create.open(EQUIPMENT_TYPE.SIGNAL);
        },
        handleExport() {
            new Promise(resolve => {
                this.$message.warning(this.$t('common.exportMessage'));
                setTimeout(() => {
                    resolve();
                }, 2500)
            }).then(() => {
                postDeviceExportReceiver({equipmentType: EQUIPMENT_TYPE.SIGNAL}).then(res => {
                    const data = moment(new Date()).format("YYYYMMDDHHmmss");
                    mixin.methods.download(
                        res,
                        decodeURIComponent(this.$t('route.signalSource') + data, "UTF-8")
                    )
                })
            })
        },
        handleUpdateInit() {
            this.importFileVisible = false;
            this.reload();
        },
        hiddenModalVisible() {
            this.updateModalVisible = false;
            this.importFileVisible = false;
        },
        handleGatherBoxClick(value) {
            if (typeof value === "undefined") {
                this.items.status = null;
                this.items.switchStatus = null;
                this.isTop = null;
            } else {
                this.items.status = value;
                this.items.switchStatus = null;
                this.isTop = value;
            }
            this.isBottom = null;
            this.handleInit()
        },
        handleSwitchStatus(value) {
            this.items.switchStatus = value;
            this.items.status = null;
            this.isTop = null;
            this.isBottom = value;
            this.handleInit()
        },
        handleStatus(value) {
            switch (value) {
                case -99:
                    return {color: "device-normal", icon: "icon-normal1", iconColor: "device-normal-icon"};
                case 1:
                    return {color: "device-normal", icon: "icon-normal1", iconColor: "device-normal-icon"};
                case 2:
                    return {color: "device-alarm", icon: "icon-alarm1", iconColor: "device-alarm-icon"};
                case -1:
                    return {color: "device-alarm", icon: "icon-alarm1", iconColor: "device-alarm-icon"};
                case -100:
                    return {color: "device-offline", icon: "icon-offline", iconColor: "device-offline-icon"};
            }
        },
        handleDelete(row) {
            this.$confirm(this.$t("hardware.deleteSignalSourceMessage1") + row.name + this.$t("hardware.deleteSignalSourceMessage2"), this.$t("hardware.deleteSignalSource"), {
                confirmButtonText: this.$t('common.confirm'),
                cancelButtonText: this.$t('common.cancel'),
                type: "warning",
            }).then(() => {
                removeBatchDevice({ids: [row.signalId]}).then(res => {
                    if (res.code) {
                        this.$message.success(this.$t('common.deleteSuccess'));
                        if (this.signal.length === 1) {
                            this.items.pageNum = this.items.pageNum > 1 ? this.items.pageNum - 1 : 1;
                        }
                        this.getList();
                    } else {
                        this.$message.error(res.message);
                    }
                })
            })
        },
        handleBatchDeleteDevice() {
            if (!this.multipleSelection.length) {
                this.multiSelect = !this.multiSelect;
                return this.$message.error(this.$t("hardware.selectDelSingnalSource"));
            }
            this.$confirm(this.$t("hardware.deleteBatchSignalSourceMessage"), this.$t("hardware.deleteSignalSource"), {
                confirmButtonText: this.$t('common.confirm'),
                cancelButtonText: this.$t('common.cancel'),
                type: "warning",
            }).then(() => {
                this.loading = true;
                this.loadingText = this.$t("common.hintDelete");
                removeBatchDevice({ids: this.multipleSelection}).then(res => {
                    this.loading = false;
                    this.loadingText = this.$t("common.hintDefault");
                    this.multiSelect = !this.multiSelect;
                    if (res.code) {
                        this.$message.success(this.$t("common.deleteBatchSuccess"));
                        this.multipleSelection = [];
                        this.$refs.multipleTable.clearSelection();
                        this.getList();
                    } else {
                        this.$message.error(this.$t("common.deleteError") + res.message);
                    }
                })
            }).catch(() => {
                this.multiSelect = !this.multiSelect;
                this.$message.info(this.$t("common.deleteCanceled"))
            })
        },
        handleRunStatus(value) {
            if (value === -100) {
                return this.$t("common.offLine")
            } else if (value === 0) {
                return this.$t("common.notActivate")
            } else {
                if (value === 1 || value < 0 || value != -100) {
                    return this.$t("common.isLine")
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
<style lang="less" scoped>
@import "../../../src/style/deviceTotal";

.total .total-card {
    height: 176px;
}

.switch {
    background: #ECF3FF;

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
        background: #D7E6FF !important;
        right: 10px !important;

        i {
            font-size: 24px !important;
            color: #448AFF;
        }
    }
}

</style>
