<template>
    <div class="charge-person-chart">
        <el-row type="flex" justify="space-between">
            <div class="rate-chart">
                <div class="title">{{ $t('labDevice.compositeUse2') }}：{{ $t('common.room') }}</div>
                <Echarts v-loading="loading" ref="rateChartRef" class="chart-canvas" id="roomRateChartEle" :option="option1"/>
                <div class="charts-data-empty" style="" v-show="isRoomRateChartEmpty">
                    <data-empty :height="'100%'" v-loading="loading"/>
                </div>
            </div>
            <div class="rate-chart">
                <div class="title">{{ $t('labDevice.labDeviceUseOrOrder') }}：{{ $t('common.room') }}</div>
                <Echarts v-loading="loading" :option="option2" class="chart-canvas" id="roomCountChartEle"/>
                <div class="charts-data-empty" style="" v-show="isRoomCountChartEmpty">
                    <data-empty :height="'100%'" v-loading="loading"/>
                </div>
            </div>
        </el-row>
    </div>
</template>
<script>
import Echarts from '@/components/Echarts'
import echarts from 'echarts'
import {queryUseRateV3RoomStatistics} from '@/api/labDevice'
import "v-charts/lib/style.css"
import DataEmpty from "@c/DataEmpty";

export default {
    components: {
        Echarts,
        DataEmpty

    },
    props: {
        queryParams: {
            type: Object,
            default: () => {
            }
        },
        thingsIdList: {
            type: Array,
            default: () => []
        }
    },
    watch: {},

    data() {
        const _this = this;
        return {
            isRoomRateChartEmpty: true,
            isRoomCountChartEmpty: true,
            option1: {
                color: ['#13ce66', '#e5e5e5', '#ff4949'],
                tooltip: {
                    trigger: 'item',
                    formatter: '{b} : {c}%'
                },
                calculable: true,
                grid: {
                    top: '10%',
                    left: 10,
                    right: '0%',
                    bottom: 0,
                    containLabel: true
                },
                xAxis: [
                    {
                        type: 'category',
                        data: [],
                        axisTick: {
                            show: false
                        },
                        axisLine: {
                            show: false
                        }
                    },
                ],
                yAxis: [
                    {
                        type: 'value',
                        name: _this.$t('labDevice.rate') + '：%',
                        axisTick: {
                            show: false
                        },
                        axisLine: {
                            show: false
                        }
                    }
                ],
                series: [
                    {
                        name: _this.$t('labDevice.rate'),
                        type: 'bar',
                        data: [],
                        barMaxWidth: 20,
                        label: {
                            show: true,
                            position: 'top',
                            formatter: '{c}%'
                        },
                        itemStyle: {
                            normal: {
                                color: function (params) {
                                    const colors = [
                                        '#3078F0',
                                    ]
                                    return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                        {offset: 0, color: colors[0]},
                                        {offset: 1, color: colors[0] + 50}
                                    ])
                                },
                            }
                        }
                    }
                ]
            },
            option2: {
                color: ['#13ce66', '#e5e5e5', '#ff4949'],
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow',
                        shadowStyle: {
                            color: 'rgba(150,150,150,0.05)'
                        }
                    }
                },
                calculable: true,
                grid: {
                    top: '10%',
                    left: 15,
                    right: '0%',
                    bottom: 0,
                    containLabel: true
                },
                xAxis: [
                    {
                        type: 'category',
                        data: [],
                        axisTick: {
                            show: false
                        },
                        axisLine: {
                            show: false
                        }
                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        name: _this.$t('transport.unit') + '：' + _this.$t('labDevice.degree'),
                        axisTick: {
                            show: false
                        },
                        axisLine: {
                            show: false
                        }
                    }
                ],

                series: [
                    {
                        name: _this.$t('labDevice.useNum'),
                        type: 'bar',
                        data: [],
                        barMaxWidth: 20,
                        label: {
                            show: true,
                            position: 'top'
                        },
                        itemStyle: {
                            normal: {
                                color: function (params) {
                                    const colors = [
                                        '#3078F0',
                                    ]
                                    return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                        {offset: 0, color: colors[0]},
                                        {offset: 1, color: colors[0] + 50}
                                    ])
                                },
                            }
                        },
                        barGap: '20%'
                    },
                    {
                        name: _this.$t('labDevice.orderNum'),
                        type: 'bar',
                        data: [],
                        barMaxWidth: 20,
                        label: {
                            show: true,
                            position: 'top'
                        },
                        itemStyle: {
                            normal: {
                                color: function (params) {
                                    const colors = [
                                        '#FEAB1A',
                                    ]
                                    return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                        {offset: 0, color: colors[0]},
                                        {offset: 1, color: colors[0] + 50}
                                    ])
                                },
                            }
                        },
                        barGap: '20%'
                    }
                ]
            },
            rateChart: null,
            countChart: null,
            rateChartEle: null,
            countChartEle: null,
            loading: false
        }
    },
    methods: {
        async queryChartData() {
            let params = JSON.parse(JSON.stringify(this.queryParams))
            delete params.pageSize
            delete params.pageNum
            this.loading = true
            await queryUseRateV3RoomStatistics(params).then(res => {
                this.loading = false;
                // 使用率图表 x轴数据、series数据
                let option1XAxisData = [], option1SeriesData = [], option2SeriesData0 = [], option2SeriesData1 = []
                if (res.code && res.items.length) {
                    res.items.forEach((item, index) => {
                        if (index <= 12) {
                            option1XAxisData.push(item.name)
                            option1SeriesData.push(this.$NP.round(this.$NP.times(item.useRate || 0, 100), 2))
                            option2SeriesData0.push(item.frequency || 0)
                            option2SeriesData1.push(item.reservation || 0)
                        }
                    })
                }
                this.isRoomRateChartEmpty = option1XAxisData.length === 0
                this.isRoomCountChartEmpty = option1XAxisData.length === 0
                // 第一个图表的数据
                this.option1.xAxis[0].data = option1XAxisData
                this.option1.series[0].data = option1SeriesData
                // 第二个图表的数据
                this.option2.xAxis[0].data = option1XAxisData
                this.option2.series[0].data = option2SeriesData0
                this.option2.series[1].data = option2SeriesData1
                this.initEcharts()
            })
        },
        initEcharts() {
            if (!this.rateChart) {
                this.rateChart = echarts.init(this.rateChartEle);
            }
            if (!this.countChart) {
                this.countChart = echarts.init(this.countChartEle);
            }
            this.rateChart.setOption(this.option1);
            this.countChart.setOption(this.option2);
        },
        resize() {
            this.rateChart.resize();
            this.countChart.resize();
        },
    },
    mounted() {
        this.rateChartEle = document.getElementById('roomRateChartEle')
        this.countChartEle = document.getElementById('roomCountChartEle')
        this.queryChartData()
        this.$nextTick(() => {
            window.addEventListener("resize", this.resize);
        });
    },
    beforeDestroy() {
        if (this.rateChart) {
            this.rateChart.dispose();
            this.rateChart = null;
            this.rateChartEle = null
        }
        if (this.countChart) {
            this.countChart.dispose();
            this.countChart = null;
            this.countChartEle = null
        }
        window.removeEventListener("resize", this.resize);
    }
}
</script>
<style lang="less" scoped>
.charge-person-chart {
    > .equipmentStatus {
        height: 100%;
    }

    .rate-chart {
        display: inline-block;
        width: 49%;
        position: relative;

        .chart-canvas {
            height: 315px;
        }

        .charts-data-empty {
            position: absolute;
            top: 42px;
            left: 0;
            bottom: 0;
            right: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: rgba(255, 255, 255, 1);
            color: #888;
            font-size: 0.7291666666666666vw;
        }
    }
}

.lineEcharts {
    height: 300px;
}

.title {
    font-size: 16px;
    font-weight: bold;
    color: #333333;
    margin-right: 40px;
    margin-bottom: 20px;

    .infoIcon {
        position: relative;
        top: 2px;
    }
}
</style>
