<template>
  <div ref="barEcharts" class="echarts"></div>
</template>

<script>
import * as echarts from 'echarts';

const colors = ['#5470C6', '#F88317'];
export default {
  name: "index",
  props: {
    dataCharts: {
      type: Object,
      default: () => {}
    },
  },
  data() {
    return {
      option: null
    }
  },
  mounted() {
    const obj = {
      data: [],
      yAxis1: [],
      yAxis2: []
    }
    this.dataCharts.rows.map(item => {
      obj.data.push(item[this.dataCharts.columns[0]]);
      obj.yAxis1.push(item[this.dataCharts.columns[1]]);
      obj.yAxis2.push(item[this.dataCharts.columns[2]]);
    })
    this.option = {
      color: colors,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      grid: {
        right: '20%'
      },
      legend: {
        data: ['数量', '金额']
      },
      xAxis: [
        {
          type: 'category',
          axisTick: {
            alignWithLabel: true
          },
          // prettier-ignore
          data: obj.data
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: '数量',
          position: 'left',
          alignTicks: true,
          axisLine: {
            show: true,
            lineStyle: {
              color: colors[0]
            }
          },
          axisLabel: {
            formatter: '{value} 条'
          }
        },
        {
          type: 'value',
          name: '金额',
          position: 'right',
          alignTicks: true,
          // offset: 80,
          axisLine: {
            show: true,
            lineStyle: {
              color: colors[1]
            }
          },
          axisLabel: {
            formatter: '{value} 元'
          }
        },
      ],
      series: [
        {
          name: '数量',
          type: 'bar',
          data: obj.yAxis1
        },
        {
          name: '金额',
          type: 'line',
          yAxisIndex: 1,
          data: obj.yAxis2
        }
      ]
    }
    this.$nextTick(() => {
      this.initEcharts();
      window.addEventListener("resize", this.resize);
    });
  },
  methods: {
    initEcharts() {
      this.chart = echarts.init(this.$refs.barEcharts);
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
  height: 250px;
}
</style>
