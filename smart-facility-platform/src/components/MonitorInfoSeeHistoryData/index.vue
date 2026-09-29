<template>
    <el-dialog
        :before-close="handleClose"
        :close-on-click-modal="false"
        :title="$t('hardware.seeHistroy')"
        :visible.sync="dialogVisible"
        append-to-body
        custom-class="monitor-history"
        width="42%"
        top="4vh">
        <div v-loading="loading">
            <SubmitForm ref="SubmitForm" :formData="formData" :data="form" />
            <el-row justify="end" type="flex" style="margin-bottom: 10px">
                <el-button class="margin-small-right" type="text" @click="handleExportHistoryDevice">{{ $t("hardware.searchExportResult") }}</el-button>
                <el-button :loading="loading" type="primary" @click="handleGetHistoryQuery(1)">{{ $t("hardware.searchResult") }}</el-button>
            </el-row>

            <el-table :data="historyData">
                <el-table-column label="#" type="index" width="60"></el-table-column>
                <template v-if="options.length > 0">
                    <el-table-column v-for="item in options" :key="form.type === 1 ? item.objSensorId : item.id" :label="item.sensorAlias" :prop="'sensor_' + (form.type === 1 ? item.objSensorId : item.id)">
                        <template slot-scope="scope">
                            <div v-if="scope.row['sensor_' + (form.type === 1 ? item.objSensorId : item.id) + '_signalFlag']">
                                {{ $t('hardware.close') }}
                            </div>

                            <div :class="{'abnormal': scope.row['sensor_' + (form.type === 1 ? item.objSensorId : item.id) + '_over']}" v-else>
                                {{ scope.row['sensor_' + (form.type === 1 ? item.objSensorId : item.id)] }}
                            </div>
                        </template>
                    </el-table-column>
                </template>
                <el-table-column :label="$t('hardware.searchDate')" prop="time" :width="options.length ? '180' : ''">
                    <template v-slot="{row}">
                        {{ row.time | localToUtc }}
                    </template>
                </el-table-column>
            </el-table>

            <div class="paging">
                <pagination
                    v-show="total > form.pageSize"
                    :layout="'prev, pager, next, total'"
                    :limit.sync="form.pageSize"
                    :page-count="5"
                    :page.sync="form.pageNum"
                    :total="total"
                    @pagination="handleGetHistoryQuery"/>
            </div>
        </div>
    </el-dialog>
</template>

<script>
    import SubmitForm from "@c/SubmitForm"; 
    import Pagination from "@/components/Pagination";
    import { HISTORYTIMEINTERVAL } from "@/utils/constant";
    import { 
        postMonitorIndicatorHistory, 
        postmonitorIndicatorExportSingleThingsHistory 
    } from "@/api/monitorIndicator";
    export default {
        components: {
            SubmitForm,
            Pagination
        },
        props: {
            // 1硬件 2设备，3房间
            type: {
                type: Number,
                default: 2
            }
        },
        data() {
            const _this = this;
            return {
                dialogVisible: false,
                loading: false,
                options: [],
                form: {
                    endDate: "",
                    historyTimeInterval: 1,
                    objId: "",
                    objSensorIds: [],
                    startDate: "",
                    type: 0,
                    pageSize: 10,
                    pageNum: 1
                },
                total: 0,
                formData: [
                    {
                        label: _this.$t('hardware.searchCondition'),
                        prop: "objSensorIds",
                        type: "select",
                        isRequired: true,
                        multiple: true,
                        options: [],
                        optionObj: {
                            label: "sensorAlias",
                            value: "id"
                        },
                    },
                    {
                        label: _this.$t('hardware.dateScope'),
                        type: "datetimerange",
                        isRequired: true,
                        pickerOptions: {
                            disabledDate(time) {
                                if (_this.form.startDate) {
                                    const currentTime = new Date(_this.form.startDate);
                                    const threeMonths = 60 * 60 * 1000 * 24 * 90;
                                    if (currentTime) {
                                        return time.getTime() > currentTime.getTime() + threeMonths || time.getTime() < currentTime.getTime() - threeMonths;
                                    }
                                } else {
                                    return false
                                }
                            },
                            onPick({minDate, maxDate}) {
                                // 当第一时间选中才设置禁用
                                if (minDate && !maxDate) {
                                    _this.form.startDate = minDate;
                                }
                                if (maxDate) {
                                    _this.form.startDate = maxDate;
                                }
                            },
                            shortcuts: [{
                            text: _this.$t('common.recentlyWeek'),
                                onClick(picker) {
                                    const end = new Date();
                                    const start = new Date();
                                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                                    picker.$emit('pick', [start, end]);
                                }
                            }, {
                            text: _this.$t('common.recentlyMonth'),
                                onClick(picker) {
                                    const end = new Date();
                                    const start = new Date();
                                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                                    picker.$emit('pick', [start, end]);
                                }
                            }, {
                            text: _this.$t('common.recentlyThreeMonth'),
                                onClick(picker) {
                                    const end = new Date();
                                    const start = new Date();
                                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                                    picker.$emit('pick', [start, end]);
                                }
                            }]
                        },
                        value: ['startDate', 'endDate']
                    },
                    {
                        label: _this.$t('common.timeInternet'),
                        prop: "historyTimeInterval",
                        type: "select",
                        options: HISTORYTIMEINTERVAL,
                        optionObj: {
                            label: "name",
                            value: "id"
                        },
                    }
                ],
                historyData: []
            }
        },
        methods: {
            open(objId, type, sensors) {
                this.dialogVisible = true;
                // for(var i = 0; i < sensors.length; i++){
                //     if(sensors[i].inlay !== 3){
                //         this.formData[0].options.push(sensors[i])
                //     }
                // }
                this.formData[0].options = sensors;
                if(type === 1){
                    this.formData[0].optionObj.value = "objSensorId"
                }else{
                    this.formData[0].optionObj.value = "id"
                }
                this.form.objId = objId;
                this.form.type = type;
            },
            // 检索
            handleGetHistoryQuery(index) {
                if(this.form.objSensorIds.length <= 0){
                    return this.$message.error(this.$t("hardware.searchingCondition"))
                };
                if(!this.form.endDate){
                    return this.$message.error(this.$t("common.selectDateScope"))
                }
                if(index === 1){
                    this.form.pageNum = 1;
                    this.form.pageSize = 10
                }
                this.loading = true;
                postMonitorIndicatorHistory(this.form).then(res => {
                    this.loading = false;
                    if(res.code === 1){
                        this.options = [];
                        this.historyData = res.items.list[this.form.objId];
                        var options = this.formData[0].options;
                        for(var i = 0; i < options.length; i++){
                            for(var j = 0; j < this.form.objSensorIds.length; j++){
                                if((this.form.type === 1 ? options[i].objSensorId : options[i].id) === this.form.objSensorIds[j]){
                                    this.options.push(options[i])
                                }
                            }
                        }
                        // this.historyData = [];
                        // var list = res.items.list[this.form.objId];
                        // if(list){
                        //     var options = this.formData[0].options
                        //     for(var i = 0; i < list.length; i++){
                        //         list[i]['sensor'] = [];
                        //         for(var j = 0; j < this.form.objSensorIds.length; j++){
                        //             for(var k = 0; k < options.length; k++){
                        //                 if(options[k].objSensorId === this.form.objSensorIds[j]){
                        //                     list[i].sensor.push(
                        //                         {
                        //                             name: options[k].sensorAlias,
                        //                             value: list[i]['sensor_' + this.form.objSensorIds[j]]
                        //                         }
                        //                     )
                        //                 }
                        //             }
                        //         }
                        //     }
                        //     this.historyData = list;
                        // }
                        this.total = res.items.total
                    }
                })
            },
            // 导出检索结果
            handleExportHistoryDevice() {
                if(this.form.objSensorIds.length <= 0){
                    return this.$message.error(this.$t("hardware.searchingCondition"))
                };
                if(!this.form.endDate){
                    return this.$message.error(this.$t("common.selectDateScope"))
                }
                var data = {
                    beginTime: this.form.startDate,
                    endTime: this.form.endDate,
                    objIds: [this.form.objId],
                    objType: this.form.type,
                    sensorIds: this.form.objSensorIds,
                    timeInterval: this.form.historyTimeInterval
                }
                this.loading = true;
                postmonitorIndicatorExportSingleThingsHistory(data).then(res => {
                    this.loading = false;
                    if(res.code){
                        if(res.code === 1){
                            this.$confirm(this.$t("common.exportMessage2"), this.$t("common.exportSuccess"), {
                                confirmButtonText: this.$t("common.goTo"),
                                cancelButtonText: this.$t("common.cancel"),
                                type: "success"
                            }).then(() => {
                                this.dialogVisible = false;
                                this.$router.push("/sys/data/export");
                            }).catch(() => {

                            })
                        }else{
                            this.$message.error(res.message)
                        }
                    }else{
                        this.$message.error(res.message)
                    }
                })
            },
            handleClose() {
                this.dialogVisible = false;
                this.form.objSensorIds = [];
                this.form.pageNum = 1;
                this.form.pageSize = 10;
                this.form.startDate = "";
                this.form.endDate = "";
                this.historyData = [];
                this.total = 0;
                this.formData[0].options = [];
                this.$refs.SubmitForm.datetimer = "";
                this.options = []
            },
        }
    }
</script>

<style lang="less" scoped>
    /deep/ .monitor-history{
        .el-dialog__body{
            max-height: 810px;
            overflow-y: auto;
        }
    }
</style>
