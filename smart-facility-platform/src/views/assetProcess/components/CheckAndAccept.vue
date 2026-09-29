<template>
    <div>
        <div>
            <el-tabs class="check-tabs" v-model="radio">
                <el-tab-pane :label="$t('labDevice.checkAndAccept')" name="1"></el-tab-pane>
                <el-tab-pane :label="$t('labDevice.checkAndAcceptBefore')" name="2"></el-tab-pane>
            </el-tabs>
        </div>
        <div class="search-bar-container margin-center">
            <div>
                <el-select
                    v-if="radio === 1"
                    v-model="items.procStatus"
                    class="margin-small-right"
                    @change="handleQuery">
                    <el-option :value="0" :label="$t('common.all')"></el-option>
                    <el-option
                        v-for="item in statusArr"
                        :key="item.code"
                        :value="item.code"
                        :label="item.label">
                    </el-option>
                </el-select>
                <el-select
                    v-if="radio == 2"
                    class="margin-small-right"
                    @change="getProcessNoWarehouse"
                    v-model="items.types" :placeholder="$t('common.placeholder')">
                    <el-option
                        v-for="item in optionsList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
                <select-department
                    v-if="radio == 2"
                    :departmentId.sync="items.useDeptId"
                    :select-tree-value.sync="items.useDeptId"
                    @change="handleQuery"/>
                <el-date-picker
                    v-if="radio == 1"
                    class="margin-small-right"
                    v-model="date"
                    type="daterange"
                    :range-separator="$t('common.most')"
                    :start-placeholder="$t('common.startDate')"
                    :end-placeholder="$t('common.endDate')">
                </el-date-picker>
                <InputAppend :placeholder="$t('common.inputNoAndName')" :keyword.sync="items.key" @handle="handleQuery"/>
            </div>
            <div v-if="radio == 2">
                <el-button v-if="$store.state.level" class="icon-add-to" type="primary"
                           @click="$refs.addWarehous.open(1)"> {{ $t('common.add1') }}
                </el-button>
                <el-button v-if="$store.state.level" class="icon-upload"
                           @click="importFileVisible = !importFileVisible"> {{ $t('common.importHandle') }}
                </el-button>
            </div>
        </div>
        <div v-if="multipleSelection.length" class="choose-bar">
            <template>
                <div class="checked">
                    {{ $t('common.multipleSelection') }}<span>{{ multipleSelection.length }}</span>{{ $t('common.item') }}
                </div>
            </template>
            <template>
                <el-button @click="handleBatchUpdate($refs.WaitCheckAccept)">{{ $t('labDevice.checkAndAcceptApply') }}</el-button>
            </template>
        </div>
        <Table
            v-loading="loading"
            :tableData="tableData"
            :key="radio"
            @handleSelectionChange="handleSelectionChange"
            :data="list">
            <template v-slot="data">
                <el-table
                    class="expand-table"
                    border
                    v-if="data.prop === 'assetInformations'"
                    :data="data.data.assetInformations"
                    style="width: 100%">
                    <el-table-column type="index" label="#" width="70"/>
                    <el-table-column
                        prop="instrumentName"
                        :label="$t('labDevice.assetName')">
                    </el-table-column>
                    <el-table-column
                        prop="instrumentNo"
                        :label="$t('labDevice.assetNo')">
                    </el-table-column>
                    <el-table-column
                        prop="assetCategoryName"
                        :label="$t('labDevice.classify')">
                    </el-table-column>
                    <el-table-column
                        :label="$t('labDevice.departmentName')"
                        prop="departmentName">
                    </el-table-column>
                    <el-table-column
                        prop="storageLocation"
                        :label="$t('common.owningRoom')">
                    </el-table-column>
                    <el-table-column
                        prop="assetCategoryName"
                        :label="$t('common.img')">
                        <template v-slot="{row}">
                            <img
                                v-if="row.logoUrl"
                                class="logo-img"
                                :src="BASE_URL + row.logoUrl" alt="">
                            <span v-else>-</span>
                        </template>
                    </el-table-column>

                </el-table>
                <a v-if="data.prop === 'instrumentName'"
                   @click="$refs.addWarehous.open(2, data.data.instrumentId)">
                    {{ data.data.instrumentName }}
                </a>
                <a v-if="data.prop === 'procOrderNo'"
                   @click="handleShowDetail(data.data.procOrderNo)">
                    {{ data.data.procOrderNo }}
                </a>
                <div
                    v-if="data.prop === 'procStatus'"
                    class="approval-status"
                    :class="statusColor(data.data.procStatus, statusArr)">
                    {{ statusText(data.data.procStatus, statusArr) }}
                </div>
                <img class="logo-img" v-if="data.prop === 'logoUrl' && data.data.logoUrl" :src="BASE_URL + data.data.logoUrl" alt="">
                <span v-if="data.prop === 'logoUrl' && !data.data.logoUrl">-</span>
                <span v-if="data.prop === 'updateDate'">{{ data.data.updateDate | localToUtc }}</span>
                <span v-if="data.prop === 'createDate'">{{ data.data.createDate | localToUtc }}</span>
            </template>
        </Table>
        <div class="paging">
            <pagination
                v-show="total > 10"
                :limit.sync="items.pageSize"
                :page.sync="items.currentPage"
                :total="total"
                :page-sizes="$store.state.pageSizes"
                @pagination="init"/>
        </div>
        <AddWarehous ref="addWarehous" @handle="handleQuery"/>
        <install-confirm ref="installConfirm"/>
        <ImportFile
            v-if="importFileVisible"
            :title="importTitle"
            @handleUpdateInit="handleUpdateInit"
            @hiddenModalVisible="hiddenModalVisible"></ImportFile>
        <check-list ref="checkList" @handle="handleQuery"/>
        <wait-check-accept ref="WaitCheckAccept" @handle="handleQuery"/>
    </div>
</template>

<script>
import InputAppend from "@c/InputAppend/index";
import AddWarehous from "./AddWarehous";
import Table from "@c/Tables";
import Pagination from "@/components/Pagination/index";
import {APPROVALSTATUS, BASE_URL, TIME_FORMAT} from "@/utils/constant";
import {statusText, statusColor} from "@/utils/methods";
import {mapActions} from "vuex";
import InstallConfirm from "@/views/assetProcess/components/InstallConfirm";
import ImportFile from "@c/ImportFile";
import CheckList from "@/views/assetProcess/components/CheckList";
import SelectDepartment from "@c/SelectdePartment";
import WaitCheckAccept from "@/views/assetProcess/components/WaitCheckAccept";
import {getProcessQueryNoWarehouse} from "@/api/activiti";
import moment from "moment";
import i18n from "@/i18n";
const DATA = [
    {
        label: i18n.t('labDevice.procStatus'),
        prop: "procStatus",
        isSlot: true,
        width: 120
    },
    {
        prop: "assetInformations",
        isSlot: true,
        width: 50,
        type: "expand"
    },
    {
        label: i18n.t('labDevice.procOrderNo'),
        prop: "procOrderNo",
        isSlot: true
    },
    {
        label: i18n.t('labDevice.updateDate1'),
        prop: "updateDate",
        isSlot: true
    },
    {
        label: i18n.t('common.remark'),
        prop: "remarks"
    },

    {
        label: i18n.t('common.createName'),
        prop: "applyUserName"
    },
    {
        label: i18n.t('common.creatDate'),
        prop: "createDate",
        isSlot: true
    },
]
const WAIT_DATA = [
    {
        width: 55,
        isCheckbox: true
    },
    {
        label: "#",
        type: "index",
        width: 70,
    },
    {
        label: i18n.t('labDevice.waitAsset'),
        prop: "instrumentName",
        isSlot: true
    },
    {
        label: i18n.t('labDevice.waitAsset'),
        prop: "instrumentNo",
    },
    {
        label: i18n.t('labDevice.classify'),
        prop: "assetCategoryName",
        width: 180
    },
    {
        label: i18n.t('labDevice.departmentName'),
        prop: "departmentName"
    },
    {
        label: i18n.t('common.owningRoom'),
        prop: "roomName"
    },
    {
        label: i18n.t('common.img'),
        prop: "logoUrl",
        isSlot: true
    },
    {
        label: i18n.t('common.createName'),
        prop: "createUserName"
    },
    {
        label: i18n.t('common.creatDate'),
        prop: "createDate",
        width: 180
    },
]
export default {
    components: {
        WaitCheckAccept,
        SelectDepartment,
        CheckList,
        InstallConfirm,
        InputAppend,
        AddWarehous,
        Table,
        Pagination,
        ImportFile,
    },
    data() {
        const _this = this;
        return {
            radio: "1",
            statusArr: APPROVALSTATUS,
            statusText,
            BASE_URL,
            statusColor,
            loading: false,
            date: [],
            items: {
                pageSize: 10,
                currentPage: 1,
                endTime: "",
                startTime: "",
                key: "",
                procStatus: null,
                type: 4,
                types: 1,
                useDeptId: null
            },
            total: 0,
            tableData: DATA,
            list: [],
            importFileVisible: false,
            importTitle: "importInstrument",
            multipleSelection: [],
            optionsList: [
                {value: null, label: _this.$t('hardware.allType')},
                {value: 1, label: _this.$t('route.watchlabdevice')},
                {value: 2, label: _this.$t('route.administration')},
                {value: 3, label: _this.$t('route.unwatchlabdevice')},
            ]
        }
    },
    created() {
        this.getList();
    },
    computed: {
        dateFormat() {
            return function (value) {
                if (value) {
                    return moment(Number(value)).format(TIME_FORMAT);
                }
            }
        },
    },
    watch: {
        radio(val) {
            this.tableData = [];
            this.multipleSelection = [];
            if (val == 1) {
                this.items.type = 4;
                this.items.procStatus = null;
                this.items.currentPage = 1;
                this.tableData = DATA;
                this.getList();
            } else {
                this.items["types"] = null;
                this.items["useDeptId"] = null;
                this.items.currentPage = 1;
                this.tableData = WAIT_DATA;
                this.getProcessNoWarehouse();
            }
        }
    },
    methods: {
        init() {
            if (this.radio == 1) {
                this.getList()
            } else {
                this.getProcessNoWarehouse();
            }
        },
        ...mapActions(["getFlowHistoryList"]),
        handleUpdateInit(array) {
            this.importFileVisible = false;
            this.init();
        },
        // 隐藏弹窗
        hiddenModalVisible() {
            this.updateModalVisible = false;
            this.importFileVisible = false;
        },
        handleQuery() {
            if (this.radio == 1) {
                this.items.currentPage = 1;
                if (this.items.procStatus === 0) {
                    this.items.procStatus = "";
                }
                this.getList();
            } else {
                this.items.pageNum = 1;
                this.getProcessNoWarehouse();
            }

        },
        getList() {
            this.loading = true;
            delete this.items.types;
            delete this.items.useDeptId;
            this.list = [];
            this.getFlowHistoryList({item: this.items, date: this.date}).then(res => {
                this.loading = false;
                res.list.map(item => {
                    if (this.radio == 1) {
                        this.list.push({assetInformations: item.assetInformations, ...item.processOrderHistoryEntity})
                    }
                })
                if (res.pageNum === 1 && this.radio == 1) {
                    this.total = res.total;
                }
            });
        },
        // 获取待入库信息列表
        getProcessNoWarehouse() {
            this.loading = true;
            delete this.items.type;
            delete this.items.procStatus;
            getProcessQueryNoWarehouse(this.items).then(res => {
                this.loading = false;
                if (this.radio == 2) {
                    this.list = res.items.list;
                    this.total = res.items.total;
                }
            })
        },
        upload() {

        },
        handleShowDetail(no) {
            this.$refs.installConfirm.open(no);
        },
        handleBatchUpdate(val) {
            if (!this.multipleSelection.length) {
                return this.$message.error(this.$t('labDevice.changeWaitAsset'));
            }
            val.open(1, this.multipleSelection);
        },
        handleSelectionChange(arr) {
            this.multipleSelection = arr;
        }
    },
}
</script>
<style lang="less" scoped>
.logo-img {
    width: 70px;
    height: 70px;
}

.check-tabs {
    margin: 0 !important;
    padding: 0 !important;

    /deep/ .el-tabs__header:after {
        content: "";
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 2px;
        background-color: #e4e7ed;
        z-index: 1;
    }
}
/deep/ .el-table__expanded-cell {
    padding: 0 40PX !important;
}
.expand-table {
    margin-top: 0 !important;

}
</style>