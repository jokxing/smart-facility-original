<template>
  <div class="echarts" ref="echarts"></div>
</template>
<script>
let echarts = require("echarts/lib/echarts");
require("echarts/lib/chart/line");
require("echarts/lib/component/tooltip");
require("echarts/lib/component/title");
require("echarts/lib/component/markLine");
require("echarts/lib/component/legend");
export default {
  props: {
    data: {
      type: Array,
      default: () => [],
    },
  },
  watch: {
    data: {
      handler(newVal) {
        let offLine = [];
        let normal = [];
        let warnning = [];
        let timeData = [];
        for (let i = 0; i < newVal.length; i++) {
          offLine.push(newVal[i].offLineCount);
          normal.push(newVal[i].normalCount);
          warnning.push(newVal[i].alarmNum);
          timeData.push(newVal[i].date);
        }
        let initTimeData = timeData.slice(0, 8);
        let remainTimeData = timeData.slice(8);
        let option = {
          color: ["#13ce66", "#e5e5e5", "#ff4949"],
          grid: {
            top: 20,
            bottom: 30,
            left: "5%",
            right: 0,
          },
          tooltip: {
            trigger: "axis",
            axisPointer: {
              animation: false,
            },
          },
          xAxis: {
            type: "category",
            axisTick: {
              show: false,
            },
            data: initTimeData,
          },
          yAxis: {
            minInterval:1,
            type: "value",
            boundaryGap: [0, "100%"],
            axisTick: {
              show: false,
            },
            axisLine: {
              show: false,
            },
          },
          series: [
            {
              name: "正常",
              data: normal,
              type: "line",
              markLine: {
                data: [{ type: "average", name: "Avg" }],
              },
            },
            {
              name: "离线",
              data: offLine,
              type: "line",
              markLine: {
                data: [{ type: "average", name: "Avg" }],
              },
            },
            {
              name: "报警",
              data: warnning,
              type: "line",
              markLine: {
                data: [{ type: "average", name: "Avg" }],
              },
            },
          ],
        };
        let _ = this;
        _.chart.setOption(option);
        this.timer = setInterval(function () {
          let j = 0;
          while (j < remainTimeData.length) {
            initTimeData.shift();
            initTimeData.push(remainTimeData[j]);
            j++;
            _.chart.setOption({
              xAxis: {
                type: "category",
                axisTick: {
                  show: false,
                },
                data: initTimeData,
              },
            });
          }
        }, 1000);
      },
    },
  },
  data() {
    return {
      timer: "",
      chart: null,
      option: {},
    };
  },

  mounted() {
    this.$nextTick(() => {
      this.chart = echarts.init(this.$refs.echarts);
      window.addEventListener("resize", this.resize);
    });
  },

  methods: {
    resize() {
      this.chart.resize();
    },

    // initEcharts(option) {
    //    this.chart = echarts.init(this.$refs.echarts);
    //   this.chart.setOption(option);
    // },
  },
  beforeDestroy() {
    clearInterval(this.timer);
    if (!this.chart) {
      return;
    }
    window.removeEventListener("resize", this.resize);
    this.chart.dispose();
    this.chart = null;
  },
};
</script>
<style scoped>
.echarts {
  height: 300px;
}
</style>
