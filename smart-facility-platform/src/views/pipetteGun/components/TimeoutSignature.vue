<template>
    <div class="timeout-signature">
        <el-row type="flex" justify="space-between">
            <h3 class="title-h3">{{ $t('labDevice.overTimeNotReturnStat') }}</h3>
            <div class="tab-1">
                <el-button 
                    v-for="item in GUNTIME" 
                    :key="item.value" 
                    :type="dateType === item.value ? 'primary' : ''"
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

        <el-row type="flex" justify="space-between" class="box">
            <div class="inner" v-loading="signatureLoading">
                <el-row type="flex" justify="space-between">
                    <h3>{{ $t('labDevice.useRate') }}</h3>
                    <div class="tab-1">
                        <el-button 
                            v-for="item in rankingType" 
                            :key="item.value" 
                            :type="queryType === item.value ? 'primary' : ''"
                            @click="handleRankingType(item)">
                            {{ item.label }}
                        </el-button>
                    </div>
                </el-row>
                <Histogram 
                    v-if="isData"
                    :chartData="chartData"
                    :titleSubtext="titleSubtext"
                    :queryType="queryType" />
                <p v-else class="no-data">{{ $t('common.notMessage1') }}</p>
                
                <div class="paging">
                    <pagination
                        v-show="total > 10"
                        :limit.sync="items.pageSize"
                        :page.sync="items.pageNum"
                        :total="total"
                        @pagination="handlePage"/>
                </div>
            </div>

            <div class="statistics inner" v-loading="frequencyLoading">
                <h3>{{ $t('labDevice.outNotReturnTime') }}</h3>
                <div class="top">
                    {{ $t('labDevice.outNotReturnNum') }}<span class="abnormal">&nbsp;{{ frequency.count ? frequency.count : 0 }}&nbsp;{{$t('common.next')}}</span>，{{ $t('labDevice.sumTime') }}<span class="abnormal">&nbsp;{{ frequency.time ? frequency.time : 0 }}</span>
                </div>
                <div class="gun-card">
                    <div v-for="item in timeNums" :key="item.type">
                        <p>{{ item.label }}</p>
                        <h1>{{ item.num }}<span>{{ $t('common.next') }}</span></h1>
                        <div class="detail" @click="$refs.timeoutFrequencyDetails.open(item.type,data)">{{ $t('labDevice.lookDetail') }}></div>
                    </div>
                </div>
            </div>
        </el-row>

        <TimeoutFrequencyDetails ref="timeoutFrequencyDetails" />
    </div>
</template>

<script>
    import Histogram from "./Histogram";
    import Pagination from "@/components/Pagination/index";
    import TimeoutFrequencyDetails from "./TimeoutFrequencyDetails";
    import { GUNTIME } from "@/utils/constant";
    import { postTimeoutFrequency, postTimeoutSignature } from "@/api/gun";
    import moment from "moment";
    export default {
        components: {
            Histogram,
            Pagination,
            TimeoutFrequencyDetails
        },
        data() {
            const _this = this;
            return {
                GUNTIME,
                isData: false,
                dateType: 3,
                datetimer: "",
                startDate: "",
                endDate: "",
                rankingType: [
                    {
                        value: 1,
                        label: _this.$t('labDevice.degree'),
                        unit: ""
                    },
                    {
                        value: 2,
                        label: _this.$t('hardware.duration'),
                        unit: "h"
                    },
                ],
                queryType: 1,
                frequencyLoading: false,
                signatureLoading: false,
                titleSubtext: _this.$t('transport.unit') + "：" + _this.$t('common.next'),
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
                items: {
                    pageNum: 1,
                    pageSize: 10,
                },
                total: 0,
                chartData: [],
                frequency: "",
                data: {},
                obj: ""
            }
        },
        mounted() {
            this.init()
        },
        methods: {
            init(data) {
                this.items = {
                    pageNum: 1,
                    pageSize: 10,
                };
                this.handleObj(data);
                this.data['gunFiltrate'] = this.obj.gunFiltrate;
                this.data['statisticsTimeCommon'] = this.obj.statisticsTimeCommon;
                this.getFrequency();
                this.getSignature()
            },
            handleObj(data){
                this.obj = {
                    pageNum: this.items.pageNum,
                    pageSize: this.items.pageSize,
                    queryType: this.queryType,
                    gunFiltrate: {
                        departmentId: data && data.departmentId ? data.departmentId : null,
                        gardenId: data && data.gardenId ? data.gardenId : null,
                        buildingId: data && data.buildingId ? data.buildingId : null,
                        floorId: data && data.floorId ? data.floorId : null,
                        keyword: data && data.keyword,
                        roomIds: data && data.roomIds ? data.roomIds : [],
                        signatureId: data && data.signatureId ? data.signatureId : null,
                        status: data && (typeof(data.status) !== 'undefined' || typeof(data.status) !== 'null') ? data.status : null
                    },
                    statisticsTimeCommon: {
                        beginTime: this.startDate,
                        endTime: this.endDate,
                        dateType: this.dateType,
                    }
                }
            },
            getFrequency() {
                this.frequencyLoading = true;
                postTimeoutFrequency(this.obj).then(res => {
                    this.frequencyLoading = false;
                    if(res.code === 1){
                        this.frequency = res.items;
                        this.timeNums[0].num = this.frequency.countHour;
                        this.timeNums[1].num = this.frequency.countGTHour;
                        this.timeNums[2].num = this.frequency.countGTHalfDay;
                        this.timeNums[3].num = this.frequency.countGTDay
                    }
                })
            },
            getSignature() {
                this.isData = false;
                this.signatureLoading = true;
                postTimeoutSignature(this.obj).then(res => {
                    this.signatureLoading = false;
                    if(res.code === 1){
                        this.chartData = res.items.list;
                        this.total = res.items.total;

                        if(res.items.list.length > 0){
                            this.isData = true;
                        }
                    }
                })
            },
            handlePage() {
                this.obj.pageNum = this.items.pageNum;
                this.obj.pageSize = this.items.pageSize;
                this.getSignature()
            },
            // 选择时间
            handleDate(value) {
                this.dateType = value;
                this.datetimer = '';

                this.startDate = "";
                this.endDate = "";

                this.items = {
                    pageNum: 1,
                    pageSize: 10,
                };
                this.init()
            },
            // 时间格式化
            handleDatetimer(){
                this.dateType = null;
                this.startDate = moment(this.datetimer[0]).format("YYYY-MM-DD HH:mm:ss");
                this.endDate = moment(this.datetimer[1]).format("YYYY-MM-DD HH:mm:ss");
                this.items = {
                    pageNum: 1,
                    pageSize: 10,
                };
                this.init()
            },
            // 类型
            handleRankingType(item) {
                this.queryType = item.value;
                this.tooltipFormatter = '{b}<br/>' + item.label + '： {c}' + item.unit;
                this.titleSubtext = this.$t('transport.unit') + "：" + item.unit;
                
                this.items = {
                    pageNum: 1,
                    pageSize: 10,
                };

                var obj = this.handleObj()
                this.getSignature(obj)
            }
        },
    }
</script>

<style lang="less" scoped>
    .timeout-signature{
        margin-top: 40px;
        .box{
            margin-top: 20px;
            h3{
                font-size: 16px;
                margin-bottom: 20px;
            }
            .inner{
                width: 49%;
            }
            .statistics{
                .top{
                    height: 50px;
                    line-height: 50px;
                    background-color: #FFE9E9;
                    border-radius: 8px;
                    margin: 0 auto 40px;
                    color: #444;
                    font-size: 18px;
                    font-weight: bold;
                    text-align: center;
                }
            }
        }
        .no-data{
            text-align: center;
            padding: 80px;
        }
    }
</style>