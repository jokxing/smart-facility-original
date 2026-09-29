<template>
    <div>
        <el-tabs v-model="activeName" @tab-click="handleTabClick" v-loading="loading">
            <el-tab-pane
                v-for="item in tabsList"
                :label="item.label"
                :name="item.value"
                :key="item.value">
                <div v-if="activeName != '3' && activeName != '6'">
                    <Table :tableData="item.tableData" :data="item.list">
                        <el-table-column label="操作" v-if="activeName === '1'">
                            <template slot-scope="scope" v-if="roleId != 5 || (roleId == 5 && scope.row.userId == userId)">
                                <el-button type="text" :disabled="scope.row.status == 2" @click="handleChangeAppointment(scope.row)">更改</el-button>
                                <el-button type="text" :disabled="scope.row.status == 2" @click="handleCancelAppointment(scope.row)">取消</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" v-if="activeName === '2'" width="180">
                            <template slot-scope="scope">
                                <el-button type="text" @click="$refs.nextMintenanceTime.open(scope.row)">下次维保时间</el-button>
                                <el-button type="text" v-if="scope.row.completeFlag == 0" @click="handleMaintenceConfirm(scope.row)">核查确认</el-button>
                            </template>
                        </el-table-column>
                    </Table>
                    <div class="paging">
                        <pagination
                            v-show="total > pageSize"
                            :limit.sync="pageSize"
                            :page.sync="pageNum"
                            :total="total"
                            @pagination="getList"/>
                    </div>
                </div>
            </el-tab-pane>
        </el-tabs>

        <PrincipalTables v-if="activeName === '3'" :objId="id" :objType="2" />
        <HistoryAlarmRecord v-if="activeName === '6'" :type="type" :id="id" />

        <NextMintenanceTime ref="nextMintenanceTime" @handle="getList" />
    </div>
</template>

<script>
    import Table from "@c/Tables";
    import Pagination from "@/components/Pagination/index";
    import NextMintenanceTime from "./NextMintenanceTime";
    import PrincipalTables from "@c/PrincipalTables";
    import HistoryAlarmRecord from "@/components/HistoryAlarmRecord/index.vue";
    import { 
        getInstrumentReservationSchedulerList, 
        postMaintenanceList, 
        getInstrumentReservationCancle,
        getMaintenanceComplete
    } from "@/api/labDevice";
    import { getMonitorIndicatorThingsList } from "@/api/monitorIndicator";
    export default {
        components: {
            Table,
            Pagination,
            NextMintenanceTime,
            PrincipalTables,
            HistoryAlarmRecord
        },
        props: {
            id: {
                type: Number,
                default: null
            },
            // 2设备，3房间
            type: {
                type: Number,
                default: null
            },
        },
        data() {
            return {
                // 用户层级
                roleId: JSON.parse(localStorage.getItem('USERINFO')).roleId,
                userId: JSON.parse(localStorage.getItem('USERINFO')).id,
                loading: false,
                activeName: "1",
                tabsList: [
                    {
                        label: "预约使用记录",
                        value: "1",
                        tableData: [
                            {
                                label: "序号",
                                type: "index",
                                width: "60"
                            },
                            {
                                label: "使用人",
                                prop: "userName",
                                width: "80"
                            },
                            {
                                label: "联系方式",
                                prop: "tel",
                            },
                            {
                                label: "设备名称",
                                prop: "instrumentName",
                            },
                            {
                                label: "设备编号",
                                prop: "instrumentNo",
                            },
                            {
                                label: "申请时间",
                                prop: "updateDate",
                                width: "160"
                            },
                            {
                                label: "开始时间",
                                prop: "timeFrom",
                                width: "160"
                            },
                            {
                                label: "结束时间",
                                prop: "timeTo",
                                width: "160"
                            },
                            {
                                label: "状态",
                                prop: "status",
                                field: "status",
                                class: {
                                    0: {
                                        text: "未开始"
                                    },
                                    1: {
                                        text: "使用中"
                                    },
                                    2: {
                                        text: "已结束"
                                    }
                                }
                            },
                            {
                                label: "操作",
                                isSlotColumn: true
                            }
                        ],
                        list: []
                    },
                    {
                        label: "维保记录",
                        value: "2",
                        tableData: [
                            {
                                label: "序号",
                                type: "index",
                                width: "60"
                            },
                            {
                                label: "创建人",
                                prop: "userName",
                                width: "80"
                            },
                            {
                                label: "联系方式",
                                prop: "tel",
                            },
                            {
                                label: "设备名称",
                                prop: "instrumentName",
                            },
                            {
                                label: "设备编号",
                                prop: "instrumentNo",
                            },
                            {
                                label: "申请时间",
                                prop: "createDate",
                                width: "160"
                            },
                            {
                                label: "结束时间",
                                prop: "completeDate",
                                width: "160"
                            },
                            {
                                label: "下次维保时间",
                                prop: "nextMaintenanceDate",
                                width: "160"
                            },
                            {
                                label: "故障描述",
                                prop: "remark",
                            },
                            {
                                label: "状态",
                                prop: "completeFlag",
                                field: "completeFlag",
                                class: {
                                    0: {
                                        text: "维护中"
                                    },
                                    1: {
                                        text: "维护完成"
                                    },
                                }
                            },
                            {
                                label: "操作",
                                isSlotColumn: true
                            }
                        ],
                        list: []
                    },
                    {
                        label: "通知人员",
                        value: "3",
                    },
                    {
                        label: "绑定的智能硬件",
                        value: "4",
                        tableData: [
                            {
                                label: "序号",
                                type: "index",
                            },
                            {
                                label: "智能硬件名称",
                                prop: "equipmentName",
                            },
                            {
                                label: "智能硬件编号",
                                prop: "equipmentNo",
                            }
                        ],
                        list: []
                    },
                    {
                        label: "进出管理",
                        value: "5",
                        tableData: [
                            {
                                label: "序号",
                                type: "index",
                                width: "60"
                            },
                            {
                                label: "名称",
                                prop: "",
                            },
                            {
                                label: "型号",
                                prop: "",
                            },
                            {
                                label: "规格",
                                prop: "",
                            },
                            {
                                label: "取出时间",
                                prop: "",
                            },
                            {
                                label: "归还时间",
                                prop: "",
                            },
                            {
                                label: "查看视频/图片",
                                prop: "",
                            },
                            {
                                label: "使用前存量",
                                prop: "",
                            },
                            {
                                label: "使用后存量",
                                prop: "",
                            },
                            {
                                label: "备注",
                                prop: "",
                            },
                        ],
                        list: []
                    },
                    {
                        label: "历史异常记录",
                        value: "6",
                    },
                ],
                pageNum: 1,
                pageSize: 10,
                total: 0
            }
        },
        mounted() {
            this.getList()
        },
        methods: {
            getList () {
                this.loading = true;
                if(this.activeName === '1'){
                    var data = {
                        instrumentId: this.id,
                        pageNum: this.pageNum,
                        pageSize: this.pageSize
                    };
                    getInstrumentReservationSchedulerList(data).then(res => {
                        this.handleList(res)
                    })
                }else if(this.activeName === '2'){
                    var data = {
                        instrumentId: this.id,
                        pageNum: this.pageNum,
                        pageSize: this.pageSize
                    };
                    postMaintenanceList(data).then(res => {
                        this.handleList(res)
                    })
                }else if(this.activeName === '4'){
                    var data = {
                        objId: this.id,
                        objType: this.type
                    }
                    getMonitorIndicatorThingsList(data).then(res => {
                        this.handleList(res)
                    })
                }else {
                    this.loading = false;
                }
            },
            handleList(res) {
                this.loading = false;
                if(res.code === 1){
                    for(var i = 0; i < this.tabsList.length; i++) {
                        if(this.tabsList[i].value === this.activeName){
                            this.tabsList[i].list = res.items.list;
                            this.total = res.items.total
                        }
                    }
                }
            },
            handleTabClick() {
                this.pageNum = 1;
                this.pageSize = 10;
                this.total = 0;
                this.getList()
            },
            // 更改预约
            handleChangeAppointment(row) {
                this.$emit('handle', this.activeName, row)
            },
            // 取消预约
            handleCancelAppointment(row){
                if(row.status == 1){
                    this.$message.error("使用中的设备无法取消预约")
                }else{
                    this.$confirm("是否取消该条预约记录", "取消预约", {
                        confirmButtonText: "确定",
                        cancelButtonText: "取消",
                        type: "warning",
                    }).then(() => {
                        getInstrumentReservationCancle({},row.id).then(res => {
                            this.handleMessage(res, "取消预约成功")
                        })
                    }).catch(() => {});
                }
            },
            // 核查确认
            handleMaintenceConfirm(row) {
                this.$confirm("确认该设备维护完成，现在恢复正常？", "核查确认", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning",
                }).then(() => {
                    getMaintenanceComplete({ maintenanceId: row.id }).then(res => {
                        this.handleMessage(res, "确认成功")
                    })
                }).catch(() => {});
            },
            handleMessage(res,msg){
                if(res.code){
                    if(res.code === 1){
                        this.loading = true;
                        this.$message.success(msg);
                        this.getList()
                    }else{
                        this.$message.error(res.message)
                    }
                }else{
                    this.$message.error(res.message)
                }
            }
        },
    }
</script>