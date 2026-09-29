<template>
    <div
        v-loading="refreshLoading"
        :element-loading-text="refreshLoadingText"
        class="device">
        <div class="div-address">
            <el-button class="address" @click="$refs.floorDrawer.open()">{{ $t('labDevice.addressScreen') }}</el-button>
        </div>
        <div class="session">
            <device-total
                :unit="$t('room.meta')"
                :object="totalObject"
                @handle="handleStatusScreen"
                @handleAll="handleStatusScreen"/>
        </div>
        <div class="session">
            <div class="search-bar-container">
                <div>
                    <SelectDepartment
                        :departmentId.sync="items.departmentId"
                        :select-tree-value.sync="items.departmentId"
                        @change="getValue"/>
                    <el-select
                        class="w160 margin-small-right"
                        v-model="items.objType"
                        filterable
                        clearable
                        :placeholder="$t('common.relatedHardware')">
                        <el-option
                            v-for="item in equipmentTypeOptions"
                            :key="item.code"
                            :label="item.name"
                            :value="item.code">
                        </el-option>
                    </el-select>
                    <el-input
                        v-model.trim="items.keyword"
                        class="input-with-select margin-small-right"
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
                    <el-button class="icon-reset" @click="handleInit"></el-button>
                </div>
                <div>
                    <el-button v-if="$store.state.level" class="icon-addto" type="primary" @click="handleAdd">
                        {{ $t('room.addRoom') }}
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
                    <el-button @click="handleBatchUpdate($refs.UpdateFloor)">{{ $t('room.updateFloor') }}</el-button>
                    <el-button @click="handleBatchUpdate($refs.RoomDepartment)">{{
                            $t('common.owningDepartment')
                        }}
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
                    :data="room"
                    :default-sort="{order: 'descending'}"
                    :row-key="getRowKey"
                    size="medium"
                    stripe
                    border
                    @selection-change="handleSelectionChange">
                    <el-table-column v-if="$store.state.level" fixed reserve-selection type="selection"
                                     width="50"></el-table-column>
                    <el-table-column fixed label="#" width="70px" type="index">
                        <template slot-scope="scope">
                <span v-if="`${total !== 0}`">{{
                        (items.pageNum - 1) * items.pageSize + scope.$index + 1
                    }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column fixed :label="$t('common.name')" prop="name" min-width="130" sortable>
                        <template slot-scope="scope">
                            <a @click="handleShowDrawer(scope.row)">{{ scope.row.name }}</a>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('common.no')" prop="no" min-width="120" sortable/>
                    <el-table-column :label="$t('common.owningDepartment')" prop="departmentName" min-width="120"
                                     sortable>
                        <template slot-scope="scope">
                            {{ scope.row.departmentName }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('room.owningFloor')" min-width="150" prop="floorName">
                        <template slot-scope="scope">
                            <div>{{ $t('room.gradenName') }}：{{
                                    scope.row.gradenName ? scope.row.gradenName : "-"
                                }}
                            </div>
                            <div>{{ $t('room.buildingName') }}：{{
                                    scope.row.buildingName ? scope.row.buildingName : "-"
                                }}
                            </div>
                            <div>{{ $t('room.floorName') }}：{{ scope.row.floorName ? scope.row.floorName : "-" }}</div>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('labDevice.sensorStatus')" min-width="80" prop="senorStatus">
                        <template slot-scope="scope">
                <span :class="(scope.row['senorStatus'] && scope.row.senorStatus !== 1) ? 'abnormal' : ''"
                      v-text="handleSenorStatus(scope.row)"></span>
                        </template>
                    </el-table-column>
                    <!-- <el-table-column label="最近报告等级" prop="status" min-width="100">
                      <template slot-scope="scope">
                        <span>{{ scope.row.status | levelFilter }}</span>
                      </template>
                    </el-table-column> -->
                    <el-table-column :label="$t('common.creatDate')" min-width="160" prop="createDate" sortable>
                        <template v-slot="{row}">
                            {{ row.createDate | localToUtc }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('common.remark')" prop="remark">
                    </el-table-column>
                    <el-table-column v-if="$store.state.level" fixed="right" :label="$t('common.handle')"
                                     min-width="100">
                        <template slot-scope="scope">
                            <el-button type="text" @click="handleEdit(scope.row)">{{ $t('common.edit') }}</el-button>
                            <el-button type="text" class="abnormal" @click="handleDelete(scope.row)">
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
                    @pagination="handleQuery(1)"/>
            </div>
        </div>
        <Create ref="Create" @handle="handleGetRoomList"/>
        <floor-drawer ref="floorDrawer" @handle="handleFloorSearchRoom"/>
        <!-- 没开通2.0打开旧详情 -->
        <RoomDrawer :isDrawer.sync="isDrawer" :roomId.sync="row.id"/>
        <!-- 开通2.0打开新详情 -->
        <RoomDrawerNew :isDrawer.sync="isDrawerNew" :roomId.sync="row.id"/>

        <room-department ref="RoomDepartment" @handle="handleQuery"/>
        <SetPrincipal ref="SetPrincipal" @handle="handleQuery"/>
        <update-floor ref="UpdateFloor" :floors="floors"/>
        <ImportFile
            v-if="importFileVisible"
            :title="importTitle"
            @handleUpdateInit="handleUpdateInit"
            @hiddenModalVisible="hiddenModalVisible"></ImportFile>

    </div>
</template>

<script>
import {HINT_DEFAULT, HINT_DELETE, HINT_DELETES, items, TIME_FORMAT} from "@/utils/constant";
import Create from "@/views/room/components/Create";
import ChartDimension from "@/components/ChartDimension";
import {
    getRoomDashboard,
    removeRoom,
    getRoomList,
    deleteRoomBatch,
    getExportRoom
} from "@/api/room";
import SelectDepartment from "@c/SelectdePartment";
import FloorDrawer from "@c/FloorDrawer";
import Pagination from "@/components/Pagination/index";
import RoomDepartment from "@/views/room/components/RoomDepartment";
import SetPrincipal from "@/components/SetPrincipal"
import UpdateFloor from "@/views/room/components/UpdateFloor";
import RoomDrawer from "./components/RoomDrawer";
import RoomDrawerNew from "./components/RoomDrawerNew";
import {getMapGardenList} from "@/api/mapSet";
import ImportFile from "@/components/ImportFile";
import mixin from "@/utils/mixin";
import DeviceTotal from "@c/DeviceTotal/index";
import moment from "moment"
import i18n from "@/i18n";
import {getEquipmentBindEquipmentType} from "@/api/labDevice";

const state = {
    normal: i18n.t("common.normal"),
    alarm: i18n.t("common.abnormal"),
    offLine: i18n.t("common.offLine")
}

const state2 = {
    1: i18n.t("common.normal"),
    2: i18n.t("common.abnormal"),
    "-100": i18n.t("common.offLine")
}

/***** 时间 4： 今天 ；5：本周；6：本月；9一年  ****/
const dateType = {
    1: 4,
    2: 5,
    3: 6,
    4: 9
}

export default {
    name: "Room",
    components: {
        UpdateFloor,
        RoomDepartment,
        FloorDrawer,
        Drawer: () => import("@/views/room/components/RoomDrawerNew"),
        RoomDrawer,
        RoomDrawerNew,
        Create,
        DeviceTotal,
        ChartDimension,
        Pagination,
        SetPrincipal,
        ImportFile,
        SelectDepartment
    },
    inject: ["reload"],
    data() {
        return {
            active: 3,
            totalObject: {
                overview: [
                    {num: 0, title: i18n.t("common.normalNum"), status: 1},
                    {num: 0, title: i18n.t("common.abnormalNum"), status: 2},
                    {num: 0, title: i18n.t("common.offLineNum"), status: -100},
                    {num: 0, title: i18n.t("room.notMonitoredNum"), status: 3},
                ],
                total: {title: i18n.t("room.roomSum"), num: 0}
            },
            items: {
                keyword: "",
                pageNum: items.PAGE_NUM,
                pageSize: items.PAGE_SIZE,
                status: "",
                departmentId: null,
                objType: ""
            },
            room: [],
            isDrawer: false,
            isDrawerNew: false,
            row: {
                id: null
            },
            statusType: [
                {id: 1, name: i18n.t("common.normal")},
                {id: 2, name: i18n.t("common.abnormal")},
                {id: -100, name: i18n.t("common.offLine")},
            ],
            total: 0,
            multipleSelection: [],
            floors: [],
            // 导入弹窗
            importFileVisible: false,
            importTitle: "room",
            multiSelect: false,
            dashboardItem: {
                buildingId: "",
                floorId: "",
                gardenId: ""
            },
            equipmentTypeOptions: []
        }
    },
    created() {
        const pageSize = localStorage.getItem("pageSize");
        if (pageSize) {
            this.items.pageSize = pageSize * 1;
        }
        this.init();
        this.floors = [];
        getMapGardenList().then(res => {
            if (res.code) {
                for (const item of res.items) {
                    let grandpa = {
                        key: item.gardenId,
                        id: item.gardenId,
                        name: item.gardenName,
                        subDivisions: [],
                    };
                    for (const element of item.subDivisions) {
                        let father = {
                            key: element.id,
                            id: element.id,
                            name: element.name,
                            subDivisions: [],
                        };
                        grandpa.subDivisions.push(father);
                        for (const sun of element.subDivisions) {
                            let grandson = {
                                key: sun.id,
                                id: sun.id,
                                name: sun.name,
                            };
                            father.subDivisions.push(grandson);
                        }
                    }
                    this.floors.push(grandpa);
                }
            } else {
                this.$message.error(res.message);
            }
        })
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
    mounted() {
    },
    methods: {
        handleInit() {
            this.dashboardItem = {
                buildingId: "",
                floorId: "",
                gardenId: ""
            }
            this.items = {
                keyword: "",
                pageNum: items.PAGE_NUM,
                pageSize: items.PAGE_SIZE,
                status: "",
                departmentId: null,
                objType: ""
            }
            this.init();
        },
        handleFloorSearchRoom(item) {
            if (item.level === 1) {
                this.dashboardItem.gardenId = item.data.id;
                this.dashboardItem.buildingId = "";
                this.dashboardItem.floorId = "";
            }
            if (item.level === 2) {
                this.dashboardItem.buildingId = item.data.id;
                this.dashboardItem.floorId = "";
            }
            if (item.level === 3) {
                this.dashboardItem.floorId = item.data.id;
            }
            this.init();
        },
        handleGetEquipmentTypeList() {
            getEquipmentBindEquipmentType({objType: 3}).then((res) => {
                if (res.code && res.items.length) {
                    this.equipmentTypeOptions = res.items
                }
            })
        },
        init() {
            this.handleGetRoomList();
            this.handleGetEquipmentTypeList();
            getRoomDashboard(this.dashboardItem).then(res => {
                if (res.code) {
                    const {totalNum, policeNum, normalNum, leaveNum, notMonitoringNum} = res.items;
                    this.totalObject.total.num = totalNum;
                    this.totalObject.overview[0].num = normalNum;
                    this.totalObject.overview[1].num = policeNum;
                    this.totalObject.overview[2].num = leaveNum;
                    this.totalObject.overview[3].num = notMonitoringNum;
                } else {
                    this.$message.error(res.message);
                }
            });
        },
        // 部门
        getValue() {
            // this.handleGetRoomList();
        },
        getRowKey(row) {
            return row.id;
        },
        handleExport() {
            new Promise(resolve => {
                this.$message.warning(i18n.t("common.exportMessage"));
                setTimeout(() => {
                    resolve();
                }, 1500)
            }).then(() => {
                getExportRoom(this.items).then(res => {
                    const data = moment(new Date()).format("YYYYMMDDHHmmss");
                    mixin.methods.download(
                        res,
                        decodeURIComponent(i18n.t("room.roomExport") + data, "UTF-8")
                    )
                })
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
        handleBatchUpdate(val) {
            if (!this.multipleSelection.length) {
                return this.$message.error(i18n.t("room.selectUpdateRoom"));
            }
            val.open(1, this.multipleSelection, 11);
        },
        handleBatchDeleteDevice() {
            if (!this.multipleSelection.length) {
                return this.$message.error(i18n.t("room.selectDeleteRoom"));
            }
            this.$confirm(i18n.t("room.deleteRoomMessage") + this.multipleSelection.length + i18n.t("common.room"), i18n.t("common.batchDelete"), {
                cancelButtonText: i18n.t("common.cancel"),
                confirmButtonText: i18n.t("common.confirm"),
                type: "warning"
            }).then(() => {
                this.refreshLoading = true;
                this.refreshLoadingText = HINT_DELETES;
                deleteRoomBatch({ids: this.multipleSelection}).then(res => {
                    this.refreshLoading = true;
                    this.refreshLoadingText = HINT_DELETE;
                    if (res.code) {
                        this.multipleSelection = [];
                        this.$refs.multipleTable.clearSelection();
                        this.reload();
                        this.$message.success(i18n.t("common.deleteBatchSuccess"));
                    } else {
                        this.$message.error(res.message);
                    }
                })
            }).catch(() => {
                this.$message.info(i18n.t("common.deleteCanceled"));
            })
        },
        handleSelectionChange(val) {
            this.multipleSelection = [];
            val.map(item => {
                this.multipleSelection.push(item.id);
            })
        },

        // 格式化参数状态
        handleSenorStatus(row, column, cellValue) {
            return state2[row.senorStatus] ?? "-";
        },
        handleQuery(type) {
            !(this.items.floorId) && delete this.items.floorId;
            if (!type) {
                this.items.pageNum = 1;
            }
            this.handleGetRoomList();
        },
        // 筛选
        handleStatusScreen(status) {
            this.items.pageNum = items.PAGE_NUM;
            this.items.pageSize = items.PAGE_SIZE;
            this.items.status = status ? status : "";
            this.handleGetRoomList();
        },
        handleEdit(row) {
            this.$refs.Create.open(1, row);
        },
        handleGetRoomList() {
            this.refreshLoading = true;
            getRoomList({...this.items, ...this.dashboardItem}).then(res => {
                this.refreshLoading = false;
                if (res.code) {
                    this.room = res.items.list;
                    if (res.items.pageNum === items.PAGE_NUM) {
                        this.total = res.items.total;
                    }
                } else {
                    this.$message.error(res.message)
                }
            })
        },
        handleDelete(row) {
            this.$confirm(i18n.t("common.deletePrincipalMessage1") + row.name + ">" + i18n.t("common.room") + "？", i18n.t("room.deleteRoom"), {
                type: "warning",
                cancelButtonText: i18n.t("common.cancel"),
                confirmButtonText: i18n.t("common.confirm"),
            }).then(() => {
                this.refreshLoading = true;
                this.refreshLoadingText = HINT_DELETE;
                removeRoom({id: row.id}).then(res => {
                    this.refreshLoading = false;
                    this.refreshLoadingText = HINT_DEFAULT;
                    if (res.code) {
                        this.$message.success(i18n.t("common.deleteSuccess"));
                        setTimeout(() => {
                            this.reload();
                        }, 200)
                    } else {
                        this.$message.error(res.message);
                    }
                })
            }).catch(() => {
                this.$message.info(i18n.t("common.deleteCanceled"))
            })
        },
        handleAdd() {
            this.$refs.Create.open(0);
        },
        async handleShowDrawer(row) {
            this.row = row;
            if (row.openTwoSystem) {
                this.isDrawerNew = true;
            } else {
                this.isDrawer = true;
            }
        },
    }
}
</script>
<style lang="less" src="../../style/table_sticky.less" scoped></style>
<style lang="less" scoped>
.device {
    position: relative;
}

.div-address {
    position: absolute;
    top: -55px;
    right: 0;
    z-index: 1;

    .address {
        background: #FFFFFF !important;
    }
}
</style>

