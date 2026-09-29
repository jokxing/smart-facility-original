<template>
    <div class="tag" v-loading="loading">
        <div class="session total">
            <device-total
                :isType2="true"
                :unit="$t('common.individual')"
                :object="totalObject"
                v-loading="statisticsLoading"
                @handle="handleStatusScreen"
                @handleAll="handleStatusScreenAll"/>
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
                        {{ $t('hardware.addAssetTag') }}
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
                    <el-button @click="handleEditBindGateway">{{ $t('hardware.fixBindAssetGateway') }}</el-button>
                </template>
            </div>

            <Table 
                :tableData="tableData" 
                :data="list" 
                @handleEdit="handleEdit" 
                @handleDelete="handleDelete"
                @handleSelectionChange="handleSelectionChange">
                <template slot-scope="data">
                    <div v-if="data.prop === 'status'" :class="statusColor(data.data.status, ASSETTAGSTATUS)">
                        {{ statusText(data.data.status, ASSETTAGSTATUS) }}
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

        <UpdateTag ref="updateTag" @handleInit="handleInit" />
        <EditGateway ref="editGateway" @handle="handleInit" />

        <ImportFile
            v-if="importFileVisible"
            :title="'label'"
            @handleUpdateInit="handleUpdateInit"
            @hiddenModalVisible="hiddenModalVisible"></ImportFile>
    </div>
</template>

<script>
    import UpdateTag from "./components/UpdateTag";
    import DeviceTotal from "@c/DeviceTotal/index";
    import Table from "@c/Tables/index";
    import Pagination from "@/components/Pagination/index";
    import ImportFile from "@/components/ImportFile";
    import EditGateway from "./components/EditGateway";
    import { postLabelStatistics, postLabelList, postLabelDelete, getLabelExport } from "@/api/assetTag";
    import { ASSETTAGSTATUS } from "@/utils/constant";
    import { statusText, statusColor } from "@/utils/methods";
    import mixin from "@/utils/mixin";
    import moment from "moment";
    export default {
        components: {
            UpdateTag,
            EditGateway,
            DeviceTotal,
            Table,
            Pagination,
            ImportFile
        },
        data() {
            const _this = this;
            return {
                ASSETTAGSTATUS,
                statusText,
                statusColor,
                loading: false,
                statisticsLoading: false,
                totalObject: {
                    overview: [
                        {num: 0, title: _this.$t('common.monitored'), status: 1, tooltipText: _this.$t('common.monitoredTooltip')},
                        {num: 0, title: _this.$t('common.unmonitor'), status: 0, tooltipText: _this.$t('common.unmonitorTooltip')},
                        {num: 0, title: _this.$t('common.abmonitor'), status: 2, tooltipText: _this.$t('common.abmonitorTooltip')},
                        {num: 0, title: _this.$t('common.beStolen'), status: 3, tooltipText: _this.$t('common.beStolenTooltip')},
                    ],
                    total: {title: _this.$t('hardware.assetTagSum'), num: 0}
                },
                items: {
                    keyword: "",
                    status: null,
                    pageSize: 10,
                    pageNum: 1,
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
                        label: _this.$t('hardware.labelNo'),
                        prop: "labelNo"
                    },
                    {
                        label: _this.$t('hardware.propertyGateName'),
                        prop: "propertyGateName"
                    },
                    {
                        label: _this.$t('hardware.newStatus1'),
                        prop: "status",
                        isSlot: true
                    },
                    {
                        label: _this.$t('common.reportDate'),
                        prop: "reportDate",
                        isSlot: true
                    },
                    {
                        label: _this.$t('hardware.signalStrength1'),
                        prop: "labelSignal"
                    },
                    {
                        label: _this.$t('hardware.labellectric'),
                        prop: "labellectric"
                    },
                    {
                        label: _this.$t('hardware.binInstrument'),
                        prop: "instrumentName"
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
                multiSelect: false,
                multipleSelection: [],
            }
        },
        mounted() {
            this.handleInit()
        },
        methods: {
            handleInit(){
                this.handleStatistics();
                this.getList()
            },
            handleStatistics() {
                this.statisticsLoading = true;
                postLabelStatistics().then(res => {
                    this.statisticsLoading = false;
                    if(res.code === 1){
                        this.totalObject.overview[0].num = res.items.monitorNum;
                        this.totalObject.overview[1].num = res.items.lostConnectionNum;
                        this.totalObject.overview[2].num = res.items.noUseNum;
                        this.totalObject.overview[3].num = res.items.stolenNum;
                        this.totalObject.total.num = res.items.totalNum
                    }
                })
            },
            getList() {
                this.loading = true
                postLabelList(this.items).then(res => {
                    this.loading = false;
                    if(res.code === 1){
                        this.list = res.items.list;
                        this.total = res.items.total
                    }
                })
            },
            handleStatusScreen(item) {
                this.items.status = item;
                this.getList()
            },
            handleStatusScreenAll(){
                this.items.status = null;
                this.getList()
            },
            handleAdd() {
                this.$refs.updateTag.open(1)
            },
            handleEdit(row) {
                this.$refs.updateTag.open(2,row)
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
                var data = {
                    keyword: this.items.keyword,
                    status: this.items.status
                }
                new Promise(resolve => {
                    this.$message.warning(this.$t('common.exportMessage'));
                    setTimeout(() => {
                        resolve();
                    }, 1500)
                }).then(() => {
                    getLabelExport(data).then(res => {
                        const data = moment(new Date()).format("YYYYMMDDHHmmss");
                        mixin.methods.download(
                            res,
                            decodeURIComponent(this.$t('hardware.assetTagExport') + data, "UTF-8")
                        )
                    })
                })
            },
            // 删除
            handleDelete(row) {
                this.$confirm(this.$t('hardware.deleteAssetTag'), this.$t('common.hint'), {
                    confirmButtonText: this.$t('common.confirm'),
                    cancelButtonText: this.$t('common.cancel'),
                    type: 'warning'
                }).then(() => {
                    var ids = [];
                    ids.push(row.id);
                    this.handleLabelDelete(ids)
                });
            },
            // 请求删除接口
            handleLabelDelete(ids){
                postLabelDelete({labelIdList: ids}).then(res => {
                    if(res.code){
                        if(res.code === 1){
                            this.$message.success(this.$t('common.deleteSuccess'));
                            this.handleInit();
                        }else{
                            this.$message.error(res.message)
                        }
                    }else{
                        this.$message.error(res.message)
                    }
                })
            },
            // 表格勾选
            handleSelectionChange(val) {
                this.multipleSelection = [];
                val.map(item => {
                    this.multipleSelection.push(item.id);
                })
            },
            // 批量删除
            handleBatchDel() {
                if (!this.multipleSelection.length) {
                    return this.$message.error(this.$t('hardware.selectDeleteAssetTag'));
                }
                this.$confirm(this.$t('hardware.deleteAssetTagMessage1') + this.multipleSelection.length + this.$t('hardware.deleteAssetTagMessage2'), this.$t('hardware.deleteAssetTagTitle'), {
                    type: "warning",
                    confirmButtonText: this.$t('common.confirm'),
                    cancelButtonText: this.$t('common.cancel'),
                }).then(() => {
                    this.handleLabelDelete(this.multipleSelection)
                }).catch(() => {
                    this.$message.info(this.$t('common.deleteCanceled'))
                })
            },
            handleEditBindGateway() {
                if (!this.multipleSelection.length) {
                    return this.$message.error(this.$t('hardware.selectAssetTag'));
                }
                this.$refs.editGateway.open(this.multipleSelection)
            }
        },
    }
</script>

<style lang="less" scoped>
    @import "./index.less";
</style>