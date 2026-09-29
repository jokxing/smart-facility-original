<template>
    <div class="pipetteGun" v-loading="loading" :element-loading-text="loadingText">
        <div class="session" style="margin-top: 0">
            <device-total
                :object="totalObject"
                @handle="handleQuery"
                @handleAll="handleQuery"/>
        </div>
        <div class="session">
            <div class="search-bar-container">
                <div>
                    <el-input
                        class="input-with-select"
                        v-model="keyword"
                        clearable
                        :placeholder="$t('common.inputKeyword')"
                        @keyup.enter.native="handleQuery($STATUS.ALL)">
                        <el-button slot="append" icon="icon-search1" class="el-button-host" @click="handleQuery($STATUS.ALL)"></el-button>
                    </el-input>
                </div>
                <div>
                    <el-button @click="multiSelect = !multiSelect">
                        {{ multiSelect ? $t('common.cancelMultiSelect') : $t('common.multiSelect') }}
                    </el-button>
                    <el-button type="primary" @click="$refs.UpdateGunRack.open(1)">{{ $t('common.add1') }}</el-button>
                    <el-button @click="importFileVisible = true">{{ $t('common.importHandle') }}</el-button>
                    <el-button @click="handleExport">{{ $t('common.export') }}</el-button>
                </div>
            </div>
            <div v-if="multipleSelection.length || multiSelect" class="choose-bar">
                <template>
                    <div class="checked">
                        {{ $t('common.multipleSelection') }}<span>{{ multipleSelection.length }}</span>{{ $t('common.item') }}
                    </div>
                </template>
                <template>
                    <el-button @click="handleBatchUpdate(1)">{{ $t('common.updateDepartment') }}</el-button>
                    <el-button @click="handleBatchUpdate(2)">{{ $t('common.setPrincipal') }}</el-button>
                    <el-button @click="handleBatchUpdate(3)">{{ $t('labDevice.updateRoom') }}</el-button>
                    <el-button @click="handleBatchDelete">{{ $t('common.batchDelete') }}</el-button>
                    <el-button @click="handleBatchUpdate(4)">{{ $t('labDevice.notScanHint') }}</el-button>
                </template>
            </div>
            <Table 
                :data="pipetteGun" 
                :tableData="tableData" 
                @handleSelectionChange="handleSelectionChange"
                @handleShowDrawer="handleShowDrawer"
                @handleEdit="handleEdit"
                @handleUser="handleUser"
                @handleDelete="handleDelete">
                <template slot-scope="data">
                    <div v-if="data.prop === 'status'" :class="statusColor(data.data.status, GUNRACKSTATUS)">
                        {{ onLineStatus(data.data.status) }}
                    </div>
                    <div v-if="data.prop === 'createDate'">{{ data.data.createDate | localToUtc}}</div>
                </template>
            </Table>
            <div class="paging">
                <pagination
                    v-show="total > 10"
                    :limit.sync="items.pageSize"
                    :page.sync="items.pageNum"
                    :total="total"
                    :page-sizes="$store.state.pageSizes"
                    @pagination="handelQuery"/>
            </div>
        </div>

        <UpdateGunRack ref="UpdateGunRack" @handleInit="handleInit"></UpdateGunRack>
        <UpdateDepartment ref="UpdateDepartment" :departments="$store.state.departments" @handle="getList"/>
        <BatchSetPerson ref="BatchSetPerson" @handle="getList" />
        <BatchUpdateRoomModal ref="BatchUpdateRoomModal" @handle="handleBatchUpdateRoom" />
        <VoiceReminderSet ref="voiceReminderSet" :selectArr="selectArr" />
        <SetPrincipal ref="SetPrincipal" @handle="getList"/>

        <ImportFile
            v-if="importFileVisible"
            :title="importTitle"
            @handleUpdateInit="handleUpdateInit"
            @hiddenModalVisible="hiddenModalVisible"></ImportFile>

        <Drawer :is-drawer.sync="isDrawer" :strId="strId" :id="id"/>
    </div>
</template>

<script>
    import DeviceTotal from "@c/DeviceTotal/index";
    import Table from "@c/Tables";
    import UpdateGunRack from './components/UpdateGunRack';
    import BatchSetPerson from './components/BatchSetPerson';
    import Pagination from "@/components/Pagination/index";
    import UpdateDepartment from "@/views/device/components/UpdateDepartment";
    import BatchUpdateRoomModal from "@/components/BatchUpdateRoomModal"
    import ImportFile from "@/components/ImportFile";
    import SetPrincipal from "@/components/SetPrincipal";
    import Drawer from './components/GunRackDrawer.vue'
    import VoiceReminderSet from "./components/VoiceReminderSet";
    import { items, GUNRACKSTATUS } from "@/utils/constant";
    import { onLineStatus, statusColor } from "@/utils/methods";
    import { getDeviceList, getEquipmentDashboard, removeBatchDevice, outputEquipmentDevice, postDeviceRoom } from '@/api/device'
    import mixin from "@/utils/mixin";
    import moment from "moment";
    export default {
        data() {
            const _this = this;
            return {
                onLineStatus,
                statusColor,
                GUNRACKSTATUS,
                loading: false,
                loadingText: _this.$t('common.hintDefault'),
                totalObject: {
                    overview: [
                        {num: 0, title: _this.$t('common.isLineNum'), status: 1},
                        {num: 0, title: _this.$t('common.offLineNum1'), status: -100},
                        {num: 0, title: _this.$t('common.notActivateNum1'), status: -99},
                    ],
                    total: {title: _this.$t('labDevice.gunBackNum'), num: 0}
                },
                items: {
                    pageSize: items.PAGE_SIZE,
                    pageNum: items.PAGE_NUM,
                    status: 0,
                    equipmentType: 13
                },
                total: 0,
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
                        label:_this.$t('common.no'),
                        prop: "no",
                        width: "170",
                        isButton: true,
                        click: "handleShowDrawer"
                    },
                    {
                        label: _this.$t('common.owningDepartment'),
                        prop: "departmentName",
                    },
                    {
                        label: _this.$t('common.owningRoom'),
                        prop: "roomName",
                    },
                    {
                        label: _this.$t('common.principal'),
                        prop: "userName",
                    },
                    {
                        label: _this.$t('hardware.lineStatus'),
                        prop: "status",
                        isSlot: true
                    },
                    {
                        label: _this.$t('common.creatDate'),
                        prop: "createDate",
                        width: "164",
                        isSlot: true
                    },
                    {
                        label: _this.$t('common.handle'),
                        isButton: true,
                        width: "150",
                        clickList: [
                            {
                                text: _this.$t('common.edit'),
                                click: "handleEdit",
                            },
                            {
                                text: _this.$t('common.principal'),
                                click: "handleUser",
                            },
                            {
                                text: _this.$t('common.delete'),
                                click: "handleDelete",
                                class: 'abnormal'
                            }
                        ]
                    },
                ],
                multiSelect: false,
                multipleSelection: [],
                selectArr: [],
                pipetteGun: [],
                isDrawer: false,
                strId: null,
                id: null,
                keyword: "",
                importFileVisible: false,
                importTitle: "gunRack"
            }
        },
        mounted() {
            const pageSize = localStorage.getItem("pageSize");
            if (pageSize) {
                this.pageSize = pageSize * 1;
            }
            this.handleInit()
        },
        methods: {
            handelQuery() {
                this.getList();
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
                this.loading = true;
                getDeviceList(this.items).then(res => {
                    if (!res.code) {
                        return this.$message.error(res.message);
                    }
                    this.pipetteGun = res.items.list;
                    this.total = res.items.total;
                    this.loading = false;
                })
            },
            getRowKey(row) {
                return row.id;
            },
            // 隐藏导入弹窗
            hiddenModalVisible(){
                this.updateModalVisible = false;
                this.importFileVisible = false;
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
                    outputEquipmentDevice({
                        departmentId: this.items.departmentId,
                        equipmentType: 13,
                        keyword: this.items.keyword,
                    }).then(res => {
                        const data = moment(new Date()).format("YYYYMMDDHHmmss");
                        mixin.methods.download(
                            res,
                            decodeURIComponent(this.$t('labDevice.gunBackExport') + data, "UTF-8")
                        )
                    })
                })
            },
            // 查询
            handleQuery (item,type) {
                this.items.status = item;
                if(this.keyword != ""){
                    this.items['keyword'] = this.keyword
                }else{
                    delete this.items.keyword
                }
                if(type == 1){
                    delete this.items.keyword;
                    this.keyword = ""
                }
                this.getList()
            },
            // 表格勾选
            handleSelectionChange(val) {
                this.selectArr = val;
                this.multipleSelection = [];
                val.map(item => {
                    this.multipleSelection.push(item.id);
                })
            },
            // 拉起详情页
            handleShowDrawer(row) {
                this.strId = row.strId;
                this.id = row.id;
                this.isDrawer = true;
            },
            // 编辑
            handleEdit(row){
                this.$refs.UpdateGunRack.open(2,row)
            },
            // 负责人
            handleUser(row){
                this.$refs.SetPrincipal.open(0, row.id, 'PIPETTE_GUN')
            },
            // 删除
            handleDelete(row) {
                this.$confirm(this.$t('common.deletePrincipalMessage1') + row.name + ">？", this.$t('labDevice.gunBackDelete'), {
                    confirmButtonText: this.$t('common.confirm'),
                    cancelButtonText: this.$t('common.cancel'),
                    type: "warning"
                }).then(() => {
                    this.handleBatchDeleteDevice([row.id])
                })
            },
            // 批量修改
            handleBatchUpdate(type) {
                if (!this.multipleSelection.length) {
                    return this.$message.error(this.$t('labDevice.gunBackChangeUpdate'));
                }
                switch(type) {
                    case 1:
                        this.$refs.UpdateDepartment.open(1, this.multipleSelection);
                        break;
                    case 2:
                        this.$refs.SetPrincipal.open(1, this.multipleSelection, 'PIPETTE_GUN')
                        break;
                    case 3:
                        this.$refs.BatchUpdateRoomModal.open();
                        break;
                    case 4:
                        this.$refs.voiceReminderSet.open();
                        break;
                }
            },
            // 批量修改房间-提交
            handleBatchUpdateRoom(id) {
                postDeviceRoom({
                    roomId: id,
                    deviceIdList: this.multipleSelection
                }).then(res => {
                    if(res.code === 1){
                        this.$refs.BatchUpdateRoomModal.handleModalClose();
                        this.$message.success(this.$t('common.editSuccess'));
                        this.getList()
                    }
                })
            },
            // 批量删除
            handleBatchDelete() {
                if(this.multipleSelection.length <= 0) {
                    this.$message.error(this.$t('labDevice.gunBackChangeDelete'))
                }else{
                    this.$confirm(this.$t('labDevice.gunBackDeleteMessage'), this.$t('labDevice.gunBackDelete'), {
                        confirmButtonText: this.$t('common.confirm'),
                        cancelButtonText: this.$t('common.cancel'),
                        type: "warning"
                    }).then(() => {
                        this.handleBatchDeleteDevice(this.multipleSelection)
                    })
                }
            },
            // 请求删除接口
            handleBatchDeleteDevice(id) {
                this.loading = true;
                removeBatchDevice({ids: id}).then(res => {
                    if (res.code) {
                        this.$message.success(this.$t('common.deleteSuccess'));
                        this.handleInit();
                    } else {
                        this.$message.error(res.message);
                    }
                })
            },
        },
        components:{
            DeviceTotal,
            Table,
            UpdateGunRack,
            BatchSetPerson,
            BatchUpdateRoomModal,
            Pagination,
            SetPrincipal,
            UpdateDepartment,
            ImportFile,
            Drawer,
            VoiceReminderSet
        }
    }
</script>

<style lang="less" scoped>
    @import './index.less';
</style>