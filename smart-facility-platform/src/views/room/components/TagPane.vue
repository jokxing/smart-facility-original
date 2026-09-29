<template>
    <div class="room-tag">
        <el-tabs v-model="activeName" @tab-click="handleTabClick" v-loading="loading">
            <el-tab-pane
                v-for="item in tabsList"
                :label="item.label"
                :name="item.value"
                :key="item.value">
                <div v-if="activeName != '3' && activeName != '4'">
                    <el-row class="query" v-if="activeName === '1'" justify="space-between" type="flex">
                        <el-input
                            v-model.trim="keyword"
                            class="input-with-select"
                            clearable
                            :placeholder="$t('room.inputNameOrNo')"
                            @keyup.enter.native="getList()">
                            <el-button
                                slot="append"
                                class="el-button-host"
                                icon="icon-search1"
                                @click="getList()">
                            </el-button>
                        </el-input>
                    </el-row>
                    <Table
                        @sortChange="sortChange"
                        :tableData="item.tableData" 
                        :data="item.list"
                        @handleShowReportEdit="handleShowReportEdit">
                        <template slot-scope="data">
                            <div v-if=" activeName == 2 && data.prop == 'bindStatus'">
                                {{ data.data.bindStatus != 1 ? $t('hardware.unbinded') : $t('hardware.binding')}}
                            </div>
                            <div v-if="activeName === '1'">
                                <span v-if="data.prop === 'level'">{{ data.data.level | levelFilter }}</span>
                                <div v-if="data.prop === 'operation'">
                                    <el-button type="text" @click="handleShowReportEdit(data.data)">{{ $t('common.edit') }}</el-button>
                                    <el-button type="text" @click="handleDelete(data.data)">{{ $t('common.delete') }}</el-button>
                                </div>
                            </div>
                        </template>
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

        <PrincipalTables v-if="activeName === '3'" :objId="id" :objType="3" />
        <HistoryAlarmRecord v-if="activeName === '4'" :type="type" :no="no" :id="id" />
    </div>
</template>

<script>
    import Table from "@c/Tables";
    import Pagination from "@/components/Pagination/index";
    import PrincipalTables from "@c/PrincipalTables";
    import HistoryAlarmRecord from "@/components/HistoryAlarmRecord/index.vue";
    import { getMonitorIndicatorThingsList } from "@/api/monitorIndicator";
    import { getRoomReportList, removeReportRoomReport } from "@/api/room";
    import {getMonitorIndicatorSensorBindInfo} from "@/api/labDevice";
    export default {
        components: {
            Table,
            Pagination,
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
            },
        },
        data() {
            const _this = this;
            return {
                loading: false,
                activeName: "1",
                tabsList: [
                    {
                        label: _this.$t('room.checkLog'),
                        value: "1",
                        tableData: [
                            {
                                label: "#",
                                type: "index",
                            },
                            {
                                label: _this.$t('room.reportName'),
                                prop: "name",
                                isButton: true,
                                click: "handleShowReportEdit",
                            },
                            {
                                label: _this.$t('common.no'),
                                prop: "reportNo",
                            },
                            {
                                label: _this.$t('room.checkUserName'),
                                prop: "checkUserName",
                            },
                            {
                                label: _this.$t('room.checkDate'),
                                prop: "checkDate",
                            },
                            {
                                label: _this.$t('room.reportClass'),
                                prop: "level",
                                isSlot: true
                            },
                            {
                                label: _this.$t('common.handle'),
                                prop: "operation",
                                isSlot: true,
                                width: "120"
                            },
                        ],
                        list: []
                    },
                    {
                        label: _this.$t('labDevice.bindDevice'),
                        value: "2",
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
                        label: _this.$t('labDevice.informPersonnel'),
                        value: "3",
                    },
                    {
                        label: _this.$t('labDevice.historyLog'),
                        value: "4",
                    },
                ],
                pageNum: 1,
                pageSize: 10,
                total: 0,
                keyword: "",
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
            getList() {
                if(this.activeName === "1"){
                    const data = {
                        keyword: this.keyword,
                        pageNum: this.pageNum,
                        pageSize: this.pageSize,
                        roomId: this.id
                    };
                    this.loading = true;
                    getRoomReportList(data).then(res => {
                        this.handleList(res)
                    })
                }else if(this.activeName === "2"){
                    const data = {
                        objId: this.id,
                        objType: this.type,
                        pageNum: this.pageNum,
                        pageSize: this.pageSize,
                        ...this.sortItems
                    };
                    this.loading = true;
                    getMonitorIndicatorSensorBindInfo(data).then(res => {
                        this.handleList(res)
                    })
                }else{
                    
                }
            },
            handleList(res) {
                this.loading = false;
                if(res.code === 1){
                    for(let i = 0; i < this.tabsList.length; i++) {
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
                if(this.activeName !== '4'){
                    this.getList()
                }
            },
            handleShowReportEdit(row) {
                this.$emit('handlePreviewReport',row)
            },
            handleDelete(row){
                this.$confirm(this.$t('room.deleteCheck'), this.$t('room.deleteCheckHint'), {
                    type: "warning",
                    confirmButtonText: this.$t('common.confirm'),
                    cancelButtonText: this.$t('common.cancel')
                }).then(() => {
                    removeReportRoomReport({id: row.id}).then(res => {
                        if (res.code) {
                            this.$message.success(this.$t('common.deleteSuccess'));
                            this.getList();
                        } else {
                            this.$message.error(res.message);
                        }
                    })
                }).catch(() => {
                    this.$message.info(this.$t('common.deleteCanceled'));
                })
            }
        },
    }
</script>

<style lang="less" scoped>
    .room-tag{
        .query{
            margin-bottom: 10px;
        }
    }
</style>