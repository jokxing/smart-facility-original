<template>
    <el-dialog
        :before-close="handleModalClose"
        :close-on-click-modal="false"
        :title="$t('system.ruleData')"
        :visible.sync="dialogVisible"
        append-to-body
        destroy-on-close
        width="45%"
        top="4vh"
        custom-class="permissionAssignment-dialog">
        <div v-loading="loading">
            <el-row>
                <el-button
                    v-for="item in types"
                    :key="item.value"
                    :class="{'is-active': items.dimension === item.value}"
                    @click="handleType(item)">
                    {{ item.name }}
                </el-button>
            </el-row>
            <el-row class="radio">
                <el-radio-group v-model="items.type" @change="handleRaioChange">
                    <el-radio :label="1">{{ $t('system.allLook') }}</el-radio>
                    <el-radio :label="2">{{ $t('system.depLook') }}</el-radio>
                    <el-radio :label="3">{{ $t('system.assign') }}{{ name }}</el-radio>
                </el-radio-group>
            </el-row>
            <el-row class="select-department" v-if="items.type === 2">
                {{ $t('common.department') }}{{ name }}{{ $t('system.list') }}
                <el-button type="text" @click="$refs.selectDepartmentList.open(departmentList,companyName,departmentIds)">选择部门></el-button>
            </el-row>
            <el-row class="select-department" v-if="items.type === 3">
                {{ $t('system.assign') }}{{ name }}{{ $t('system.list') }}
                <el-button type="text" @click="handleSelectList">{{ $t('system.change') }}{{ name }}></el-button>
            </el-row>
            <Table :tableData="tableData" :data="list"></Table>
            <div class="paging">
                <pagination
                    v-show="total > 10"
                    :limit.sync="items.pageSize"
                    :page.sync="items.pageNum"
                    :total="total"
                    @pagination="getList"/>
            </div>
            <el-row class="last">
                <span v-if="operationDate">{{ $t('system.operationDate') }}：{{ operationDate }}</span>
                <span v-if="operationUserName">{{ $t('system.operationUserName') }}：{{ operationUserName }}</span>
            </el-row>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button :disabled="loading" @click="handleModalClose">{{ $t('common.close') }}</el-button>
            <!-- <el-button type="primary" :loading="loading" @click="submitForm">确 定</el-button> -->
        </span>

        <SelectDepartmentList
            ref="selectDepartmentList"
            :type="items.type"
            :dimension="items.dimension"
            :userId="items.userId"
            @handle="getList" />

        <RoomSelectList
            ref="roomSelectList"
            v-if="showRoomSelect"
            :showRoomSelect.sync="showRoomSelect"
            :type="items.type"
            :dimension="items.dimension"
            :userId="items.userId"
            :assignedList="list"
            @handle="getList" />
        <EquipmentSelectList
            ref="equipmentSelectList"
            v-if="showEquipmentSelect"
            :showEquipmentSelect.sync="showEquipmentSelect"
            :type="items.type"
            :dimension="items.dimension"
            :userId="items.userId"
            @handle="getList" />
        <DeviceSelectList
            ref="deviceSelectList"
            v-if="showDeviceSelect"
            :showDeviceSelect.sync="showDeviceSelect"
            :type="items.type"
            :dimension="items.dimension"
            :userId="items.userId"
            @handle="getList" />
    </el-dialog>
</template>

<script>
    import Table from "@c/Tables";
    import Pagination from "@/components/Pagination/index";
    import SelectDepartmentList from "./SelectDepartmentList";
    import RoomSelectList from "./RoomSelectList";
    import EquipmentSelectList from "./EquipmentSelectList";
    import DeviceSelectList from "./DeviceSelectList";
    import { postDataAuthDistributeList, postDataAuthDistribute } from "@/api/dataAuth";
    export default {
        props: {
            departmentList: {
                type: Array,
                default: []
            },
            companyName: {
                type: String,
                default: ""
            }
        },
        components: {
            Table,
            Pagination,
            SelectDepartmentList,
            RoomSelectList,
            EquipmentSelectList,
            DeviceSelectList
        },
        data() {
            const _this = this;
            return {
                loading: false,
                dialogVisible: false,
                showRoomSelect: false,
                showEquipmentSelect: false,
                showDeviceSelect: false,
                types: [
                    {
                        name: _this.$t('system.room'),
                        value: 3,
                    },
                    {
                        name: _this.$t('system.labDevice'),
                        value: 2,
                    },
                    {
                        name: _this.$t('system.device'),
                        value: 1,
                    }
                ],
                name: _this.$t('common.room'),
                items: {
                    pageSize: 10,
                    pageNum: 1,
                    type: null,
                    dimension: 3,
                    userId: 0
                },
                tableData: [
                    {
                        label: "#",
                        type: "index"
                    },
                    {
                        label: _this.$t('room.roomName'),
                        prop: "thingsName"
                    },
                    {
                        label: _this.$t('room.roomNo'),
                        prop: "thingsNo"
                    },
                    {
                        label: _this.$t('common.owningDepartment'),
                        prop: "departmentName"
                    }
                ],
                list: [],
                total: 0,
                operationDate: "",
                operationUserName: "",
                departmentIds: []
            }
        },
        methods: {
            open(item) {
                this.dialogVisible = true;
                this.items.userId = item.id;
                this.getList()
            },
            getList() {
                this.loading = true;
                postDataAuthDistributeList(this.items).then(res => {
                    this.loading = false;
                    if(res.code === 1){
                        this.list = res.items.pageDataList ? res.items.pageDataList.list : [];
                        this.total = res.items.pageDataList ? res.items.pageDataList.total : 0;
                        this.operationDate = res.items.operationDate ? res.items.operationDate : '';
                        this.operationUserName = res.items.operationUserName ? res.items.operationUserName : '';
                        this.departmentIds = res.items.departmentIds ? res.items.departmentIds : [];
                        this.items.type = res.items.type ? res.items.type : this.items.type;
                        if(!this.items.type){
                            this.items.type = 1;
                            this.handleRaioChange()
                        }
                    }
                })
            },
            handleType(item){
                this.items.dimension = item.value;
                this.items.type = null;
                this.name = item.value === 3 ? this.$t('common.room') : item.value === 2 ? this.$t('common.equipment') : this.$t('hardware.hardware');
                this.tableData = [
                    {
                        label: "#",
                        type: "index"
                    },
                    {
                        label: item.value === 3 ? this.$t('room.roomName') : item.value === 2 ? this.$t('labDevice.labDeviceName') : this.$t('hardware.hardware') + this.$t('common.name'),
                        prop: "thingsName"
                    },
                    {
                        label: item.value === 3 ? this.$t('room.roomNo') : item.value === 2 ? this.$t('labDevice.labDeviceNo') : this.$t('hardware.hardware') + this.$t('common.no'),
                        prop: "thingsNo"
                    },
                    {
                        label: this.$t('common.owningDepartment'),
                        prop: "departmentName"
                    }
                ];
                this.getList()
            },
            handleRaioChange() {
                this.list = [];
                if(this.items.type === 1){
                    var data = {
                        dimension: this.items.dimension,
                        type: this.items.type,
                        thingsIdList: null,
                        userId: this.items.userId,
                    }
                    this.loading = true;
                    postDataAuthDistribute(data).then(res => {
                        if(res.code === 1){
                            this.$message.success(this.$t('system.allotSuccess'));
                            this.getList()
                        }else{
                            this.$message.error(res.message)
                        }
                    })
                }else{
                    this.getList()
                }
            },
            handleSelectList() {
                if(this.items.dimension === 3){
                    this.showRoomSelect = true;
                    setTimeout(() => {
                        this.$refs.roomSelectList.open()
                    },10)
                }else if (this.items.dimension === 2){
                    this.showEquipmentSelect = true;
                    setTimeout(() => {
                        this.$refs.equipmentSelectList.open()
                    },10)
                }else{
                    this.showDeviceSelect = true;
                    setTimeout(() => {
                        this.$refs.deviceSelectList.open();
                    },10)
                }
            },
            handleModalClose() {
                this.dialogVisible = false;
                this.list = [];
                this.items = {
                    pageSize: 10,
                    pageNum: 1,
                    type: null,
                    dimension: 3,
                    userId: 0
                }
            }
        },
    }
</script>

<style lang="less" scoped>
    @import "../../../style/variable.less";
    .permissionAssignment-dialog{
        .el-button{
            &.is-active{
                background: @subjectColor !important;
                color: @white !important;
            }
        }
        .radio{
            margin-top: 20px;
            margin-bottom: 10px;
        }
        .last{
            margin-top: 20px;
            span{
                margin-right: 40px;
            }
        }
        .select-department{
            margin-top: 24px;
            margin-bottom: 10px;
            line-height: 40px;
            font-size: 18px;
            color: #333;
            font-weight: bold;
            .el-button{
                float: right;
            }
        }
    }
</style>
