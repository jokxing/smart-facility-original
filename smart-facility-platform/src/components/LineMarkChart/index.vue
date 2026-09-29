<template>
    <div>
        <ve-line :colors="colors"
                 :data="dataCharts"
                 v-if="dataCharts.rows.length"
                 :data-zoom="chartDataZoom"
                 :extend="options"
                 :loading="dataCharts.loading"
                 :set-option-opts="false"
                 :toolbox="toolbox">
        </ve-line>
        <data-empty v-loading="dataCharts.loading" v-else/>

    </div>

</template>

<script>
import VeLine from "v-charts/lib/line.common"
import VeBar from "v-charts/lib/bar.common"

require("echarts/lib/component/markLine");
require("echarts/lib/component/markPoint");
require("echarts/lib/component/dataZoom");
require("echarts/lib/component/toolbox");
require("echarts/lib/component/title");
import "v-charts/lib/style.css"
import {DATAZOOM} from "@/utils/constant";
import DataEmpty from "@c/DataEmpty";

export default {
    name: "index",
    components: {
        VeLine,
        VeBar,
        DataEmpty
    },
    props: {
        dataCharts: {
            type: Object,
            default: {}
        },
        colors: {
            type: Array,
            default: () => ['#0000ff']
        }
    },
    data() {
        this.chartDataZoom = [
            {
                type: 'slider',
                startValue: '',
                xAxisIndex: [0],
                realtime: true,
                start: 0,
                end: 100,
            }
        ]
        const _this = this;
        this.options = {
            legend: {
                show: false,
                orient: "vertical",
                right: 16,
                top: 8
            },
            tooltip: {
                formatter: (params) => {
                    let str = "";
                    params.forEach((item) => {
                        str += `${item.name}<br/>${item.marker} ${item.seriesName}：${item.value[1]} ${_this.dataCharts.unit}<br/>`;
                    });
                    return str;
                }
            },
            yAxis: {
                type: "value",
                axisLabel: {
                    formatter: (value, index) => {
                        if (DATAZOOM[this.dataCharts.type]) {
                            const array = DATAZOOM[this.dataCharts.type];
                            return value === 0 ? array[1] : (value === 1 ? array[2] : "");
                        } else if (this.dataCharts.type === 0) {
                            return value === 0 ? "正常" : (value === 1 ? "报警" : "");
                        } else {
                            return value + this.dataCharts.unit;
                        }
                    },
                },
            },
            xAxis: {
                type: "category",
            },
            series: {
                markLine: {
                    label: {
                        position: "middle",
                        color: "#ff4949"
                    },
                    lineStyle: {
                        color: "#ff4949"
                    },
                    data: [
                        {
                            yAxis: 0,
                            name: _this.$t('hardware.lowerLimit'),
                            lineStyle: {
                                color: "red"
                            },
                            label: {
                                show: true,
                                position: "middle",
                                formatter: "{b}:{c}"
                            },
                        },
                        {
                            yAxis: 0,
                            name: _this.$t('hardware.UpperLimit'),
                            lineStyle: {
                                color: "red"
                            },
                            label: {
                                show: true,
                                position: "middle",
                                formatter: "{b}:{c}"
                            },
                        },
                        {
                            type: 'average',
                            name: _this.$t('hardware.average'),
                            lineStyle: {
                                color: "blue"
                            },
                            label: {
                                color: "blue"
                            }
                        }],
                },
                connectNulls: true
            }
        }
        return {
            toolbox: {
                show: true,
                feature: {
                    // dataZoom: {yAxisIndex: "none",title: {zoom: _this.$t('other.zoom'), back: _this.$t('other.back')}},
                    dataView: {
                        readOnly: true,
                        title: _this.$t('other.dataView'),
                        lang: [_this.$t('other.dataView'), _this.$t('common.close')]
                    },
                    magicType: {
                        type: ["line", "bar"],
                        title: {line: _this.$t('other.line'), bar: _this.$t('other.bar')}
                    },
                    restore: {title: _this.$t('other.restore')},
                    saveAsImage: {title: _this.$t('other.saveAsImage')}
                }
            }
        }
    },
    updated() {
        if (!this.dataCharts.rows.length) return;
        this.options.series.name = this.dataCharts.name;
        let list = [];
        for (let i in this.dataCharts.rows) {
            list.push(this.dataCharts.rows[i].data);
        }
        list.sort(function (num1, num2) {
            return num1 - num2;
        })
        let maxcnt = eval(list[list.length - 1]);
        let mincnt = eval((list[0]));
        if (!DATAZOOM[this.dataCharts.type] && this.dataCharts.type !== 0) {
            this.options.yAxis.min = this.dataCharts.min < mincnt ? this.dataCharts.min : mincnt;
            this.options.yAxis.max = maxcnt ? (this.dataCharts.max > maxcnt ? this.dataCharts.max : maxcnt) : this.dataCharts.max;
            this.options.series.markLine.data[0].yAxis = this.dataCharts.min;
            this.options.series.markLine.data[1].yAxis = this.dataCharts.max;
        } else {
            this.options.yAxis.min = 0;
            this.options.yAxis.max = 1;
            this.options.series.markLine.data[0].yAxis = 0;
            this.options.series.markLine.data[1].yAxis = 1;
        }
    }
}
</script>
