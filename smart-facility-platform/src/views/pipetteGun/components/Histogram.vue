<template>
    <ve-histogram class="alarm-histogram" :extend="extend" height="250px"></ve-histogram>
</template>

<script>
    import VeHistogram from 'v-charts/lib/histogram.common'
    import echarts from "echarts";
    export default {
        components: {
            VeHistogram,
        },
        props:{
            itemStyleColor: {
                type: Array,
                default: () => ['#3078f0', '#3078F050']
            },
            backgroundStyle: {
                type: String,
                default: "#F1F5FF"
            },
            titleSubtext: {
                type: String,
                default: ""
            },
            tooltipFormatter: {
                type: String,
                default: ""
            },
            chartData: {
                type: Array,
                default: () => []
            },
            queryType: {
                type: Number,
                default: null
            }
        },
        data() {
            return {
                extend: {},
            }
        },
        mounted() {
            var _this = this;
            let xAxisData = [];
            let seriesData = [];
            let data = []
            for(var i = 0; i < this.chartData.length; i++){
                xAxisData.push(this.chartData[i].name);
                seriesData.push(this.chartData[i].data);
                data.push(
                    {
                        value: this.chartData[i].data,
                        name: this.chartData[i].name,
                        dataUnit: this.chartData[i].dataUnit
                    }
                )
            }
            this.extend = {
                xAxis: {
                    data: xAxisData,
                    axisLabel: {
                        show: true,
                        color: '#333',
                        interval: 0,
                        formatter: function(params) {
                            // var newParamsName = "";
                            // var paramsNameNumber = params.length; 
                            // var provideNumber = 5; 
                            // if(screen.width < 1550){
                            //     provideNumber = 4
                            // };
                            // var rowNumber = Math.ceil(paramsNameNumber / provideNumber); 
                            // if (paramsNameNumber > provideNumber) {
                            //     for (var p = 0; p < rowNumber; p++) {
                            //         var tempStr = ""; 
                            //         var start = p * provideNumber;
                            //         var end = start + provideNumber;
                            //         if (p == rowNumber - 1) {
                            //             tempStr = params.substring(start, paramsNameNumber);
                            //         } else {
                            //             tempStr = params.substring(start, end) + "\n";
                            //         }
                            //         newParamsName += tempStr; 
                            //     }
                            // } else {
                            //     newParamsName = params;
                            // }
                            return params;
                        }
                    },
                },
                tooltip: {
                    trigger: 'item', 
                    axisPointer: {
                        type: 'shadow'
                    },
                    // formatter: this.tooltipFormatter
                    formatter: function(e){
                        if(_this.tooltipFormatter){
                            return e.data.name + '<br/>' + _this.tooltipFormatter + '：' + e.data.dataUnit
                        }else{
                            return e.data.name + '：' + e.data.dataUnit
                        }
                    }
                },
                yAxis: {
                    minInterval: 1,
                    max: function (value) {
                        if(value.max < 5){
                            return 5
                        }else{
                            return null
                        }
                    },
                    axisLabel: {
                        show: true,
                        textStyle: {
                            color: "#333",
                        }
                    },
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: ['#F0F2FC'],
                            width: 1,
                            type: 'solid'
                        }
                    }
                },
                grid: {
                    top: "18%",
                    bottom: "0"
                },
                series: [
                    {
                        barWidth: 20,
                        data: data,
                        type: 'bar',
                        itemStyle: {
                            normal: {
                                color: new echarts.graphic.LinearGradient(
                                    0, 0, 0, 1,
                                    [
                                        {offset: 0, color: this.itemStyleColor[0]},
                                        {offset: 1, color: this.itemStyleColor[1]}
                                    ]
                                ),
                                barBorderRadius:[10, 10, 10, 10]
                            }
                        },
                        showBackground: true,
                        backgroundStyle: {
                            color: this.backgroundStyle,
                            barBorderRadius:[10, 10, 10, 10]
                        }
                    }
                ],
                title: [
                    {
                        subtext: this.titleSubtext,
                        left: 0,
                        top: 0, 
                        subtextStyle: {
                            color: "#888",
                        },
                    },
                ],
            }
        },
    }
</script>