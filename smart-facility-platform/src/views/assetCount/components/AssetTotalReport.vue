<template>
    <div class="session-small">
        <div class="head">
            <div class="title">{{ $t('labDevice.assetStat') }}</div>
            <el-button type="text" icon="el-icon-more" class="more" @click="$emit('handle', yearMonth)"></el-button>
        </div>
        <div class="session" v-loading="loading">
            <div class="query">
                <el-form :inline="true" :label-position="'left'" ref="form" label-width="70px">
                    <el-form-item :label="$t('common.selectMonth')">
                        <el-date-picker
                            v-model="yearMonth"
                            type="month"
                            :clearable="false"
                            :placeholder="$t('common.selectMonth')"
                            :picker-options="pickerOptions"
                            @change="handleMonth">
                        </el-date-picker>
                    </el-form-item>
                </el-form>
                <div>
                    <el-button 
                        v-for="item in tabs" 
                        :key="item.value"
                        :type="item.value === type ? 'primary' : ''"
                        @click="handleType(item.value)">
                        {{ item.text }}
                    </el-button>
                </div>
            </div>

            <ve-bar :data="dataCharts" :extend="extend" />
        </div>
    </div>
</template>

<script>
    import { getPropertyMoveStatistics } from "@/api/property";
    import VeBar from "v-charts/lib/bar.common";
    import echarts from 'echarts';
    import moment from "moment";
    export default {
        components: {
            VeBar
        },
        data() {
            const _this = this;
            return {
                loading: false,
                yearMonth: moment(new Date()).format("YYYY-MM"),
                pickerOptions: {
                    disabledDate: (time) => {
                        let a = new Date().getFullYear();
                        let b = new Date().getMonth();
                        return time.getMonth() > b || time.getFullYear() != a
                    }
                },
                tabs: [
                    {
                        text: _this.$t('labDevice.notMoveAsset'),
                        value: 1
                    },
                    {
                        text: _this.$t('labDevice.moveAsset'),
                        value: 2
                    },
                    {
                        text: _this.$t('labDevice.moveNum'),
                        value: 3
                    },
                ],
                type: 1,
                dataCharts: {},
                extend: {
                    legend: {
                    },
                    tooltip: {
                        trigger: 'item',
                        axisPointer: {
                            type: 'shadow'
                        },
                        formatter: '{b} {c} ' + _this.$t('common.stand')
                    },
                    grid: {
                        height: 160,
                        top: 0
                    },
                    xAxis: {
                        show: false,
                    },
                    yAxis: {
                        data: [_this.$t('route.unwatchlabdevice'),_this.$t('route.administration'),_this.$t('route.watchlabdevice')]
                    },
                    series: {
                        type: 'bar',
                        data: [],
                        barWidth: 20,
                        showBackground: true,
                        label: { 
                            show: true,
                            color: "#fff",
                            formatter: '{c} ' + _this.$t('common.stand')
                        },
                        itemStyle:{
                            normal: {
                                color: function (params) {
                                    var colorList = [
                                        ['#7388FD', '#5167E0'],
                                        ['#FFA010', '#FF8825'],
                                        ['#22C8FE', '#1396FA'],
                                    ];
                                    var index = params.dataIndex;
                                    if (params.dataIndex >= colorList.length) {
                                        index = params.dataIndex - colorList.length;
                                    }
                                    return new echarts.graphic.LinearGradient(1, 0, 0, 0,
                                        [
                                            {
                                                offset: 0,
                                                color: colorList[index][0]
                                            },
                                            {
                                                offset: 1,
                                                color: colorList[index][1]
                                            }
                                        ]
                                    );
                                }
                            },
                        }
                    }
                },
            }
        },
        mounted() {
            this.getList()
        },
        methods: {
            getList(){
                var data = {
                    yearMonth: this.yearMonth,
                    type: this.type
                }
                this.loading = true;
                getPropertyMoveStatistics(data).then(res => {
                    this.loading = false;
                    if(res.code === 1){
                        this.extend.series.data = [res.items.itDeviceNum, res.items.adminDeviceNum, res.items.labDeviceNum]
                    }
                })
            },
            handleMonth(val){
                this.yearMonth = moment(val).format("YYYY-MM");
                this.getList()
            },
            handleType(value) {
                if(value === 3){
                    this.extend.tooltip.formatter = "{b} {c} " + this.$t('common.next')
                    this.extend.series.label.formatter = "{c} " + this.$t('common.next')
                }else{
                    this.extend.tooltip.formatter = "{b} {c} " + this.$t('common.stand')
                    this.extend.series.label.formatter = "{c} " + this.$t('common.stand')
                }
                this.type = value;
                this.getList()
            }
        },
    }
</script>