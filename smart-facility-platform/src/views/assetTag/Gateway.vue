<template>
    <div class="gateway" v-loading="loading">
        <div class="session total">
            <device-total
                :isType2="true"
                :object="totalObject"
                @handle="handleStatusScreen"
                @handleAll="handleStatusScreen"/>
        </div>

        <div class="session">
            <div class="search-bar-container">
                <div>
                    <el-input
                        v-model.trim="items.keyword"
                        class="input-with-select"
                        clearable
                        :placeholder="$t('common.inputKeyword')"
                        @keyup.enter.native="getList()">
                        <el-button
                            slot="append"
                            class="el-button-host"
                            icon="icon-search1"
                            @click="getList()">
                        </el-button>
                    </el-input>
                </div>
                <div>
                    <el-button class="icon-setup" @click="multiSelect = !multiSelect">
                        {{ multiSelect ? $t('common.cancelMultiSelect') : $t('common.multiSelect') }}
                    </el-button>
                    <el-button class="icon-addto" type="primary" @click="handleAdd">
                        {{ $t("hardware.addAssetGateway1") }}
                    </el-button>
                    <el-button class="icon-upload" @click="importFileVisible = true"> {{ $t('common.importHandle') }}</el-button>
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
                    <el-button @click="handleBatchDel">{{ $t('common.batchDelete') }}</el-button>
                    <el-button @click="$refs.NetworkConfiguration.open(1,multipleSelection)">{{ $t('hardware.networkConfiguration') }}</el-button>
                </template>
            </div>
            <Table 
                :tableData="tableData" :data="list" 
                @handleShowDrawer="handleShowDrawer"
                @handleEdit="handleEdit"
                @handleSelectionChange="handleSelectionChange"
                @handleDelete="handleDelete">
                <template slot-scope="data">
                    <div v-if="data.prop === 'status'" :class="statusColor(data.data.status, GUNRACKSTATUS)">
                        {{ statusText(data.data.status, GUNRACKSTATUS) }}
                    </div>
                    <div v-if="data.prop === 'reportDate'">{{ data.data.reportDate | localToUtc }}</div>
                </template>
            </Table>

            <div class="paging">
                <pagination
                    v-show="total > 10"
                    :limit.sync="items.pageSize"
                    :page.sync="items.pageNum"
                    :total="total"
                    @pagination="getList"/>
            </div>
        </div>

        <UpdateGateway ref="UpdateGateway" :form="form" @handleInit="handleInit"></UpdateGateway>
        <GatewayDrawer :is-drawer.sync="isDrawer" :id="id"></GatewayDrawer>
        <ImportFile
            v-if="importFileVisible"
            :title="'assetsLabel'"
            @handleUpdateInit="handleUpdateInit"
            @hiddenModalVisible="hiddenModalVisible"></ImportFile>
        <network-configuration ref="NetworkConfiguration" @handle="getList"/>

    </div>
</template>

<script>
    import DeviceTotal from "@c/DeviceTotal/index";
    import Table from "@c/Tables/index";
    import Pagination from "@/components/Pagination/index";
    import UpdateGateway from "./components/UpdateGateway";
    import GatewayDrawer from "./components/GatewayDrawer";
    import ImportFile from "@/components/ImportFile";
    import { GUNRACKSTATUS } from "@/utils/constant";
    import { statusText, statusColor } from "@/utils/methods";
    import { getDeviceList, getEquipmentDashboard, removeBatchDevice, outputEquipmentDevice } from '@/api/device';
    import { postDeviceExportGateway } from "@/api/assetTag";
    import mixin from "@/utils/mixin";
    import moment from "moment";
    import NetworkConfiguration from "@/views/device/components/NetworkConfiguration";
    export default {
        components: {
            DeviceTotal,
            Table,
            Pagination,
            UpdateGateway,
            GatewayDrawer,
            ImportFile,
            NetworkConfiguration
        },
        data() {
            const _this = this;
            return {
                GUNRACKSTATUS,
                statusText,
                statusColor,
                loading: false,
                multipleSelection: [],
                multiSelect: false,
                totalObject: {
                    overview: [
                        {num: 0, title: _this.$t('common.isLine'), status: 1},
                        {num: 0, title: _this.$t('common.offLine'), status: -100},
                        {num: 0, title: _this.$t('common.notActivate'), status: -99},
                    ],
                    total: {title: _this.$t('hardware.assetGatewaySum'), num: 0}
                },
                items: {
                    equipmentType: 16,
                    pageNum: 1,
                    pageSize: 10,
                    status: 0,
                    keyword: ""
                },
                total: 0,
                importFileVisible: false,
                // 表格
                tableData: [
                    {
                        type: "selection",
                        width: "55"
                    },
                    {
                        label: "#",
                        type: "index",
                        width: "60"
                    },
                    {
                        label: _this.$t('common.name'),
                        prop: "name",
                        isButton: true,
                        click: "handleShowDrawer"
                    },
                    {
                        label: _this.$t('common.no'),
                        prop: "no"
                    },
                    {
                        label: _this.$t('common.owningDepartment'),
                        prop: "departmentName"
                    },
                    {
                        label: _this.$t('common.owningRoom'),
                        prop: "roomName"
                    },
                    {
                        label: _this.$t('common.reportDate'),
                        prop: "reportDate",
                        minWidth: "130",
                        isSlot: true
                    },
                    {
                        label: _this.$t('hardware.assetGatewayStatus'),
                        prop: "status",
                        isSlot: true
                    },
                    {
                        label: _this.$t('hardware.assetPropertyNum'),
                        prop: "propertyNum"
                    },
                    {
                        label: _this.$t('common.handle'),
                        isButton: true,
                        width: "120",
                        clickList: [
                            {
                                text: _this.$t('common.edit'),
                                click: "handleEdit",
                            },
                            {
                                text: _this.$t('common.delete'),
                                click: "handleDelete",
                                class: 'abnormal'
                            }
                        ]
                    },
                ],
                list: [],
                form: {},
                // 详情页
                isDrawer: false,
                id: null,
            }
        },
        mounted() {
            this.handleInit()
        },
        methods: {
            // 表格勾选
            handleSelectionChange(val) {
                this.multipleSelection = [];
                val.map(item => {
                    this.multipleSelection.push({id: item.id, no: item.no});
                })
            },
            handleInit() {
                this.getDashboard();
                this.getList()
            },
            getDashboard() {
                getEquipmentDashboard({
                    equipmentType: this.items.equipmentType
                }).then(res => {
                    if(res.code == 1){
                        const {normalCount, offLineCount, total,noActivatedCount} = res.items;
                        this.totalObject.total.num = total;
                        this.totalObject.overview[0].num = normalCount;
                        this.totalObject.overview[1].num = offLineCount;
                        this.totalObject.overview[2].num = noActivatedCount;
                    }
                })
            },
            getList() {
                this.loading = true
                getDeviceList(this.items).then(res => {
                    this.loading = false;
                    if(res.code === 1){
                        this.list = res.items.list;
                        this.total = res.items.total
                    }
                })
            },
            handleStatusScreen(item,type) {
                this.items.status = item;
                this.getList()
            },
            // 新增
            handleAdd() {
                this.$refs.UpdateGateway.open(1)
            },
            // 隐藏导入弹窗
            hiddenModalVisible(){
                this.updateModalVisible = false;
                this.importFileVisible = false
            },
            // 导入上传成功后更新初始化
            handleUpdateInit() {
                this.importFileVisible = false;
                this.handleInit()
            },
            // 导出
            handleExport() {
                new Promise(resolve => {
                    this.$message.warning(this.$t('common.exportMessage'));
                    setTimeout(() => {
                    resolve();
                    }, 1500)
                }).then(() => {
                    postDeviceExportGateway({
                        equipmentType: 16,
                        keyword: this.items.keyword,
                    }).then(res => {
                        const data = moment(new Date()).format("YYYYMMDDHHmmss");
                        mixin.methods.download(
                            res,
                            decodeURIComponent(this.$t('hardware.assetGatewayExport') + data, "UTF-8")
                        )
                    })
                })
            },
            // 编辑
            handleEdit(row){
                this.$refs.UpdateGateway.open(2, row)
            },
            handleBatchDel() {
                if (this.multipleSelection.length < 0) {
                    return
                }
                const ids = Array.from(this.multipleSelection, ({id}) => id)
                this.$confirm(this.$t('hardware.deleteSignalSourceMessage1') , this.$t('other.deleteGateway'), {
                    confirmButtonText: this.$t('common.confirm'),
                    cancelButtonText: this.$t('common.cancel'),
                    type: "warning"
                }).then(() => {
                    this.loading = true;
                    removeBatchDevice({ids: ids}).then(res => {
                        if (res.code) {
                            this.$message.success(this.$t('common.deleteSuccess'));
                            this.handleInit();
                        } else {
                            this.$message.error(res.message);
                        }
                    })
                })
            },
            // 删除
            handleDelete(row) {
                this.$confirm(this.$t('hardware.deleteSignalSourceMessage1') + row.name + "?", this.$t('other.deleteGateway'), {
                    confirmButtonText: this.$t('common.confirm'),
                    cancelButtonText: this.$t('common.cancel'),
                    type: "warning"
                }).then(() => {
                    this.loading = true;
                    removeBatchDevice({ids: [row.id]}).then(res => {
                        if (res.code) {
                            this.$message.success(this.$t('common.deleteSuccess'));
                            this.handleInit();
                        } else {
                            this.$message.error(res.message);
                        }
                    })
                })
            },
            handleShowDrawer(row) {
                this.id = row.strId;
                this.isDrawer = true;
            },
        },
    }
</script>

<style lang="less" scoped>
    @import "./index.less";
</style>