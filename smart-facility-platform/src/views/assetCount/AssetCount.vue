<template>
    <div class="asset-count" v-loading="loading">
        <div class="top-search">
            <div>
                <el-form :inline="true" :label-position="'left'" label-width="auto">
                    <el-form-item :label="$t('labDevice.selectDate')">
                        <el-date-picker
                            v-model="dateStr"
                            type="date"
                            :clearable="false"
                            :placeholder="$t('labDevice.selectDate')"
                            @change="handleDate">
                        </el-date-picker>
                    </el-form-item>
                    <el-form-item :label="$t('labDevice.checkType')">
                        <el-select class="count-type" v-model="inventoryId" :placeholder="$t('common.placeholder')" @change="getStatisticsList">
                            <el-option
                                v-for="item in options"
                                :key="item.id"
                                :label="(item.inventoryType === 0 ? $t('labDevice.checkNormal') : $t('labDevice.checkRecoil')) + '（' + item.createDate + '）'"
                                :value="item.id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
            </div>
            <div>
                <el-button type="primary" icon="icon-pandian" :disabled="inventoryDis" @click="handlePropertyInventory">
                    {{ $t('labDevice.immediatelyCheck') }}</el-button>
                <el-button icon="icon-chaoshiweiguihuan" @click="handleActivateTag"> 
                    {{ monitorStatus === 1 ? $t('labDevice.oneActivation') : $t('labDevice.openActivation') }}
                </el-button>
                <el-button icon="icon-clock" @click="$refs.countIntervalSet.open(inventoryInterval)"> {{ $t('labDevice.checkInterval') }}</el-button>
                <el-dropdown @command="$refs.activationHistory.open()">
                    <el-button type="text" icon="el-icon-more" class="more"></el-button>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item>{{ $t('labDevice.tagCloseLog') }}</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>
        </div>

        <AssetTotal :statistics="statistics" v-loading="statisticsLoading" />

        <div class="head">
            <div class="title">{{ $t('labDevice.moveAssetList') }}
                <el-button @click="handleExport">{{ $t('common.export') }}</el-button>
            </div>
        </div>

        <div class="session" v-loading="filterLoading">
            <Table 
                :tableData="tableData" 
                :data="list" 
                v-loading="tableDataLoading"
                @handleFilterTag="handleFilterTag"
                @handleShowDrawer="handleShowDrawer">
                <template slot-scope="data">
                    <div 
                        v-if="data.prop === 'gatewayStatus'" 
                        :class="data.data.gatewayStatus === $STATUS.OFFLINE ? 'abnormal' : 'normal'">
                        {{ onLineStatus(data.data.gatewayStatus) }}
                    </div>
                    <div 
                        v-else-if="data.prop === 'labelStatus'"
                        :class="statusColor(data.data.labelStatus, ASSETTAGSTATUS)">
                        {{ statusText(data.data.labelStatus, ASSETTAGSTATUS) }}
                    </div>
                    <div 
                        v-else-if="data.prop === 'instrumentStatus'"
                        :class="statusColor(data.data.instrumentStatus, LABSTATUS)">
                        {{ statusText(data.data.instrumentStatus, LABSTATUS) }}
                    </div>
                    <el-table-column
                        v-else
                        :label="$t('common.handle')"
                        :filters="filters"
                        :filtered-value="filteredValue"
                        width="170">
                        <!-- <template slot-scope="scope">
                            <el-button link type="text" size="small" @click="$refs.movingTrack.open(scope.row)">查看</el-button>
                            <el-button link type="text" size="small" @click="handleAdjustment(1, scope.row)">位置调整</el-button>
                            <el-button link type="text" size="small" @click="$refs.processingRecord.open(scope.row)">处理记录</el-button>
                        </template> -->
                    </el-table-column>
                </template>
            </Table>
            <div class="paging">
                <pagination
                    v-show="total > 10"
                    :limit.sync="items.pageSize"
                    :page.sync="items.pageNum"
                    :total="total"
                    @pagination="getPropertyList"/>
            </div>
        </div>

        <CountIntervalSet ref="countIntervalSet" @handle="getInventoryList" />
        <ActivationHistory ref="activationHistory" />
        <MovingTrack ref="movingTrack" @handleAdjustment="handleAdjustment" @handle="getPropertyList" />
        <PositionAdjustment ref="positionAdjustment" @handle="getPropertyList" />
        <ProcessingRecord ref="processingRecord" />
        <LabDeviceDrawer :id="detailId" :is-drawer.sync="isDrawer"/>
    </div>
</template>

<script>
    import AssetTotal from "./components/AssetTotal";
    import Table from "@c/Tables";
    import Pagination from "@/components/Pagination/index";
    import CountIntervalSet from "./components/CountIntervalSet";
    import ActivationHistory from "./components/ActivationHistory";
    import MovingTrack from "./components/MovingTrack";
    import PositionAdjustment from "./components/PositionAdjustment";
    import ProcessingRecord from "./components/ProcessingRecord";
    import LabDeviceDrawer from "@/views/labDevice/components/LabDeviceDrawer";
    import { 
        getPropertyNumStatistics, 
        postPropertyMovePropertyList, 
        getPropertyInventoryList, 
        postPropertyInventory, 
        getPropertyActivation, 
        getPropertyListField, 
        postPropertyListField,
        getPropertyExportInventoryList
    } from "@/api/property";
    import { ASSETTAGSTATUS, LABSTATUS } from "@/utils/constant";
    import { statusText, statusColor, onLineStatus } from "@/utils/methods";
    import mixin from "@/utils/mixin";
    import moment from "moment";
    export default {
        components: {
            AssetTotal,
            Table,
            Pagination,
            CountIntervalSet,
            ActivationHistory,
            MovingTrack,
            PositionAdjustment,
            ProcessingRecord,
            LabDeviceDrawer
        },
        data() {
            const _this = this;
            return {
                ASSETTAGSTATUS,
                LABSTATUS,
                statusText,
                statusColor,
                onLineStatus,
                loading: false,
                dateStr: "",
                inventoryDis: false,
                inventoryId: null,
                options: [],
                monitorStatus: 0,
                inventoryInterval: 0,
                statistics: {},
                statisticsLoading: false,
                items: {
                    inventoryId: null,
                    pageSize: 10,
                    pageNum: 1,
                },
                total: 0,
                tableDataLoading: false,
                filterLoading: false,
                filters: [
                    {
                        text: _this.$t('labDevice.labDeviceName'),
                        value: 1
                    },
                    {
                        text: _this.$t('labDevice.labDeviceNo'),
                        value: 2
                    },
                    {
                        text: _this.$t('labDevice.checkBefore'),
                        value: 3
                    },
                    {
                        text: _this.$t('labDevice.moveAfter'),
                        value: 4
                    },
                    {
                        text: _this.$t('common.owningDepartment'),
                        value: 5
                    },
                    {
                        text: _this.$t('labDevice.signValue'),
                        value: 6
                    },
                    {
                        text: _this.$t('hardware.lineStatus'),
                        value: 7
                    },
                    {
                        text: _this.$t('labDevice.moveAfter'),
                        value: 8
                    },
                    {
                        text: _this.$t('labDevice.monitorStatus'),
                        value: 9
                    },
                    {
                        text: _this.$t('hardware.labelNo'),
                        value: 10
                    },
                ],
                filteredValue: [],
                tableData: [
                    {
                        label: "#",
                        type: "index",
                        width: "60"
                    },
                    {
                        label: _this.$t('labDevice.labDeviceName'),
                        prop: "instrumentName",
                        value: 1,
                        isButton: true,
                        click: "handleShowDrawer",
                    },
                    {
                        label: _this.$t('labDevice.labDeviceNo'),
                        prop: "instrumentNo",
                        value: 2,
                        isButton: true,
                        click: "handleShowDrawer",
                    },
                    {
                        label: _this.$t('labDevice.checkBefore'),
                        prop: "inventoryBeforeRoomName",
                        value: 3
                    },
                    {
                        label: _this.$t('labDevice.moveAfter'),
                        prop: "inventoryAfterRoomName",
                        value: 4
                    },
                    {
                        label: _this.$t('common.owningDepartment'),
                        prop: "departmentName",
                        value: 5
                    },
                    {
                        label: _this.$t('labDevice.signValue'),
                        prop: "labelSignal",
                        value: 6
                    },
                    {
                        label: _this.$t('labDevice.gatewayStatus'),
                        prop: "gatewayStatus",
                        width: "120",
                        isSlot: true,
                        value: 7
                    },
                    {
                        label: _this.$t('hardware.lineStatus'),
                        prop: "labelStatus",
                        width: "120",
                        isSlot: true,
                        value: 8
                    },
                    {
                        label: _this.$t('labDevice.runStatus'),
                        prop: "instrumentStatus",
                        isSlot: true,
                        value: 9
                    },
                    {
                        label: _this.$t('hardware.labelNo'),
                        prop: "labelNo",
                        value: 10
                    },
                    {
                        label: _this.$t('common.handle'),
                        isSlotColumn: true
                    },
                ],
                tableDatas: [],
                list: [],
                num: 0,
                isDrawer: false,
                detailId: ""
            }
        },
        mounted() {
            this.tableDatas = JSON.parse(JSON.stringify(this.tableData));
            this.getInventoryList()
            this.getListField()
        },
        methods: {
            // 盘点类型初始化
            getInventoryList() {
                this.statisticsLoading = true;
                this.tableDataLoading = true;
                getPropertyInventoryList({dateStr: this.dateStr}).then(res => {
                    if(res.code === 1){
                        this.options = res.items.inventoryRecordList;
                        this.monitorStatus = res.items.monitorStatus;
                        if(res.items.inventoryConfig){
                            this.inventoryInterval = res.items.inventoryConfig.inventoryInterval ? res.items.inventoryConfig.inventoryInterval : 0;
                        }
                        if(res.items.inventoryRecordList.length > 0){
                            this.inventoryId = res.items.inventoryRecordList[0].id;
                            this.dateStr = moment(res.items.inventoryRecordList[0].createDate).format("YYYY-MM-DD");
                            if(this.num === 0){
                                this.getInventoryList();
                            }
                            if(this.num > 0){
                                this.getStatisticsList();
                            }
                            this.num++;
                        }else{
                            this.statistics = {};
                            this.list = [];
                            this.statisticsLoading = false;
                            this.tableDataLoading = false;
                        }
                    }else{
                        this.statisticsLoading = false;
                        this.tableDataLoading = false;
                    }
                })
            },
            getStatisticsList() {
                this.getStatistics();
                this.getPropertyList();
            },
            // 统计
            getStatistics() {
                this.statisticsLoading = true;
                getPropertyNumStatistics({inventoryId: this.inventoryId}).then(res => {
                    this.statisticsLoading = false;
                    if(res.code === 1){
                        this.statistics = res.items
                    }
                })
            },
            // 移动资产列表
            getPropertyList() {
                this.items.inventoryId = this.inventoryId;
                this.tableDataLoading = true;
                postPropertyMovePropertyList(this.items).then(res => {
                    this.tableDataLoading = false;
                    if(res.code === 1){
                        this.list = res.items.list
                        this.total = res.items.total
                    }
                })
            },
            // 表格筛选初始化
            getListField() {
                var arr = [];
                this.filterLoading = true;
                getPropertyListField().then(res => {
                    this.filterLoading = false;
                    if(res.code === 1){
                        if(res.items.length > 0){
                            for(var i = 0; i < res.items.length; i++){
                                this.$set(this.filteredValue,i,res.items[i])
                            }
                            arr = res.items;
                        }else{
                            for(var i = 0; i < this.filters.length; i++){
                                this.$set(this.filteredValue,i,this.filters[i].value)
                            }
                            arr = this.filteredValue;
                        }
                    }else{
                        for(var i = 0; i < this.filters.length; i++){
                            this.$set(this.filteredValue,i,this.filters[i].value)
                        }
                        arr = this.filteredValue;
                    }
                    this.handleFilterTable(arr)
                })
            },
            // 表格筛选设置
            handleFilterTag(filters,row){
                var arr = [];
                for (const key in filters) {
                    if (Object.hasOwnProperty.call(filters, key)) {
                        arr = filters[key];
                    }
                    if(filters[key].length === 0){
                        for(var i = 0; i < this.filters.length; i++){
                            arr.push(this.filters[i].value)
                        }
                    }
                }
                this.handleFilterTable(arr)
                this.filteredValue = arr;
                postPropertyListField({fieldList: this.filteredValue}).then(res => {

                })
            },
            // 过滤表格
            handleFilterTable(arr) {
                var tableData = [
                    {
                        label: "#",
                        type: "index",
                        width: "60"
                    },
                ];
                for(var i = 0; i < this.tableDatas.length; i++){
                    for(var j = 0; j < arr.length; j++){
                        if(this.tableDatas[i].value == arr[j]){
                            tableData.push(this.tableDatas[i])
                        }
                    }
                }
                tableData.push(
                    {
                        label: this.$t('common.handle'),
                        isSlotColumn: true
                    },
                )
                this.tableData = tableData;
            },
            // 导出
            handleExport() {
                var data = this.items;
                new Promise(resolve => {
                    this.$message.warning(this.$t('common.exportMessage'));
                    setTimeout(() => {
                        resolve();
                    }, 1500)
                }).then(() => {
                    getPropertyExportInventoryList(data).then(res => {
                        const data = moment(new Date()).format("YYYYMMDDHHmmss");
                        mixin.methods.download(
                            res,
                            decodeURIComponent("移动资产列表导出 " + data, "UTF-8")
                        )
                    })
                })
            },
            // 选择日期
            handleDate(val) {
                this.dateStr = moment(val).format("YYYY-MM-DD");
                this.inventoryId = null;
                this.getInventoryList()
            },
            // 立即盘点
            handlePropertyInventory() {
                this.inventoryDis = true;
                postPropertyInventory().then(res => {
                    if(res.code){
                        if(res.code === 1){
                            if(res.items.status === 1){
                                this.$message.success(this.$t('labDevice.checkSuccess'));
                                this.getInventoryList();
                            }else if(res.items.status === 0){
                                this.$message.error(this.$t('labDevice.checkError'))
                            }else{
                                this.$message.warning(this.$t('labDevice.checking'))
                            }

                            var _this = this;
                            setTimeout(function(){
                                _this.inventoryDis = false;
                            },5000)
                        }else{
                            this.$message.error(res.message)
                        }
                    }else{
                        this.$message.error(res.message)
                    }
                })
            },
            // 一键激活/关闭标签监控
            handleActivateTag() {
                var monitorStatus = this.monitorStatus === 1 ? 0 : 1;
                if(monitorStatus === 1){
                    var text = this.$t('labDevice.oneClickActivation') + "<span style='color:red'>"+this.$t('labDevice.oneClickActivation2')+"</span>"+this.$t('labDevice.oneClickActivation3')
                }else{
                    var text = this.$t('labDevice.oneClickActivation4')
                }
                this.$confirm(text, this.$t('common.hint'),{
                    confirmButtonText: this.$t('common.confirm'),
                    cancelButtonText: this.$t('common.cancel'),
                    dangerouslyUseHTMLString: true 
                }).then(() => {
                    this.loading = true;
                    getPropertyActivation({active: monitorStatus}).then(res => {
                        this.loading = false;
                        if(res.code){
                            if(res.code === 1){
                                if(res.items.code === 0){
                                    this.$message.success(monitorStatus === 0 ? '一键激活成功': '一键关闭成功');
                                    this.getInventoryList();
                                }else{
                                   this.$message.error(res.items.message) 
                                }
                            }else{
                                this.$message.error(res.message)
                            }
                        }else{
                            this.$message.error(res.message)
                        }
                    })
                })
            },
            // 查看
            handleSee(row){
                this.$refs.movingTrack.open(row)
            },
            // 位置调整
            handleAdjustment(index, row, type){
                this.$refs.positionAdjustment.open(index,row,type)
            },
            // 拉起详情
            handleShowDrawer(row) {
                this.detailId = row.instrumentId;
                this.isDrawer = true;
            },
        },
    }
</script>

<style lang="less" scoped>
    @import "./AssetCount.less";
</style>