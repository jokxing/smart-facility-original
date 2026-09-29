<template>
    <div class="charts">
        <div v-if="data.length > 0" ref="echarts" style="height: 350px" class="echarts"></div>
        <div v-else class="echarts-empty" style="height: 350px">{{ $t('common.notMessage1') }}</div>
    </div>
</template>

<script>
import * as echarts from 'echarts';

const formatUtil = echarts.format;
export default {
    name: "index",
    props: {
        height: {
            type: Number,
            default: 100
        },
        data: {
            type: Array,
            default: () => {
                return [
                    {
                        name: 'nodeA',
                        value: 10,
                        children: [
                            {
                                name: 'nodeAa',
                                value: 4
                            },
                            {
                                name: 'nodeAb',
                                value: 6
                            }
                        ]
                    },
                    {
                        name: 'nodeB',
                        value: 20,
                    },
                    {
                        name: 'nodeC',
                        value: 20,
                    },
                ]
            }
        }
    },
    data() {
        return {
            option: null
        }
    },
    watch: {
        data: {
            handler(newValue) {
                if (this.data.length > 0) {
                    this.option = {
                        label: {
                            show: false,
                            width: 5,
                            overflow: 'breakAll',
                            formatter: "{b}: {c}%",
                        },
                        color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc',],
                        series: [
                            {
                                type: 'treemap',
                                breadcrumb: { show: false},
                                label: {
                                    show: true,
                                    width: 5,
                                    overflow: 'breakAll',
                                },
                                levels: [{
                                    itemStyle: {
                                        borderWidth: 0,
                                        gapWidth: 5
                                    }
                                },
                                    {
                                        itemStyle: {
                                            gapWidth: 1
                                        }
                                    },
                                    {
                                        colorSaturation: [0.35, 0.5],
                                        itemStyle: {
                                            gapWidth: 1,
                                            borderColorSaturation: 0.6
                                        }
                                    }],
                                data: this.data
                            }
                        ]
                    }
                    this.$nextTick(() => {
                        this.initEcharts();
                        window.addEventListener("resize", this.resize);
                    })
                } else {
                    if (!this.chart) {
                        return;
                    }
                    window.removeEventListener("resize", this.resize);
                    this.chart.dispose();
                    this.chart = null;
                }
            }
        }
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

.charts {
    position: relative;

    .echarts-empty {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #888;
        font-size: 14px;
    }
}

</style>
