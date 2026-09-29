<template>
    <el-tabs v-model="activeName" @tab-click="handleClick" v-loading="loading">
        <el-tab-pane :label="$t('common.offLineAlarm')" name="1000"></el-tab-pane>
        <el-tab-pane :label="$t('labDevice.myAlarm')" name="3"></el-tab-pane>

        <Table :data="alarmHistoryData" :tableData="tableData" v-if="activeName === '1000'">
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

        <Table :data="alarmHistoryData" :tableData="tableData" v-if="activeName === '3'">
            <template v-slot="data">
                <div>
                    {{ sensorType(data.data) }}
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
    import { sensorType } from "@/utils/methods";
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
            }
        },
        data() {
            const _this =this;
            return {
                sensorType,
                loading: false,
                activeName: "1000",
                tableData: [
                    {
                        label: "#",
                        type: "index",
                        width: "60"
                    },
                    {
                        label: _this.$t('labDevice.alarmTime'),
                        props: ["createDate", "updateDate"],
                        isStrings: true,
                        isSlot: true,
                    },
                    {
                        label: _this.$t('hardware.beepAlarmTime'),
                        prop: "duration",
                    },
                    {
                        label: _this.$t('common.handle'),
                        isButton: true,
                        isButtonSlot: true,
                        width: "150"
                    },
                ],
                alarmHistoryData: [],
                items: {
                    deviceId: "",
                    type: "1000",
                    pageSize: items.PAGE_SIZE,
                    pageNum: items.PAGE_NUM,
                },
                total: 0
            }
        },
        mounted() {
            this.items.deviceId = this.id;
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
                const _this = this;
                this.alarmHistoryData = [];
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
                            isSlot: true,
                            // field: "sensorType",
                            // class: {
                            //     1000: {
                            //         text: "离线报警"
                            //     },
                            //     666: {
                            //         name: "",
                            //         text: "报警解除"
                            //     }
                            // }
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
                    this.tableData = [
                        {
                            label: "#",
                            type: "index",
                            width: "60"
                        },
                        {
                            label: _this.$t('labDevice.alarmStartTime'),
                            props: ["createDate", "updateDate"],
                            isStrings: true,
                            isSlot: true,
                        },
                        {
                            label: _this.$t('hardware.beepAlarmTime'),
                            prop: "duration",
                        },
                        {
                            label: _this.$t('common.handle'),
                            isButton: true,
                            isButtonSlot: true,
                            width: "150"
                        },
                    ]
                }
                this.init()
            },
            handleAlarmProcess(row){
                this.$refs.AlarmProcessing.open(row, 15)
            },
        },
    }
</script>