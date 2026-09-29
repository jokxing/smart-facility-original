<template>
    <div class="pipetteGun-statistics" v-loading="loading">
        <h3>
            {{ $t('labDevice.gunUseNum') }}
<!--            <div class="period-type">-->
<!--                使用率算法设置&nbsp;&nbsp;&nbsp;-->
<!--                <el-button -->
<!--                    v-for="item in PERIODTYPES"-->
<!--                    :key="item.value"-->
<!--                    :type="periodType === item.value ? 'primary' : ''"-->
<!--                    @click="handlePeriodType(item.value)">-->
<!--                    {{ item.label }}-->
<!--                </el-button>-->
<!--            </div>-->
        </h3>
        <el-row type="flex" justify="space-between">
            <div class="tab-2">
                <div
                    v-for="item in rankingType"
                    :key="item.value"
                    :class="{active: queryType === item.value}"
                    @click="handleRankingType(item)">
                    {{ item.label }}
                </div>
            </div>
            <div class="tab-1">
                <el-button
                    v-for="item in dates"
                    :key="item.value"
                    :type="active === item.value ? 'primary' : ''"
                    @click="handleDate(item.value)">
                    {{ item.label }}
                </el-button>
                <el-date-picker
                    class="w200"
                    v-model="datetimer"
                    type="datetimerange"
                    :range-separator="$t('common.most')"
                    :start-placeholder="$t('common.startDate')"
                    :end-placeholder="$t('common.endDate')"
                    @change="handleDatetimer">
                </el-date-picker>
            </div>
        </el-row>

        <Histogram
            v-if="isData"
            :titleSubtext="titleSubtext"
            :tooltipFormatter="tooltipFormatter"
            :queryType="queryType"
            :chartData="chartData" />

        <p v-else class="no-data" style="height: 250px">{{ $t('common.notMessage1') }}</p>

        <TimePeriodSelection ref="timePeriodSelection" @handle="handlePeriodTime" />
    </div>
</template>

<script>
    import Histogram from "./Histogram";
    import TimePeriodSelection from "./TimePeriodSelection";
    import { getStartAndEndTime } from "@/utils/methods.js";
    import { PERIODTYPES } from "@/utils/constant";
    import { postGunPipetteUseStatistics } from "@/api/gun";
    import moment from "moment";
    export default {
        components: {
            Histogram,
            TimePeriodSelection
        },
        data() {
            const _this = this;
            return {
                loading: false,
                rankingType: [
                    {
                        value: 0,
                        label: _this.$t('labDevice.useRatio'),
                        unit: "%"
                    },
                    {
                        value: 1,
                        label: _this.$t('labDevice.degree'),
                        unit: _this.$t('common.next')
                    },
                    {
                        value: 3,
                        label: _this.$t('hardware.duration'),
                        unit: _this.$t('labDevice.host')
                    },
                ],
                queryType: 0,
                dates: [
                    {
                        value: 1,
                        label: _this.$t('common.day')
                    },
                    {
                        value: 2,
                        label: _this.$t('common.week')
                    },
                    {
                        value: 3,
                        label: _this.$t('common.month')
                    },
                ],
                active: 3,
                datetimer: "",
                startDate: "",
                endDate: "",
                isData: false,
                PERIODTYPES,
                periodType: 1,
                periodBeginTime: "",
                periodEndTime: "",
                tooltipFormatter: _this.$t('labDevice.useRatio'),
                titleSubtext: _this.$t('transport.unit')+ "：%",
                chartData: []
            }
        },
        mounted() {
            this.getStatistics()
        },
        methods: {
            getStatistics() {
                var data = {
                    queryType: this.queryType,
                    statisticsCommonParam: {
                        periodType: this.periodType,
                        beginTime: this.startDate,
                        endTime: this.endDate,
                        dateType: this.active,
                        periodBeginTime: this.periodBeginTime,
                        periodEndTime: this.periodEndTime
                    }
                }
                this.loading = true;
                this.isData = false;
                postGunPipetteUseStatistics(data).then(res => {
                    this.loading = false;
                    if(res.code === 1){
                        this.chartData = res.items;
                        if(res.items.length > 0){
                            this.isData = true;
                        }else{
                            this.isData = false;
                        }
                    }
                })
            },
            // 选择时间类型
            handleRankingType(item){
                this.queryType = item.value;
                // this.tooltipFormatter = '{b}<br/>' + item.label + '： {a}' + item.unit;
                this.tooltipFormatter = item.label;
                this.titleSubtext = this.$t('transport.unit') + "：" + item.unit;
                this.getStatistics()
            },
            // 使用率算法设置
            handlePeriodType(value){
                if(value === 0){
                    var time = [this.periodBeginTime,this.periodEndTime]
                    this.$refs.timePeriodSelection.open(time)
                }else{
                    this.periodType = value;
                    this.getStatistics()
                }
            },
            // 使用率算法设置-时段
            handlePeriodTime(data) {
                this.periodType = data.periodType;
                this.periodBeginTime = data.startTime;
                this.periodEndTime = data.endTime;
                this.getStatistics()
            },
            // 选择时间
            handleDate(value) {
                this.active = value;
                this.datetimer = '';

                this.startDate = "";
                this.endDate = "";
                this.getStatistics()
            },
            // 时间格式化
            handleDatetimer(){
                this.active = null;
                this.startDate = moment(this.datetimer[0]).format("YYYY-MM-DD HH:mm:ss");
                this.endDate = moment(this.datetimer[1]).format("YYYY-MM-DD HH:mm:ss");
                this.getStatistics()
            }
        },
    }
</script>

<style lang="less" scoped>
    .pipetteGun-statistics{
        .no-data{
            text-align: center;
            padding: 80px;
        }
        .period-type{
            font-size: 14px;
            font-weight: initial;
            .el-button{
                width: 60px;
                height: 30px;
                padding: 0;
            }
        }
    }
    .w200 {
        width: 200px !important;
    }
</style>