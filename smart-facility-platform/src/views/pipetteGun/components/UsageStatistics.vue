<template>
    <div class="usage-statistics" v-loading="loading">
        <el-descriptions :title="$t('labDevice.useStat')">
            <template slot="extra">
                <el-button class="icon-query-data" @click="$refs.gunPipetteHistory.open()">
                    &nbsp;{{ $t('labDevice.historyUseLog') }}
                </el-button>
            </template>
        </el-descriptions>
        <el-row type="flex" justify="space-between">
            <div>
                <el-button 
                    v-for="item in PERIODTYPES" 
                    :key="item.value"
                    :class="{ 'is-active': periodType === item.value }"
                    @click="handlePeriodType(item.value)">
                    {{ item.label }}
                </el-button>
            </div>
            <div>
                <el-button 
                    v-for="item in dates" 
                    :key="item.value" 
                    :class="{ 'is-active': dateType === item.value }"
                    @click="handleDate(item.value)">
                    {{ item.label }}
                </el-button>
                <el-date-picker
                    v-model="datetimer"
                    type="datetimerange"
                    :range-separator="$t('common.most')"
                    :start-placeholder="$t('common.startDate')"
                    :end-placeholder="$t('common.endDate')"
                    @change="handleDatetimer">
                </el-date-picker>
            </div>
        </el-row>
        <el-row class="conter">
            <el-col :span="12">
                <h4>{{ $t('labDevice.useRateRank') }}</h4>
                <Histogram 
                    v-if="isData"
                    :chartData="chartData"
                    :titleSubtext="$t('transport.unit')+'：%'" />
                <p v-if="!isData" class="no-data">{{ $t('common.notMessage1') }}</p>
                <div class="paging" v-if="total > 10">
                    <pagination
                        v-show="total > 10"
                        :limit.sync="items.pageSize"
                        :page.sync="items.pageNum"
                        :total="total"
                        @pagination="init"/>
                </div>
            </el-col>
            <el-col :span="12">
                <div class="gun-card blue">
                    <div v-for="(item,index) in timeNums" :key="index">
                        <p>{{ item.label }}</p>
                        <h1 :class="{ 'font26': (item.num && index === 2) }">{{ item.num }}<span>{{ item.unit }}</span></h1>
                    </div>
                </div>
            </el-col>
        </el-row>
        <TimePeriodSelection ref="timePeriodSelection" @handle="handlePeriodTime" />
        <GunPipetteHistory ref="gunPipetteHistory" :id="id" :no="no" />
    </div>
</template>

<script>
    import Histogram from "./Histogram";
    import TimePeriodSelection from "./TimePeriodSelection";
    import Pagination from "@c/Pagination/index";
    import GunPipetteHistory from "./GunPipetteHistory";
    import { PERIODTYPES,GUNTIME } from "@/utils/constant";
    import { postGunDetailsUsePersonStatistics } from "@/api/gun";
    import moment from "moment";
    export default {
        components: {
            Histogram,
            TimePeriodSelection,
            Pagination,
            GunPipetteHistory
        },
        props: {
            id: {
                type: Number,
                default: null
            },
            no: {
                type: String,
                default: ""
            },
        },
        data() {
            const _this = this;
            return {
                loading: false,
                PERIODTYPES,
                periodType: 1,
                dates: GUNTIME,
                dateType: 3,
                datetimer: "",
                startDate: "",
                endDate: "",
                timeNums:[
                    {
                        label: _this.$t('labDevice.rate'),
                        num: 0,
                        unit: "%"
                    },
                    {
                        label: _this.$t('labDevice.useNum'),
                        num: 0,
                        unit: _this.$t('common.next')
                    },
                    {
                        label: _this.$t('labDevice.runDurationHMS'),
                        num: 0,
                        unit: ""
                    },
                ],
                items: {
                    pageSize: 10,
                    pageNum: 1
                },
                total: 0,
                periodBeginTime: "",    
                periodEndTime: "",
                isData: false,
                chartData: [],
            }
        },
        mounted() {
            this.init()
        },
        methods: {
            init() {
                var obj = {
                    pageNum: this.items.pageNum,
                    pageSize: this.items.pageSize,
                    pipetteGunId: this.id,
                    statisticsCommonParam: {
                        periodType: this.periodType,
                        beginTime: this.startDate,
                        endTime: this.endDate,
                        dateType: this.dateType,
                        periodBeginTime: this.periodBeginTime,
                        periodEndTime: this.periodEndTime
                    }
                };
                this.isData = false;
                this.loading = true;
                postGunDetailsUsePersonStatistics(obj).then(res => {
                    this.loading = false;
                    if(res.code === 1){
                        if(res.items.pageData){
                            this.chartData = res.items.pageData.list;
                            this.total = res.items.pageData.total;
                            if(res.items.pageData.list.length > 0){
                                this.isData = true;
                            }
                        }
                        this.timeNums[2].num = res.items.useDuration ? res.items.useDuration : 0;
                        this.timeNums[1].num = res.items.useFrequency ? res.items.useFrequency : 0;
                        this.timeNums[0].num = res.items.useRatio ? res.items.useRatio : 0;
                    }
                })
            },
            handlePeriodType(value){
                if(value === 0){
                    var time = [this.periodBeginTime,this.periodEndTime]
                    this.$refs.timePeriodSelection.open(time);
                }else{
                    this.periodType = value;
                    this.init()
                }
            },
            handleDate(value){
                this.dateType = value;
                this.datetimer = '';

                this.startDate = "";
                this.endDate = "";

                this.init()
            },
            handleDatetimer() {
                this.dateType = null;
                if(this.datetimer.length > 0){
                    this.startDate = moment(this.datetimer[0]).format("YYYY-MM-DD HH:mm:ss");
                    this.endDate = moment(this.datetimer[1]).format("YYYY-MM-DD HH:mm:ss");
                }else{
                    this.startDate = "";
                    this.endDate = "";
                }
                this.init()
            },
            // 使用率算法设置-时段
            handlePeriodTime(data) {
                this.dateType = data.periodType;
                this.periodBeginTime = data.startTime;
                this.periodEndTime = data.endTime;
                this.init()
            },
        },
    }
</script>

<style lang="less" scoped>
    .usage-statistics{
        margin-bottom: 20px;
        /deep/ .el-range-editor--medium.el-input__inner{
            margin-left: 10px;
        }
        .tab-2{
            float: right;
        }
        .conter{
            margin-top: 20px;
            .el-col:last-child{
                padding: 20px 20px 0;
            }
        }
        .gun-card{
            padding-top: 30px;
            h1.font26{
                font-size: 26px;
            }
        }
        .no-data{
            padding-top: 50px;
            text-align: center;
        }
    }
</style>