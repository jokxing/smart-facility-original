<template>
    <div>
        <el-tabs v-model="activeName" @tab-click="handleTabClick" v-loading="loading">
            <el-tab-pane
                v-for="item in tabsList"
                :label="item.label"
                :name="item.value"
                :key="item.value">
                <div v-if="activeName != '3' && activeName != '6'">
                    <Table @sortChange="sortChange" :tableData="item.tableData" :data="item.list">
                        <template v-slot="data">
                            <div v-if=" activeName == 4 && data.prop == 'bindStatus'">
                                {{ data.data.bindStatus != 1 ? $t('hardware.unbinded') : $t('hardware.binding')}}
                            </div>
                        </template>
                        <el-table-column :label="$t('common.handle')" v-if="activeName === '1'">
                            <template slot-scope="scope" v-if="roleId != 5 || (roleId == 5 && scope.row.userId == userId)">
                                <el-button type="text" :disabled="scope.row.status == 2 || scope.row.status == 3" @click="handleChangeAppointment(scope.row)">{{ $t('labDevice.change') }}</el-button>
                                <el-button type="text" :disabled="scope.row.status == 2 || scope.row.status == 3" @click="handleCancelAppointment(scope.row)">{{ $t('common.cancel') }}</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column :label="$t('common.handle')" v-if="activeName === '2'" min-width="180">
                            <template slot-scope="scope">
                                <el-button type="text" @click="$refs.nextMintenanceTime.open(scope.row)">{{ $t('labDevice.nextMaintenanceDate') }}</el-button>
                                <el-button type="text" v-if="scope.row.completeFlag == 0" @click="handleMaintenceConfirm(scope.row)">{{ $t('labDevice.inspectConfirm') }}</el-button>
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
        <HistoryAlarmRecord :no="no" v-if="activeName === '6'" :type="type" :id="id" />

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
        getMaintenanceComplete, getMonitorIndicatorSensorBindInfo
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
            no: {
                type: String,
                default: null
            }
        },
        data() {
            const _this = this;
            return {
                // 用户层级
                roleId: JSON.parse(localStorage.getItem('USERINFO')).roleId,
                userId: JSON.parse(localStorage.getItem('USERINFO')).id,
                loading: false,
                activeName: "1",
                tabsList: [
                    {
                        label: _this.$t("labDevice.orderUseLog"),
                        value: "1",
                        tableData: [
                            {
                                label: "#",
                                type: "index",
                                width: "60"
                            },
                            {
                                label: _this.$t("labDevice.useName"),
                                prop: "userName",
                                width: "80"
                            },
                            {
                                label: _this.$t("labDevice.telNo"),
                                prop: "tel",
                            },
                            {
                                label: _this.$t("labDevice.labDeviceName"),
                                prop: "instrumentName",
                            },
                            {
                                label: _this.$t("labDevice.labDeviceNo"),
                                prop: "instrumentNo",
                            },
                            {
                                label: _this.$t("labDevice.applyTime"),
                                prop: "updateDate",
                                width: "160"
                            },
                            {
                                label: _this.$t("labDevice.startTime"),
                                prop: "timeFrom",
                                width: "160"
                            },
                            {
                                label: _this.$t("labDevice.endTime"),
                                prop: "timeTo",
                                width: "160"
                            },
                            {
                                label: _this.$t("hardware.status"),
                                prop: "status",
                                field: "status",
                                class: {
                                    0: {
                                        text: _this.$t("labDevice.notStarted")
                                    },
                                    1: {
                                        text: _this.$t("labDevice.inUse")
                                    },
                                    2: {
                                        text: _this.$t("labDevice.finished")
                                    },
                                    3: {
                                        text: _this.$t("labDevice.isCancel")
                                    }
                                }
                            },
                            {
                                label: _this.$t("common.handle"),
                                isSlotColumn: true
                            }
                        ],
                        list: []
                    },
                    {
                        label: _this.$t("labDevice.maintenanceRecord"),
                        value: "2",
                        tableData: [
                            {
                                label: "#",
                                type: "index",
                                width: "60"
                            },
                            {
                                label: _this.$t("common.createName"),
                                prop: "userName",
                                width: "80"
                            },
                            {
                                label: _this.$t("labDevice.telNo"),
                                prop: "tel",
                            },
                            {
                                label: _this.$t("labDevice.labDeviceName"),
                                prop: "instrumentName",
                            },
                            {
                                label: _this.$t("labDevice.labDeviceNo"),
                                prop: "instrumentNo",
                            },
                            {
                                label: _this.$t("labDevice.applyTime"),
                                prop: "createDate",
                                width: "160"
                            },
                            {
                                label: _this.$t("labDevice.endTime"),
                                prop: "completeDate",
                                width: "160"
                            },
                            {
                                label: _this.$t("labDevice.nextMaintenanceDate"),
                                prop: "nextMaintenanceDate",
                                width: "160"
                            },
                            {
                                label: _this.$t("labDevice.remark"),
                                prop: "remark",
                            },
                            {
                                label: _this.$t("hardware.status"),
                                prop: "completeFlag",
                                field: "completeFlag",
                                class: {
                                    0: {
                                        text: _this.$t("labDevice.maintained")
                                    },
                                    1: {
                                        text: _this.$t("labDevice.maintainedFin")
                                    },
                                }
                            },
                            {
                                label: _this.$t("common.handle"),
                                isSlotColumn: true
                            }
                        ],
                        list: []
                    },
                    {
                        label: _this.$t("labDevice.informPersonnel"),
                        value: "3",
                    },
                    {
                        label: _this.$t("labDevice.bindDevice"),
                        value: "4",
                        tableData: [
                            {
                                label: "#",
                                type: "index",
                            },
                            {
                                label: _this.$t("hardware.devciceName"),
                                prop: "equipmentName",
                            },
                            {
                                label: _this.$t("hardware.devciceNo"),
                                prop: "equipmentNo",
                                sortable: true
                            },
                            {
                                label: _this.$t("hardware.sensorName1"),
                                prop: "sensorAlias",
                            },
                            {
                                label: _this.$t("hardware.monitorIndex"),
                                prop: "sensorName",
                                sortable: true
                            },
                            {
                                label: _this.$t("hardware.status"),
                                isSlot: true,
                                prop: "bindStatus",
                                sortable: true,
                                width: "80"
                            },
                            {
                                label: _this.$t("hardware.bindTime"),
                                prop: "bindDate",
                                width: "160"
                            },
                            {
                                label: _this.$t("hardware.bindUserName"),
                                prop: "bindUserName",
                            },
                            {
                                label: _this.$t("hardware.unbindTime"),
                                prop: "unBindDate",
                                width: "160"
                            },
                            {
                                label: _this.$t("hardware.unbindUserName"),
                                prop: "unBindUserName",
                            }
                        ],
                        list: []
                    },
                    {
                        label: _this.$t("labDevice.inOrOut"),
                        value: "5",
                        tableData: [
                            {
                                label: "#",
                                type: "index",
                                width: "60"
                            },
                            {
                                label: _this.$t("common.name"),
                                prop: "",
                            },
                            {
                                label: _this.$t("labDevice.model"),
                                prop: "",
                            },
                            {
                                label: _this.$t("labDevice.specification"),
                                prop: "",
                            },
                            {
                                label: _this.$t("labDevice.outTime"),
                                prop: "",
                            },
                            {
                                label: _this.$t("labDevice.returnTime"),
                                prop: "",
                            },
                            {
                                label: _this.$t("labDevice.lookVoid"),
                                prop: "",
                            },
                            {
                                label: _this.$t("labDevice.useBeforeNum"),
                                prop: "",
                            },
                            {
                                label: _this.$t("labDevice.useAfterNum"),
                                prop: "",
                            },
                            {
                                label: _this.$t("common.remark"),
                                prop: "",
                            },
                        ],
                        list: []
                    },
                    {
                        label: _this.$t("labDevice.historyLog"),
                        value: "6",
                    },
                ],
                pageNum: 1,
                pageSize: 10,
                total: 0,
                sortItems: {
                    no: "",
                    sensorName: "",
                    status: ""
                }
            }
        },
        mounted() {
            this.getList()
        },
        methods: {
            sortChange(e) {
                let key = e.prop;
                const val = e.order == "ascending" ? "asc" : "desc";
                if (e.prop == "equipmentNo") {
                    key = "no";
                }
                this.sortItems[key] = val;
                this.getList();
            },
            getList () {
                this.loading = true;
                if(this.activeName === '1'){
                    const data = {
                        instrumentId: this.id,
                        pageNum: this.pageNum,
                        pageSize: this.pageSize
                    };
                    getInstrumentReservationSchedulerList(data).then(res => {
                        this.handleList(res)
                    })
                }else if(this.activeName === '2'){
                    const data = {
                        instrumentId: this.id,
                        pageNum: this.pageNum,
                        pageSize: this.pageSize
                    };
                    postMaintenanceList(data).then(res => {
                        this.handleList(res)
                    })
                }else if(this.activeName === '4'){
                    const data = {
                        objId: this.id,
                        objType: this.type,
                        pageNum: this.pageNum,
                        pageSize: this.pageSize,
                        ...this.sortItems
                    }
                    getMonitorIndicatorSensorBindInfo(data).then(res => {
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
                    this.$message.error(this.$t('labDevice.notOrder'))
                }else{
                    this.$confirm(this.$t('labDevice.isCancelOrder'), this.$t('labDevice.isCancelOrder'), {
                        confirmButtonText: this.$t('common.confirm'),
                        cancelButtonText: this.$t('common.cancel'),
                        type: "warning",
                    }).then(() => {
                        getInstrumentReservationCancle({},row.id).then(res => {
                            this.handleMessage(res, this.$t('labDevice.cancelOrderSuccess'))
                        })
                    }).catch(() => {});
                }
            },
            // 核查确认
            handleMaintenceConfirm(row) {
                this.$confirm(this.$t('labDevice.maintaining'), this.$t('labDevice.inspectConfirm'), {
                    confirmButtonText: this.$t('common.confirm'),
                    cancelButtonText: this.$t('common.cancel'),
                    type: "warning",
                }).then(() => {
                    getMaintenanceComplete({ maintenanceId: row.id }).then(res => {
                        this.handleMessage(res, this.$t('labDevice.confirmSuccess'))
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