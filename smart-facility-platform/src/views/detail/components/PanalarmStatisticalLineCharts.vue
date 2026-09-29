<template>
  <Echarts :option="option" />
</template>
<script>
import Echarts from "@/components/Echarts";
export default {
  name: "lineEchatrs",
  components: {
    Echarts,
  },
  data() {
    return {
      option: {},
    };
  },
  mounted() {
    let option = {
      tooltip: {
        trigger: "axis",
      },
      toolbox: {
        show: true,
      },
      xAxis: {
        type: "category",
        data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        axisTick: {
          show: false,
        },
      },
      yAxis: {
        type: "value",
        axisTick: {
          show: false,
        },
        axisLine: {
          show: false,
        },
      },
      series: [
        {
          data: [820, 932, 901, 934, 1290, 1330, 1320],
          type: "line",
          smooth: true,
          markLine: {
            data: [{ type: "average", name: "Avg" }],
            itemStyle: {
              color: "#ff4949",
            },
          },
          itemStyle: {
            color: "#ffd591",
          },
        },
      ],
    };
    this.option = option;
  },
  methods: {},
};
</script>
<style scoped>
.lineEcharts {
  height: 300px;
}
</style>
