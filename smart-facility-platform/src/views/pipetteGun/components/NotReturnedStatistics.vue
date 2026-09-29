<template>
    <div class="pipetteGun-statistics" v-loading="loading">
        <h3>
            {{ $t('labDevice.overTimeNotReturnStat') }}
            <el-button type="text" icon="el-icon-more" class="more" @click="$refs.overtimeNotReturnedData.open()"></el-button>
        </h3>

        <el-row class="query-date" type="flex" justify="space-between">
            <div></div>
            <div class="tab-1">
                <el-button 
                    v-for="item in dates" 
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
                <!-- <div class="num">
                    <span>已超时</span>
                    <el-input-number v-model="hour" :min="0.5" :precision="1" @change="handleHour"></el-input-number>
                    <span>小时</span>
                </div> -->
            </div>
        </el-row>

        <Histogram
            v-if="isData"
            :titleSubtext="$t('transport.unit') + '：' + $t('common.next')"
            :tooltipFormatter="$t('labDevice.overTime')"
            :queryType="1"
            :itemStyleColor="['#FF7070','#FF707050']"
            :backgroundStyle="'#F9F0F0'"
            :chartData="chartData" />

        <p v-else class="no-data" style="height: 250px">{{ $t('common.notMessage1') }}</p>

        <OvertimeNotReturnedData ref="overtimeNotReturnedData" />
    </div>
</template>

<script>
    import Histogram from "./Histogram";
    import OvertimeNotReturnedData from "./OvertimeNotReturnedData";
    import { getGunPipetteTimeoutStatistics } from "@/api/gun";
    import moment from "moment";
    export default {
        components: {
            Histogram,
            OvertimeNotReturnedData
        },
        data() {
            const _this = this;
            return {
                loading: false,
                isData: false,
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
                datetimer: "",
                startDate: "",
                endDate: "",
                dateType: 3,
                // hour: "",
                chartData: []
            }
        },
        mounted() {
            this.getStatistics()
        },
        methods: {
            getStatistics() {
                var data = {
                    beginTime: this.startDate,
                    endTime: this.endDate,
                    dateType: this.dateType,
                };
                this.loading = true;
                this.isData = false;
                getGunPipetteTimeoutStatistics(data).then(res => {
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
            // handleHour() {
            //     var num = this.hour.toString().split('.')[1];
            //     if(num < 5) {
            //         this.hour = this.hour.toString().split('.')[0] + '.5'
            //     }
            //     if(num > 5){
            //         this.$nextTick(() => {
            //             this.hour = Math.round(this.hour)
            //         })
            //     }
            //     this.getStatistics()
            // },
            handleDate(value) {
                this.dateType = value;
                this.datetimer = '';
                this.startDate = "";
                this.endDate = "";
                this.getStatistics()
            },
            handleDatetimer(){
                this.dateType = null;
                this.startDate = moment(this.datetimer[0]).format("YYYY-MM-DD HH:mm:ss"),
                this.endDate = moment(this.datetimer[1]).format("YYYY-MM-DD HH:mm:ss"),
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
    }
</style>