<template>
    <el-tabs v-model="activeName" @tab-click="handleClick" v-loading="loading">
        <el-tab-pane :label="$t('labDevice.overTimeAlarm')" name="200"></el-tab-pane>
        <!-- <el-tab-pane label="未登记报警" name="201"></el-tab-pane> -->
        <el-tab-pane :label="$t('labDevice.myAlarm')" name="3"></el-tab-pane>

        <Table :data="alarmHistoryData" :tableData="tableData">
            <template v-slot="data">
                <div v-if="data.isButton">
                    <el-button 
                        v-if="data.data['updateDate']" 
                        :class="data.data.process ? '' : 'abnormal'" 
                        type="text"
                        @click="handleAlarmProcess(data.data)">
                        {{ data.data.process ? $t('hardware.editDisposeAlarm') : $t('hardware.addDisposeAlarm') }}
                    </el-button>
                </div>
                <div v-else>
                    <div>
                        {{ $t('labDevice.startTime') }}：{{ data.data[0] }}
                    </div>
                    <div>
                        {{ $t('labDevice.endTime') }}：{{ data.data[1] }}
                    </div>
                </div>
            </template>
        </Table>

        <div class="paging" v-if="total > 10">
            <pagination
                v-show="total > 10"
                :limit.sync="items.pageSize"
                :page.sync="items.pageNum"
                :total="total"
                @pagination="init"/>
        </div>
        
        <AlarmProcessing ref="AlarmProcessing" @handle="init"/>
    </el-tabs>
</template>

<script>
    import Table from "@c/Tables";
    import Pagination from "@c/Pagination/index";
    import AlarmProcessing from "@/views/device/components/AlarmProcessing";
    import { getAlarmHistoryDevice, getHistoryDeviceAlarm } from "@/api/device";
    import { items } from "@/utils/constant";
    export default {
        components: {
            Table,
            Pagination,
            AlarmProcessing
        },
        props: {
            id: {
                type: Number,
                default: null
            },
            no: {
                type: String,
                default: ""
            }
        },
        data() {
            const _this = this;
            return {
                loading: false,
                activeName: "200",
                tableData: [
                    {
                        label: "#",
                        type: "index",
                        width: "60"
                    },
                    {
                        label: _this.$t('labDevice.useName'),
                        prop: "endUser",
                        width: "100"
                    },
                    {
                        label: _this.$t('labDevice.outTime'),
                        prop: "takeOutTime",
                        minWidth: "110"
                    },
                    {
                        label: _this.$t('labDevice.alarmTime'),
                        props: ["createDate", "updateDate"],
                        isStrings: true,
                        isSlot: true,
                        minWidth: "150"
                    },
                    {
                        label: _this.$t('labDevice.returnTime'),
                        prop: "homingTime",
                        minWidth: "110"
                    },
                    {
                        label: _this.$t('hardware.beepAlarmTime'),
                        prop: "duration",
                    },
                    {
                        label: _this.$t('common.handle'),
                        isButton: true,
                        isButtonSlot: true,
                    },
                ],
                alarmHistoryData: [],
                items: {
                    deviceId: "",
                    type: "200",
                    deviceNo: "",
                    pageSize: items.PAGE_SIZE,
                    pageNum: items.PAGE_NUM,
                },
                total: 0
            }
        },
        mounted() {
            this.items.deviceId = this.id;
            this.items.deviceNo = this.no;
            this.init()
        },
        methods: {
            init() {
                this.loading = true;
                if(this.activeName === "3"){
                    getHistoryDeviceAlarm(this.items).then(res => {
                        this.loading = false
                        if(res.code === 1){
                            this.alarmHistoryData = res.items.list;
                            this.total = res.items.total
                        }
                    })
                }else{
                    getAlarmHistoryDevice(this.items).then(res => {
                        this.loading = false
                        if(res.code === 1){
                            this.alarmHistoryData = res.items.list;
                            this.total = res.items.total
                        }
                    })
                }
            },
            handleClick() {
                this.alarmHistoryData = [];
                const _this = this;
                if(this.activeName === "3"){
                    this.items.type = "";
                    this.tableData = [
                        {
                            label: "#",
                            type: "index",
                            width: 60
                        },
                        {
                            label: _this.$t('hardware.alarmType'),
                            prop: "sensorType",
                            field: "sensorType",
                            class: {
                                200: {
                                    name: "",
                                    text: _this.$t('labDevice.overTime')
                                },
                                201: {
                                    name: "",
                                    text: _this.$t('labDevice.unregisteredAlarm')
                                },
                                666: {
                                    name: "",
                                    text: _this.$t('labDevice.alarmUnBind')
                                }
                            }
                        },
                        {
                            label: _this.$t('labDevice.alarmStartTime'),
                            prop: "createDate"
                        },
                        {
                            label: _this.$t('common.receptionUse'),
                            prop: "userName"
                        },
                        {
                            label: _this.$t('common.receptionType'),
                            prop: "receptionList"
                        },
                        {
                            label: _this.$t('common.receptionTime'),
                            prop: "messageDate"
                        },
                    ]
                }else{
                    this.items.type = this.activeName;
                    if(this.activeName === "200"){
                        this.tableData = [
                            {
                                label: "#",
                                type: "index",
                                width: "60"
                            },
                            {
                                label: _this.$t('labDevice.useName'),
                                prop: this.activeName === "200" ? "endUser" : "handleUser"
                            },
                            {
                                label: _this.$t('labDevice.outTime'),
                                prop: "takeOutTime",
                                width: "158"
                            },
                            {
                                label: _this.$t('labDevice.alarmTime'),
                                prop: "createDate",
                                props: ["createDate", "updateDate"],
                                isStrings: true,
                                isSlot: true,
                                width: "230"
                            },
                            {
                                label: _this.$t('labDevice.returnTime'),
                                prop: "homingTime",
                                width: "158"
                            },
                            {
                                label: _this.$t('hardware.beepAlarmTime'),
                                prop: "duration",
                            },
                            {
                                label: _this.$t('common.handle'),
                                isButton: true,
                                isButtonSlot: true,
                            },
                        ]
                    }else{
                        // this.tableData = [
                        //     {
                        //         label: "序号",
                        //         type: "index",
                        //         width: "60"
                        //     },
                        //     // {
                        //     //     label: "使用人",
                        //     //     prop: this.activeName === "200" ? "endUser" : "handleUser"
                        //     // },
                        //     {
                        //         label: "取出时间",
                        //         prop: "takeOutTime",
                        //         width: "158"
                        //     },
                        //     {
                        //         label: "报警时间",
                        //         prop: "createDate",
                        //         props: ["createDate", "updateDate"],
                        //         isStrings: true,
                        //         isSlot: true,
                        //         width: "230"
                        //     },
                        //     {
                        //         label: "归还时间",
                        //         prop: "homingTime",
                        //         width: "158"
                        //     },
                        //     {
                        //         label: "持续时间",
                        //         prop: "duration",
                        //     },
                        //     {
                        //         label: "操作",
                        //         isButton: true,
                        //         isButtonSlot: true,
                        //     },
                        // ]
                    }
                }
                this.init()
            },
            handleAlarmProcess(row){
                this.$refs.AlarmProcessing.open(row, 15)
            },
        },
    }
</script>