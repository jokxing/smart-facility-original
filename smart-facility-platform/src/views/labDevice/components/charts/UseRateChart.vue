<template>
    <div class="use-rate-chart">
        <el-row type="flex" justify="space-between">
            <el-col :span="16" class="mr16">
                <!-- 设备使用率统计 -->
                <div class="equipmentStatus session h500">
                    <el-row type="flex" justify="space-between">
                        <div class="rate-chart">
                            <div class="title">{{ $t('statistics.labDeviceUserRateStat') }}</div>
                            <div class="charts-height">
                                <ve-histogram
                                    v-if="useRateCharts.rows.length"
                                    :extend="useRateOptions"
                                    :colors="['#3F51B5']"
                                    :settings="setting"
                                    :height="'100%'"
                                    v-loading="useRateCharts.loading"
                                    :data="useRateCharts"
                                />
                                <data-empty :height="'100%'" v-loading="useRateCharts.loading" v-else/>
                            </div>
                        </div>
                        <div class="rate-chart ">
                            <div class="title">{{ $t('labDevice.labDeviceUseOrOrder') }}</div>
                            <div class="charts-height">
                                <ve-histogram
                                    v-if="useNumCharts.rows.length"
                                    :settings="setting2"
                                    v-loading="useNumCharts.loading"
                                    :data="useNumCharts"
                                    :extend="useOptions"
                                    :height="'100%'"
                                    :afterConfig="useNumChartsAfterConfig"
                                />
                                <data-empty :height="'100%'" v-loading="useNumCharts.loading" v-else/>
                            </div>

                        </div>
                    </el-row>

                    <div class="total" v-if="useNumCharts.total >= 1">
                        <el-button
                            :disabled="pageNum === 1"
                            class="el-icon-arrow-left"
                            @click="handlePageNumMinus(1)"
                        ></el-button>
                        <span class="total-num"
                        >{{ pageNum }}/{{
                                Math.ceil(useRateCharts.total / pageSize)
                            }}</span
                        >
                        <el-button
                            :disabled="pageNum === Math.ceil(useRateCharts.total / pageSize)"
                            class="el-icon-arrow-right"
                            @click="handlePageNumAdd(1)"
                        ></el-button>
                    </div>
                </div>
            </el-col>
            <el-col :span="8" style="min-width:400px">
                <div class="equipmentStatus session h500">
                    <div class="title">
                        <span>{{ $t('labDevice.compositeUse1') }}</span>
                    </div>
                    <div class="charts-height">
                        <ve-histogram
                            :extend="compositeOption"
                            v-if="compositeUseCharts.rows.length"
                            v-loading="compositeUseCharts.loading"
                            :settings="compositeSetting"
                            :height="'100%'"
                            :data="compositeUseCharts"
                        />
                        <data-empty :height="'100%'" v-loading="compositeUseCharts.loading" v-else/>
                    </div>

                </div>
            </el-col>
        </el-row>
    </div>
</template>
<script>
import {
    queryUseRateV3InstrumentStatistics,
    queryClassificationV3Statistics
} from '@/api/labDevice'
import echarts from 'echarts'
import VeHistogram from 'v-charts/lib/histogram.common'
import "v-charts/lib/style.css"
import DataEmpty from "@c/DataEmpty";

export default {
    components: {
        VeHistogram,
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
    data() {
        const _this = this;
        return {
            setting: {
                yAxisName: [_this.$t('transport.unit') + '：%', '']
            },
            useRateOptions: {
                grid: {
                    left: 0,
                    right: 0,
                    bottom: 0,
                    top: 30
                },
                yAxis: {
                    type: 'value',
                    nameTextStyle: {
                      align: "center"
                    },
                    axisLabel: {
                        formatter: (value) => {
                            return value
                        }
                    }
                },
                tooltip: {
                    show: true,
                    formatter: '{b}: {c} %'
                },
                series: {
                    name: _this.$t('labDevice.rate'),
                    type: 'bar',
                    barMaxWidth: 20,
                    label: {
                        show: true,
                        position: 'top',
                    },
                    itemStyle: {
                        normal: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                {offset: 0, color: '#3078f0'},
                                {offset: 1, color: '#3078F050'}
                            ]),
                        }
                    }
                }
            },
            useRateCharts: {
                loading: false,
                columns: ['name', 'useRate'],
                rows: [],
                formatter: ' %',
                name: '使用率',
                total: 0
            },
            useNumCharts: {
                loading: false,
                columns: ['name', 'frequency', 'reservation'],
                columnsKeyNames: {
                    frequency: _this.$t('labDevice.useNum'),
                    reservation: _this.$t('labDevice.orderNum')
                },
                rows: [],
                formatter: ' 次',
                name: '使用率',
                total: 0
            },
            useOptions: {
                legend: {
                    show: false
                },
                tooltip: {
                    show: true,
                    formatter: (params) => {
                        return this.timeTransform(params)
                    }
                },
                grid: {
                    left: 10,
                    right: 0,
                    bottom: 0,
                    top: 30
                },
                yAxis: {
                    type: 'value',
                    minInterval: 1,
                    axisLabel: {
                        formatter: (value) => {
                            return Math.floor(value)
                        }
                    }
                },
                series: [
                    {
                        name: 'frequency',
                        type: 'bar',
                        barMaxWidth: 20,
                        label: {
                            show: true,
                            position: 'top',
                        },
                        itemStyle: {
                            normal: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                    {offset: 0, color: '#D9B480'},
                                    {offset: 1, color: '#F9F7F3'}
                                ]),
                            }
                        }
                    },
                    {
                        name: 'reservation',
                        type: 'bar',
                        barMaxWidth: 20,
                        label: {
                            show: true,
                            position: 'top',
                        },
                        itemStyle: {
                            normal: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                    {offset: 0, color: '#FCCF31'},
                                    {offset: 1, color: '#f3f0e7'}
                                ]),
                            }
                        }
                    }
                ]
            },
            setting2: {
                columns: [],
                yAxisName: [_this.$t('transport.unit') + ":" + _this.$t('labDevice.degree'), ''],
                legend: {
                    show: false
                },
                yAxis: {
                    type: 'value',
                    minInterval: 1,
                    axisLabel: {
                        formatter: (value) => {
                            return Math.floor(value)
                        }
                    }
                },
                xAxis: {
                    axisLabel: {
                        formatter: function (params) {
                            var newParamsName = '' // 最终拼接成的字符串
                            var paramsNameNumber = params.length // 实际标签的个数
                            var provideNumber = 5 // 每行能显示的字的个数
                            if (screen.width < 1550) {
                                provideNumber = 4
                            }
                            var rowNumber = Math.ceil(paramsNameNumber / provideNumber) // 换行的话，需要显示几行，向上取整
                            /**
                             * 判断标签的个数是否大于规定的个数， 如果大于，则进行换行处理 如果不大于，即等于或小于，就返回原标签
                             */
                            if (paramsNameNumber > provideNumber) {
                                for (var p = 0; p < rowNumber; p++) {
                                    var tempStr = '' // 表示每一次截取的字符串
                                    var start = p * provideNumber // 开始截取的位置
                                    var end = start + provideNumber // 结束截取的位置
                                    // 此处特殊处理最后一行的索引值
                                    if (p == rowNumber - 1) {
                                        // 最后一次不换行
                                        tempStr = params.substring(start, paramsNameNumber)
                                    } else {
                                        // 每一次拼接字符串并换行
                                        tempStr = params.substring(start, end) + '\n'
                                    }
                                    newParamsName += tempStr // 最终拼成的字符串
                                }
                            } else {
                                // 将旧标签的值赋给新标签
                                newParamsName = params
                            }
                            //将最终的字符串返回
                            return newParamsName
                        }
                    }
                },
                series: [
                    {
                        name: _this.$t('labDevice.useNum'),
                        type: 'bar',
                        barMaxWidth: 20,
                        showBackground: true,
                        backgroundStyle: {
                            color: '#F9F7F3',
                            barBorderRadius: [10, 10, 10, 10]
                        },
                        itemStyle: {
                            normal: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                    {offset: 0, color: '#D9B480'},
                                    {offset: 1, color: '#F9F7F3'}
                                ]),
                                barBorderRadius: [10, 10, 10, 10]
                            }
                        }
                    },
                    {
                        name: _this.$t('labDevice.orderNum'),
                        type: 'bar',
                        barMaxWidth: 20,
                        showBackground: true,
                        backgroundStyle: {
                            color: '#F9F7F3',
                            barBorderRadius: [10, 10, 10, 10]
                        },
                        itemStyle: {
                            normal: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                    {offset: 0, color: '#FCCF31'},
                                    {offset: 1, color: '#F55555'}
                                ]),
                                barBorderRadius: [10, 10, 10, 10]
                            }
                        }
                    }
                ]
            },
            deviceCount: 0, // 设备总数
            compositeOption: {
                yAxis: {
                    type: 'value',
                    axisLabel: {
                        formatter: (value) => {
                            return value
                        }
                    },
                    minInterval: 1
                },
                grid: {
                    left: 10,
                    right: 0,
                    bottom: 0,
                    top: 30
                },
                legend: {
                    show: false
                },
                tooltip: {
                    trigger: 'item',
                    show: true,
                    formatter: (params) => {
                        return this.tootilFormatter(params)
                    }
                },
                xAxis: {
                    axisLabel: {
                        interval: 0
                    }
                },
                series: {
                    barMaxWidth: 20,
                    backgroundStyle: {
                        color: '#F9F7F3',
                    },
                    label: {
                        show: true,
                        position: 'top',
                    },
                    itemStyle: {
                        normal: {
                            color: function (params) {
                                const colors = [
                                    '#399FF1',
                                    '#03C28F',
                                    '#EFA101',
                                    '#C366FC',
                                    '#D02569'
                                ]
                                return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                    {offset: 0, color: colors[params.dataIndex]},
                                    {offset: 1, color: colors[params.dataIndex] + 50}
                                ])
                            },
                            // barBorderRadius: [10, 10, 10, 10]
                        }
                    }
                }
            },
            compositeUseCharts: {
                loading: false,
                columns: ['name', 'data'],
                rows: [],
                formatter: ' %',
                name: '使用率',
                type: 1
            },
            compositeSetting: {
                yAxisName: [_this.$t('transport.unit') + ":" + _this.$t('common.stand')],
            },
            pageNum: 1,
            pageSize: 8
        }
    },
    methods: {
        tootilFormatter(params) {
            return params.name + '：' + params.data
        },
        timeTransform(sec) {
            let reg = /background-color:\[object Object]\;/g
            let str = sec
                .map((v) => {
                    let newbg = `background-image: linear-gradient(${v.color.colorStops[0].color}, ${v.color.colorStops[1].color});`
                    let marker = `${v.marker.replace(reg, newbg)}`
                    return `${marker}${this.useNumCharts.columnsKeyNames[v.seriesName]
                    }：${v.data}`
                })
                .join('<br />')
            return `${sec[0].name}<br />${str}`
        },
        useNumChartsAfterConfig(options) {
            options.series.forEach((item, index) => {
                item = Object.assign(item, this.useOptions.series[index])
                item.barGap = '20%'
            })
            return options
        },
        handlePageNumMinus() {
            this.pageNum -= 1
            this.queryInstrumentUseChartData()
        },
        // 处理使用率分级统计数据
        handleClassifyChartData(list) {
            let obj = {
                '0-20%': {
                    min: 0,
                    max: 20
                },
                '20-40%': {
                    min: 20,
                    max: 40
                },
                '40-60%': {
                    min: 40,
                    max: 60
                },
                '60-80%': {
                    min: 60,
                    max: 80
                },
                '80-100%': {
                    min: 80,
                    max: 100
                }
            }
            let newObj = {},
                newList = []
            for (let key in obj) {
                let min = obj[key].min,
                    max = obj[key].max
                newObj[key] = []
                list.forEach((item) => {
                    let useRate = this.$NP.times(item.useRate, 100)
                    if (
                        (useRate >= min && useRate < max) ||
                        (max === 100 && useRate >= min && useRate <= max)
                    ) {
                        if (!newObj[key].find((v) => v.thingsTd === item.thingsTd)) {
                            newObj[key].push(item)
                        }
                    }
                })
            }
            for (let key in newObj) {
                newList.push({
                    name: key,
                    data: newObj[key].length
                })
            }
            return newList
        },
        async queryInstrumentUseChartData() {
            this.useNumCharts.loading = true
            this.useRateCharts.loading = true
            this.queryParams.pageNum = this.pageNum
            try {
                await this.getUseStatData(this.queryParams)
                    .then((res) => {
                        if (res.list.length) {
                            res.list.forEach((item) => {
                                item.useRate = this.$NP.round(
                                    this.$NP.times(item.useRate, 100),
                                    2
                                )
                            })
                        }
                        this.useRateCharts.rows = res.list
                        this.useRateCharts.total = res.total
                        this.useRateCharts.loading = false
                        this.useNumCharts.rows = res.list
                        this.useNumCharts.total = res.total
                        this.useNumCharts.loading = false
                        this.deviceCount = res.list.length
                    })
                    .then(() => {
                        this.useOptions.yAxis.minInterval = 1
                        this.useOptions.yAxis.max = 5
                        const max = Math.max.apply(
                            Math,
                            this.useNumCharts.rows.map((item) => {
                                return item.frequency
                            })
                        )
                        if (max >= 5) {
                            delete this.useOptions.yAxis.max
                        }
                        this.useNumCharts.loading = false
                    })
            } catch (e) {
                this.useNumCharts.loading = false
                this.useRateCharts.loading = false
            }
        },
        getUseStatData(items) {
            return new Promise((resolve) => {
                queryUseRateV3InstrumentStatistics(items).then((res) => {
                    if (res.code && res.items['list']) {
                        resolve(res.items)
                    } else {
                        resolve([])
                    }
                })
            })
        },
        handleChartData() {
            this.queryInstrumentUseChartData()
            this.queryClassifyChartData()
        },
        handlePageNumAdd() {
            this.pageNum += 1
            this.queryInstrumentUseChartData()
        },
        changePageNum(pageNum) {
            this.pageNum = pageNum
        },
        async queryClassifyChartData() {
            this.compositeUseCharts.loading = true
            this.compositeUseCharts.rows = []
            let defaultData = []
            try {
                let params = JSON.parse(JSON.stringify(this.queryParams))
                delete params.pageSize
                delete params.pageNum
                await queryClassificationV3Statistics(params).then((res) => {
                    this.compositeUseCharts.loading = false;
                    if (!res.items.classificaVOList?.length) {
                        res.items.classificaVOList = defaultData
                    }
                    this.handleCompositeUseChartData(res.items.classificaVOList)
                })
            } catch (e) {
                this.compositeUseCharts.loading = false;
                this.handleCompositeUseChartData(defaultData)
            }

        },
        handleCompositeUseChartData(list) {
            if (list.length === 0) {
                return
            }
            list.map((item) => {
                let name = ''
                switch (item.useRateFlag) {
                    case 1:
                        name = '0-20%'
                        break
                    case 2:
                        name = '20-40%'
                        break
                    case 3:
                        name = '40-60%'
                        break
                    case 4:
                        name = '60-80%'
                        break
                    case 5:
                        name = '80-100%'
                        break
                }
                this.compositeUseCharts.rows.push({
                    name,
                    data: item.useRateNum
                })
                const max = Math.max.apply(
                    Math,
                    this.compositeUseCharts.rows.map((item) => {
                        return item.data
                    })
                )
                if (max >= 5) {
                    delete this.compositeOption.yAxis.max;
                } else {
                    this.compositeOption.yAxis.max = 5;
                }
            })
        }
    },
    mounted() {
    }
}
</script>
<style lang="less" scoped>

.rate-chart {
    display: inline-block;
    width: 48%;
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

.total {
    display: flex;
    justify-content: center;
    margin-top: 10px;

    /deep/ .el-button {
        padding: 8px !important;
    }

    .el-icon-arrow-left,
    .el-icon-arrow-right {
        color: #555555 !important;
    }

    .total-num {
        margin: 0 10px;
        line-height: 30px;
    }
}

.charts-height {
    height: 300px;
}
.h500 {
    height: 423px;
}
</style>
