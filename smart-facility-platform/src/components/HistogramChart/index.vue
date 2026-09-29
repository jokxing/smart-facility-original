<template>
    <div>
        <ve-histogram
            :colors="colors"
            :data="dataCharts"
            :height="height"
            v-if="dataCharts.rows.length"
            :extend="dataCharts.rows.length ? options : null "
            :set-option-opts="false"
            :data-zoom="isDataZoom ? chartDataZoom : null"
            :toolbox="isToolbox ? toolbox : null"
            :loading="dataCharts.loading"/>
        <data-empty :height="height" v-loading="dataCharts.loading" v-else/>
    </div>

</template>

<script>
import DataEmpty from "@c/DataEmpty";

require("echarts/lib/component/markLine");
require("echarts/lib/component/markPoint");
require("echarts/lib/component/dataZoom");
require("echarts/lib/component/toolbox");
require("echarts/lib/component/title");
import VeHistogram from "v-charts/lib/histogram.common"
import "v-charts/lib/style.css"
import echarts from "echarts";

export default {
  name: "index",
  components: {
    VeHistogram,
      DataEmpty

  },
  props: {
    dataCharts: {
      type: Object,
      default: {}
    },
    legendShow: {
      type: Boolean,
      default: false
    },
    colors: {
      type: Array,
    },
    type: {
      type: Number,
      default: 0
    },
    height: {
      type: String,
      default: '100%'
    },
    interval: {
      type: [Number, String],
      default: 'auto'
    },
      isDataZoom:{
        type: Boolean,
        default: false
      },
      isToolbox:{
        type: Boolean,
        default: false
      },
      isMarkLink: {
        type: Boolean,
          default: false
      },
      obj: {
        type: Object,
        default: () => {}
      }
  },
  data() {
    let that = this;
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
    this.options = {
      legend: {
        show: this.legendShow,
          top: 30,
          right: 0
      },
      yAxis: {
        type: "value",
          min: 1,
        axisLabel: {
          formatter: (value) => {
            if (this.type == 1) {
              return this.getDuration(value);
            } else if(this.type == 0){
              return (value >= 1000 ? Math.round(value / 1000) / 10 + 'W' : value) + that.dataCharts.formatter;
            }else if(this.type == 2){
              return (value >= 1000 ? Math.round(value / 1000) / 10 + 'kw/h' : value) + that.dataCharts.formatter;
            } else {
                return value + "%"
            }
          },
        }
      },
      xAxis: {
        axisLabel: {
          interval: this.interval
        },
      },
      tooltip: {
        formatter: (params) => {
            if (typeof this.obj === 'undefined') {
                console.log(this.obj)
                return this.handleFormatter(params);
            }
            let arr = Object.keys(this.obj)
            if (arr.length === 0) {
                return this.handleFormatter(params);
            } else {
                console.log(params)
                let str = params[0].name + "<br/>";
                params.forEach((item) => {
                    str +=
                        '<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;left:5px;background-color:' + item.color + '"></span>' + item.seriesName + " : " + (item.value ? this.formatter(item.value) : "0") + "<br />";
                });
                str += '<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;left:5px;"></span>'+ this.$t('labDevice.orderDuration') +':' + this.obj[params[0].name].preWorkHour + 'h<br/>';
                str += '<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;left:5px;"></span>'+this.$t('labDevice.runDurationHMS')+':' + this.obj[params[0].name].workHour + 'h'
                return str;
            }
        },
        axisPointer: {
          type: 'shadow'
        }
      },
      series: {
        type: "bar",
        barMaxWidth: 20,
          backgroundStyle: {
              color: "#F1F5FF",
              barBorderRadius:[10, 10, 10, 10]
          },
        itemStyle: {
            normal: {
                color: function (params) {
                    return new echarts.graphic.LinearGradient(
                        0, 0, 0, 1,
                        [
                            {offset: 0, color: params.color},
                            {offset: 1, color: params.color + 50}
                        ]
                    )
                },
                barBorderRadius:[10, 10, 10, 10]

            }
        }
      }
    }
    return {
        toolbox: {
            show: true,
            feature: {
                // dataZoom: {yAxisIndex: "none",title: {zoom: that.$t('other.zoom'), back: that.$t('other.back')}},
                dataView: {readOnly: true,title: that.$t('other.dataView'),lang: [that.$t('other.dataView'),that.$t('common.close')]},
                magicType: {type: ["line", "bar"],title:{line: that.$t('other.line'),bar:that.$t('other.bar')}},
                restore: {title: that.$t('other.restore')},
                saveAsImage: {title: that.$t('other.saveAsImage')}
            }
        }
    }
  },
    mounted() {
      if (this.isMarkLink) {
          const _this = this;
          this.options.series.markLine = {
              label: {
                  position: "middle",
                      color: "#ff4949"
              },
              lineStyle: {
                  color: "#ff4949"
              },
              data: [
                  {
                      type: 'average',
                      name: _this.$t('hardware.average'),
                      label: {
                          formatter: "{b}: {c}"
                      }
                  },
                  ],
          }
      }
    },
    methods: {
    getDuration(value) {
      let duration;
      const days = Math.floor(value / 86400);
      const hours = Math.floor((value % 86400) / 3600);
      const minutes = Math.floor(((value % 86400) % 3600) / 60);
      const seconds = Math.floor(((value % 86400) % 3600) % 60);
      duration = days + "天" + this.handlePadStart(hours) + "时" + this.handlePadStart(minutes) + "分" + this.handlePadStart(seconds) + "秒";
      return duration;
    },
    handlePadStart(value) {
      return value.toString().padStart(2, "0");
    },
    handleFormatter(params) {
        if (params.length === 1) {
        return params[0].name + '<br/><span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;left:5px;background-color:#1890ff"></span>' + params[0].seriesName + " : " + this.formatter(params[0].value);
      } else {
        let str = params[0].name + "<br/>";
        params.forEach((item) => {
          str +=
              '<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;left:5px;background-color:' + item.color + '"></span>' + item.seriesName + " : " + (item.value ? this.formatter(item.value) : "0") + "<br />";
        });
        return str;
      }
    },
    formatter(value) {
      if (this.type == 1) {
        return this.getDuration(value);
      } else if(this.type == 0) {
        return value;
      }else if(this.type == 2){
        return value;
      } else {
          return value + "%";
      }
    }
  }
}
</script>
