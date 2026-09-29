<template>
    <div class="details-timeout-statistics">
        <el-descriptions :title="$t('labDevice.outTimeStat')"></el-descriptions>
        <div>
            <el-row type="flex" justify="space-between">
                <div></div>
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
            <el-row class="conter" type="flex" justify="space-between">
                <el-col :span="12">
                    <h4>
                        {{ $t('labDevice.outTimeNotReturnRank') }}
                        <div class="tab-2">
                            <div 
                                v-for="item in rankingType" 
                                :key="item.value"
                                :class="{active: queryType === item.value}"
                                @click="handleRankingType(item)">
                                {{ item.label }}
                            </div>
                        </div>
                    </h4>
                    <Histogram 
                        v-if="isData"
                        :chartData="chartData"
                        :titleSubtext="titleSubtext" 
                        :tooltipFormatter="tooltipFormatter"
                        :queryType="queryType" />
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
                <el-col :span="12" class="gun-timeout-frequency-result">
                    <h4>{{ $t('labDevice.outNotReturnTime') }}</h4>
                    <div class="top">
                        {{ $t('labDevice.outNotReturnNum') }}<span class="abnormal">&nbsp;{{ gunTimeoutFrequencyResult.count ? gunTimeoutFrequencyResult.count : 0 }}{{ $t('common.next') }}</span>，{{ $t('labDevice.sumTime') }}<span class="abnormal">&nbsp;{{ gunTimeoutFrequencyResult.time ? gunTimeoutFrequencyResult.time : 0 }}</span>
                    </div>
                    <div class="gun-card">
                        <div v-for="(item,index) in timeNums" :key="index">
                            <p>{{ item.label }}</p>
                            <h1>{{ item.num }}<span>{{ $t('common.next') }}</span></h1>
                            <div class="detail" @click="handleDetail(item.type)">{{ $t('labDevice.lookDetail') }}></div>
                        </div>
                    </div>
                </el-col>
            </el-row>
        </div>

        <TimeoutDetails ref="timeoutDetails" />
    </div>
</template>

<script>
    import Histogram from "./Histogram";
    import Pagination from "@c/Pagination/index";
    import TimePeriodSelection from "./TimePeriodSelection";
    import TimeoutDetails from "./TimeoutDetails";
    import { GUNTIME } from "@/utils/constant";
    import { postGunDetailsTimeoutStatistics } from "@/api/gun";
    import moment from "moment";
    export default {
        components: {
            Histogram,
            Pagination,
            TimePeriodSelection,
            TimeoutDetails
        },
        props: {
            no: {
                type: String,
                default: ""
            },
        },
        data() {
            const _this = this;
            return {
                loading: false,
                dates: GUNTIME,
                dateType: 3,
                datetimer: "",
                startDate: "",
                endDate: "",
                rankingType: [
                    {
                        value: 1,
                        label: _this.$t('labDevice.degree'),
                        unit: _this.$t('common.next')
                    },
                    {
                        value: 2,
                        label: _this.$t('hardware.duration'),
                        unit: "h"
                    },
                ],
                queryType: 1,
                items: {
                    pageSize: 10,
                    pageNum: 1
                },
                total: 0,
                timeNums:[
                    {
                        label: "< 1h",
                        num: 0,
                        type: 1
                    },
                    {
                        label: "1-12h",
                        num: 0,
                        type: 2
                    },
                    {
                        label: "12-24h",
                        num: 0,
                        type: 3
                    },
                    {
                        label: "> 24h",
                        num: 0,
                        type: 4
                    },
                ],
                tooltipFormatter: _this.$t('labDevice.degree'),
                titleSubtext:_this.$t('transport.unit')+ "：" + _this.$t('common.next'),
                isData: false,
                chartData: [],
                gunTimeoutFrequencyResult: {}
            }
        },
        mounted() {
            this.init()
        },
        methods: {
            init() {
                var obj = {
                    no: this.no,
                    pageNum: this.items.pageNum,
                    pageSize: this.items.pageSize,
                    queryType: this.queryType,
                    statisticsTimeCommon: {
                        beginTime: this.startDate,
                        endTime: this.endDate,
                        dateType: this.dateType
                    }
                }
                this.loading = true;
                this.isData = false;
                postGunDetailsTimeoutStatistics(obj).then(res => {
                    this.loading = false;
                    if(res.code === 1){
                        this.chartData = res.items.pageData.list;
                        this.total = res.items.pageData.total;

                        this.timeNums[0].num = res.items.gunTimeoutFrequencyResult.countHour;
                        this.timeNums[1].num = res.items.gunTimeoutFrequencyResult.countGTHour;
                        this.timeNums[2].num = res.items.gunTimeoutFrequencyResult.countGTHalfDay;
                        this.timeNums[3].num = res.items.gunTimeoutFrequencyResult.countGTDay;

                        this.gunTimeoutFrequencyResult = res.items.gunTimeoutFrequencyResult

                        if(this.chartData.length > 0){
                            this.isData = true
                        }
                    }
                })
            },
            // 选择时间类型
            handleRankingType(item){
                this.queryType = item.value;
                // this.tooltipFormatter = '{b}<br/>' + item.label + '： {c}' + item.unit;
                this.tooltipFormatter = item.label;
                this.titleSubtext = this.$t('transport.unit') + "：" + item.unit;
                this.init()
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
                this.startDate = moment(this.datetimer[0]).format("YYYY-MM-DD HH:mm:ss");
                this.endDate = moment(this.datetimer[1]).format("YYYY-MM-DD HH:mm:ss");
                this.init()
            },
            // 查看详情
            handleDetail(type){
                var common = {
                    beginTime: this.startDate,
                    endTime: this.endDate,
                    dateType: this.dateType
                }
                this.$refs.timeoutDetails.open(type,this.no,common)
            }
        },
    }
</script>

<style lang="less" scoped>
    .details-timeout-statistics{
        /deep/ .el-range-editor--medium.el-input__inner{
            margin-left: 10px;
        }
        .el-col{
            width: 49%;
        }
        .conter{
            margin-top: 20px;
            h4{
                .tab-2{
                    float: right;
                    font-weight: initial;
                    font-size: 14px;
                }
            }
        }
        .gun-timeout-frequency-result{
            .top{
                //width: 520px;
                height: 50px;
                line-height: 50px;
                background-color: #FFE9E9;
                border-radius: 8px;
                margin: 20px auto 0;
                color: #444;
                font-size: 16px;
                font-weight: bold;
                text-align: center;
            }
        }
        .gun-card{
            padding-top: 30px;
            & > div{
                width: 130px!important;
                .detail{
                    margin-top: 0!important;
                    font-size: 12px;
                }
            }
        }
        .no-data{
            padding-top: 50px;
            text-align: center;
        }
    }
</style>