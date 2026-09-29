<template>
    <div class="pipetteGun">
        <div class="session pipetteGun-top" style="margin-top: 0" v-loading="statisticsLoading">
            <device-total
                :isGun="true"
                :object="totalObject"
                @handle="handleQuery"
                @handleAll="handleQuery"/>
        </div>

        <div class="statistics">
            <div class="session session-half">
                <UtilizationStatistics />
            </div>
            <div class="session session-half">
                <NotReturnedStatistics />
            </div>
        </div>

        <div class="session">
            <div class="search-bar-container">
                <div class="mb-10">
                    <el-button @click="$refs.floorDrawer.open()">{{ $t('labDevice.addressScreen') }}</el-button>
                    <el-select
                        class=" margin-small-right"
                        v-model="roomId"
                        :remote-method="remoteMethod"
                        filterable
                        remote
                        :loading="roomLoading"
                        @change="handleRoomChange"
                        clearable
                        @clear="handleClear"
                        :placeholder="$t('labDevice.roomScreen')">
                        <el-option
                            v-for="item in rooms"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id">
                        </el-option>
                    </el-select>
                    <SelectDepartment
                        :departmentId.sync="items.departmentId"
                        :is-company="true"
                        class="w250"
                        :select-tree-value.sync="items.departmentId"
                        @change="handleListQuery"/>
                    
                    <UserCompanySelect
                        class="margin-small-right"
                        :userId.sync="items.signatureId"
                        @getVal="handleSignature" />

                    <!-- <SelectRoomTree
                        @getValue="selectRoom"
                        class="input-with-select margin-small-right"
                        :placeholder="$t('labDevice.selectAddress')"
                        :updateRoomName="roomName"
                        :room-id.sync="items.roomId"
                        :select-tree-value.sync="items.roomId"/> -->

                    <el-input
                        v-model="items.keyword"
                        class="w240 margin-small-right"
                        clearable
                        :placeholder="$t('common.inputKeyword')"
                        @keyup.enter.native="getList">
                        <el-button
                            slot="append"
                            icon="icon-search1"
                            class="el-button-host"
                            @click="handleListQuery">
                        </el-button>
                    </el-input>

                    <el-button icon="el-icon-refresh-right" @click="handleRefresh"></el-button>
                </div>
                <div class="mb-10">
                    <el-button class="icon-setup" @click="multiSelect = !multiSelect">
                        {{ multiSelect ? $t('common.cancelMultiSelect') : $t('common.multiSelect') }}
                    </el-button>
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
                    <el-button @click="$refs.SetPrincipal.open(1, multipleSelection, 'GUN')">{{ $t('common.setPrincipal') }}</el-button>
                    <el-button @click="$refs.editPipetteGun.open(multipleSelection, true)">{{ $t('common.updateDepartment') }}</el-button>
                    <el-button @click="$refs.UpdateAlarmRules.open(false, multipleSelection)">{{ $t('labDevice.alarmRules') }}</el-button>
                    <!-- <el-button @click="handleBatchDel">批量删除</el-button> -->
                </template>
            </div>
            <Table 
                v-loading="tableLoading"
                :data="pipetteGun" 
                :tableData="tableData" 
                @handleSelectionChange="handleSelectionChange"
                @handleShowDrawer="handleShowDrawer"
                @handleShowGunRackDrawer="handleShowGunRackDrawer"
                @handleEdit="handleEdit"
                @handleHeadUser="handleHeadUser"
                @handleDelete="handleDelete">
                <template slot-scope="data">
                    <a 
                        v-if="data.prop === 'no'"
                        link 
                        type="primary" 
                        size="small"
                        @click="handleShowDrawer(data.data)">
                           {{ data.data.no }}
                    </a>

                    <div v-if="data.prop === 'homingStatus'" :class="statusColor(data.data.homingStatus, GUNSTATUS)">
                        {{ statusText(data.data.homingStatus, GUNSTATUS) }}
                    </div>

                    <div v-if="data.prop === 'overTime'" class="abnormal">{{ data.data.overTime }}</div>
                    <div v-if="data.prop === 'takeOutTime'" class="abnormal">{{ data.data.takeOutTime | localToUtc }}</div>
                    <div v-if="data.prop === 'homingTime'" class="abnormal">{{ data.data.homingTime | localToUtc }}</div>
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

            <ScreenResultStatistics ref="screenResultStatistics" />

            <TimeoutSignature ref="timeoutSignature" />
        </div>

        <floor-drawer ref="floorDrawer" @handle="handleFloorSearchRoom"/>
        <RoomScreen ref="roomScreen" @handle="handleRoomScreen" />

        <EditPipetteGun ref="editPipetteGun" @handle="getList"></EditPipetteGun>
        <SetPrincipal ref="SetPrincipal" @handle="getList"/>
        <UpdateAlarmRules ref="UpdateAlarmRules" @handle="getList" />

        <PipetteGunDrawer :is-drawer.sync="isDrawer" :id="id" :no="no" />
        <PipetteGunRackDrawer :is-drawer.sync="isGunRackDrawer" :id="gunRackId" :strId="strId" />
    </div>
</template>

<script>
    import DeviceTotal from "@c/DeviceTotal/index";
    import UtilizationStatistics from "./components/UtilizationStatistics";
    import NotReturnedStatistics from "./components/NotReturnedStatistics";
    import RoomScreen from "@c/RoomScreen";
    import SelectDepartment from "@c/SelectdePartment";
    import UserCompanySelect from "@/components/UserCompanySelect";
    import FloorDrawer from "@c/FloorDrawer";
    import SelectRoomTree from "@c/SelectRoomTree";
    import UpdateAlarmRules from "./components/UpdateAlarmRules"
    import Table from "@c/Tables";
    import Pagination from "@/components/Pagination/index";
    import EditPipetteGun from './components/EditPipetteGun';
    import SetPrincipal from "@/components/SetPrincipal";
    import PipetteGunDrawer from './components/PipetteGunDrawer';
    import PipetteGunRackDrawer from '@/views/pipetteGunRack/components/GunRackDrawer';
    import ScreenResultStatistics from "./components/ScreenResultStatistics";
    import TimeoutSignature from "./components/TimeoutSignature";
    import { postGunPipetteList,postGunPipetteStatistics, postGunPipetteDel, getGunPipetteExport } from "@/api/gun";
    import { statusText, statusColor } from "@/utils/methods";
    import { GUNSTATUS } from "@/utils/constant";
    import mixin from "@/utils/mixin";
    import moment from "moment";
    import {getRoomList} from "@/api/room";
    export default {
        data() {
            const _this = this;
            return {
                GUNSTATUS,
                statusText,
                statusColor,
                statisticsLoading: false,
                tableLoading: false,
                totalObject: {
                    overview: [
                        {num: 0, title: _this.$t('labDevice.onGunRack'), status: 0},
                        {num: 0, title: _this.$t('labDevice.notGunRack'), status: 1},
                        {num: 0, title: _this.$t('labDevice.overTime'), status: 2},
                    ],
                    total: {title: _this.$t('labDevice.gunSum'), num: null}
                },
                items: {
                    pageSize: 10,
                    pageNum: 1,
                    departmentId: null,
                    keyword: "",
                    gardenId: null,
                    buildingId: null,
                    floorId: null,
                    roomIds: [],
                    signatureId: null,
                    status: null
                },
                keywords: "",
                roomName: "",
                tableData:[
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
                        click: "handleShowDrawer",
                    },
                    {
                        label: _this.$t('common.no'),
                        prop: "no",
                        isSlot: true,
                    },
                    {
                        label: _this.$t('labDevice.placeGun'),
                        prop: "gunRackName",
                        isButton: true,
                        click: "handleShowGunRackDrawer",
                    },
                    {
                        label: _this.$t('common.owningDepartment'),
                        prop: "departmentName",
                    },
                    {
                        label: _this.$t('labDevice.address'),
                        prop: "position",
                    },
                    {
                        label: _this.$t('common.principal'),
                        prop: "headUser",
                    },
                    {
                        label: _this.$t('labDevice.lastUse'),
                        prop: "endUser",
                    },
                    {
                        label: _this.$t('hardware.status'),
                        prop: "homingStatus",
                        isSlot: true
                    },
                    {
                        label: _this.$t('labDevice.outTime1'),
                        prop: "overTime",
                        isSlot: true,
                        width: "100"
                    },
                    {
                        label: _this.$t('labDevice.lastUseTime'),
                        prop: "takeOutTime",
                        width: "158",
                        isSlot: true
                    },
                    {
                        label: _this.$t('labDevice.lastReturnTime'),
                        prop: "homingTime",
                        width: "158",
                        isSlot: true
                    },
                    {
                        label: _this.$t('common.handle'),
                        isButton: true,
                        width: "110",
                        clickList: [
                            {
                                text: _this.$t('common.edit'),
                                click: "handleEdit",
                            },
                            {
                                text: _this.$t('common.principal'),
                                click: "handleHeadUser",
                            },
                            // {
                            //     text: "删除",
                            //     click: "handleDelete",
                            //     class: 'abnormal'
                            // }
                        ]
                    },
                ],
                total: 0,
                multiSelect: false,
                multipleSelection: [],
                pipetteGun: [],
                isDrawer: false,
                isGunRackDrawer: false,
                id: null,
                no: "",
                gunRackId: null,
                strId: null,
                // 地理位置
                location: {},
                isSeographicalLocation: false,
                floorLevel: null,
                roomId: "",
                roomLoading: false,
                rooms: []
            }
        },
        mounted() {
            this.getList();
            this.handleStatistics()
        },
        methods: {
            handleClear() {
                this.roomId = "";
                this.items.roomIds = [];
                this.getList();
            },
            handleRoomChange(e) {
                if (!e) {
                    return
                }
                this.items.roomIds = [e];
                this.getList();
            },
            remoteMethod(query) {
                if (query !== '') {
                    this.roomLoading = true;
                    getRoomList({
                        keyword: query,
                        pageSize: 10,
                        pageNum: 1
                    }).then(res => {
                        this.roomLoading = false;
                        this.rooms = res.items.list;
                    })
                } else {
                    this.rooms = [];
                }
            },
            getList() {
                this.keywords = this.items.keyword;
                this.tableLoading = true;
                postGunPipetteList(this.items).then(res => {
                    this.tableLoading = false;
                    if(res.code === 1){
                        this.pipetteGun = res.items.list;
                        this.total = res.items.total
                    }
                })
            },
            handleStatistics() {
                this.statisticsLoading = true;
                postGunPipetteStatistics().then(res => {
                    this.statisticsLoading = false;
                    if(res.code === 1){
                        this.totalObject.total.num = res.items.totalNum;
                        this.totalObject.overview[0].num = res.items.noHomingNum;
                        this.totalObject.overview[1].num = res.items.homingNum;
                        this.totalObject.overview[2].num = res.items.errorHomingNum;
                    }
                })
            },
            // 查询
            handleQuery(status) {
                this.items.status = status;
                this.handleListQuery()
            },
            // 地理位置筛选
            handleFloorSearchRoom(item) {
                if (item.level === 1) {
                    this.items.gardenId = item.data.id;
                    this.items.buildingId = null;
                    this.items.floorId = null;
                }
                if (item.level === 2) {
                    this.items.buildingId = item.data.id;
                    this.items.floorId = null;
                }
                if (item.level === 3) {
                    this.items.floorId = item.data.id;
                }
                this.handleListQuery();

                this.floorLevel = item.level;
                this.location = {
                    buildingId: this.items.buildingId,
                    floorId: this.items.floorId,
                    gardenId: this.items.gardenId
                }
                this.isSeographicalLocation = true;
            },
            // 显示房间筛选
            showRoomScreen() {
                if(this.isSeographicalLocation){
                    this.$refs.roomScreen.open(this.location,this.floorLevel)
                }else{
                    this.$refs.roomScreen.open()
                }
            },
            // 房间筛选
            handleRoomScreen(data) {
                this.location = data;
                this.items.gardenId = data.gardenId;
                this.items.buildingId = data.buildingId;
                this.items.floorId = data.floorId;
                this.items.roomIds = data.roomIds;
                this.handleListQuery();
            },
            // 选择负责人
            handleSignature(id) {
                this.items.signatureId = id;
                this.handleListQuery()
            },
            // 查询：控制列表+筛选结果统计+超时未归还统计
            handleListQuery() {
                this.getList();
                this.$refs.screenResultStatistics.getList(this.items);
                this.$refs.timeoutSignature.init(this.items)
            },
            // 刷新
            handleRefresh() {
                this.items.pageSize = 10;
                this.items.pageNum = 1;
                this.items.gardenId = null;
                this.items.buildingId = null;
                this.items.floorId = null;
                this.items.roomIds = null;
                this.isSeographicalLocation = false;
                this.floorLevel = null
                this.handleListQuery();
            },
            // 选择房间
            // selectRoom(id, name) {
            //     this.items.roomId = id;
            //     this.roomName = name;
            //     this.getList()
            // },
            // 导出
            handleExport() {
                var data = {
                    departmentId: this.items.departmentId,
                    homingStatus: this.items.status,
                    roomId: this.items.roomId,
                    keyword: this.items.keyword,
                    // gunIdList: this.multipleSelection.toString()
                }
                new Promise(resolve => {
                    this.$message.warning(this.$t('common.exportMessage'));
                    setTimeout(() => {
                        resolve();
                    }, 1500)
                }).then(() => {
                    getGunPipetteExport(data).then(res => {
                        const data = moment(new Date()).format("YYYYMMDDHHmmss");
                        mixin.methods.download(
                            res,
                            decodeURIComponent(this.$t('labDevice.gunExport') + data, "UTF-8")
                        )
                    })
                })
            },
            // 编辑
            handleEdit(row) {
                this.isBatch = false;
                this.$refs.editPipetteGun.open(row)
            },
            // 负责人
            handleHeadUser(row) {
                this.$refs.SetPrincipal.open(0, row.pipetteGunId, "GUN")
            },
            // 删除
            handleDelete(row) {
                this.$confirm("确定删除<" + row.gunRackName + ">房间吗", "删除房间", {
                    type: "warning",
                    confirmButtonText: "确定",
                    cancelButtonText: "取消"
                }).then(() => {
                    var ids = [];
                    ids.push(row.pipetteGunId);
                    this.handleGunPipetteDel(ids)
                }).catch(() => {
                    this.$message.info("取消删除！")
                })
            },
            handleGunPipetteDel(ids) {
                postGunPipetteDel({gunIdList: ids}).then(res => {
                    if(res.code){
                        if(res.code === 1){
                            this.$message.success("删除成功");
                            this.getList()
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
                    this.multipleSelection.push(item.pipetteGunId);
                })
            },
            // 批量修改
            handleBatchUpdate(val){
                if (!this.multipleSelection.length) {
                    return this.$message.error(this.$t('labDevice.fixGun'));
                }
                if(val === "SetPrincipal"){
                    this.$refs[val].open(1, this.multipleSelection, 'GUN')
                }else if(val === "editPipetteGun") {
                    this.$refs[val].open(this.multipleSelection, true)
                }else{
                    this.$refs[val].open(this.multipleSelection)
                }
            },
            // 批量删除
            // handleBatchDel() {
            //     if (!this.multipleSelection.length) {
            //         return this.$message.error("请选择需要删除的移液枪");
            //     }
            //     this.$confirm("确定删除" + this.multipleSelection.length + "移液枪吗", "删除移液枪", {
            //         type: "warning",
            //         confirmButtonText: "确定",
            //         cancelButtonText: "取消"
            //     }).then(() => {
            //         this.handleGunPipetteDel(this.multipleSelection)
            //     }).catch(() => {
            //         this.$message.info("取消删除！")
            //     })
            // },
            // 详情页
            handleShowDrawer(row) {
                this.id = row.pipetteGunId;
                this.no = row.no;
                this.isDrawer = true;
            },
            handleShowGunRackDrawer(row){
                this.gunRackId = row.gunRackId;
                this.strId = row.strId;
                this.isGunRackDrawer = true;
            }
        },
        components:{
            DeviceTotal,
            UtilizationStatistics,
            NotReturnedStatistics,
            FloorDrawer,
            RoomScreen,
            SelectDepartment,
            UserCompanySelect,
            SelectRoomTree,
            UpdateAlarmRules,
            Table,
            Pagination,
            EditPipetteGun,
            SetPrincipal,
            PipetteGunDrawer,
            PipetteGunRackDrawer,
            ScreenResultStatistics,
            TimeoutSignature
        }
    }
</script>

<style lang="less" scoped>
    @import "./index.less";
    .w250 {
        width: 230px!important;
    }
    .w240 {
        width: 250px!important;
    }
    .mb-10 {
        margin-bottom: 10px;
    }
    .choose-bar {
        margin-top: 0 !important;
    }
</style>