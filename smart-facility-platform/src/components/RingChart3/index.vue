<template>
    <div ref="echarts" :style="{height: height}" class="echarts"></div>
</template>

<script>
import * as echarts from 'echarts';

let colors;
export default {
    name: "index",
    props: {
        /**
         *  array[2] = 总数-array[0]-array[1]
         */
        dataCharts: {
            type: Array,
            default: () => {
                return [75, 12, 15]
            }
        },
        type: {
            type: Number,
            default: 1
        },
        height: {
            type: String,
            default: "150px"
        },
        colors: {
            type: Array | Object,
            default: () => ["#4447ea", "#FE5268", "#EEEEEE"]
        }
    },
    data() {
        return {
            option: null
        }
    },
    mounted() {
        colors = [
            {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                    {
                        offset: 0,
                        color: this.colors[0], // 0% 处的颜色
                    },
                    {
                        offset: 1,
                        color: this.colors[0], // 100% 处的颜色
                    },
                ],
            },
            {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                    {
                        offset: 0,
                        color: this.colors[1], // 0% 处的颜色
                    },
                    {
                        offset: 1,
                        color: this.colors[1], // 100% 处的颜色
                    },
                ],
            },
            {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                    {
                        offset: 0,
                        color: this.colors[2], // 0% 处的颜色
                    },
                    {
                        offset: 1,
                        color: this.colors[2], // 100% 处的颜色
                    },
                ],
            },
        ];
        const colorDataHandle = (data, total, width = 375) => {
            let num = 0
            let option = {
                angleAxis: {
                    axisLine: {
                        show: false,
                    },
                    axisLabel: {
                        show: false,
                    },
                    splitLine: {
                        show: false,
                    },
                    axisTick: {
                        show: false,
                    },
                    min: 'dataMin',
                    max: 'dataMax',
                    startAngle: 90,
                },
                radiusAxis: {
                    type: 'category',
                    axisLine: {
                        show: false,
                    },
                    axisTick: {
                        show: false,
                    },
                    axisLabel: {
                        show: false,
                    },
                },
                polar: {
                    radius: '100%'
                },
                series: []
            }
            // option是对传入的数据的一个处理
            option.series = data.map((item, index) => {
                num += item
                return {
                    type: 'bar',
                    data: [0, 0, 0, num],
                    coordinateSystem: 'polar',
                    z: 9999 - index,
                    roundCap: true,
                    color: colors[index],
                    barGap: '-100%',
                    itemStyle: {
                        // 控制弧的宽,弧的宽的控制并没有做太多的情况判断,简单的区分了一下
                        borderWidth: index === 0 ? 4 : index === 1 ? 2 : 0,
                        borderColor: colors[index],
                        shadowColor: colors[index],
                    },
                }
            })
            return option;
        }
        this.option = colorDataHandle(this.dataCharts);
        this.$nextTick(() => {
            this.initEcharts();
            window.addEventListener("resize", this.resize);
        });
    },
    methods: {
        initEcharts() {
            this.chart = echarts.init(this.$refs.echarts);
            this.chart.setOption(this.option);
        },
        resize() {
            this.chart.resize();
        },
    },
    beforeDestroy() {
        if (!this.chart) {
            return;
        }
        window.removeEventListener("resize", this.resize);
        this.chart.dispose();
        this.chart = null;
    },
}
</script>

<style lang="less" scoped>

.echarts {
    position: relative;
}
</style>
