<template>
  <Echarts :option="options" />
</template>
<script>
import Echarts from "@/components/Echarts";
import moment from 'moment'
export default {
  name: "lineEchatrs",
  components: {
    Echarts,
  },
  props: {
    data: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      option: {},
    };
  },
  computed: {
    options() {
      let { data } = this;
      let xAxios = []; //["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      let yAxios = []; //[820, 932, 901, 934, 1290, 1330, 1320]
      for (let i = 0; i < data.length; i++) {
        xAxios.push(moment(data[i].date).format('YYYY-MM-DD'));
        yAxios.push(data[i].alarmCount);
      }
      let option = {
        grid: {
          top: 20,
          bottom: 30,
          left: "5%",
          right: 0,
        },
        tooltip: {
          trigger: "axis",
        },
        toolbox: {
          show: true,
        },
        xAxis: {
          type: "category",
          data:
            xAxios.length > 0
              ? xAxios
              : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          axisTick: {
            show: false,
          },
        },
        yAxis: {
          minInterval:1,
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
            data:
              yAxios.length > 0
                ? yAxios
                : [0, 0, 0, 0, 0, 0, 0],
            type: "line",
            smooth: true,
            markLine: {
              data: [{ type: "average", name: "Avg" }],
              itemStyle: {
                color: "#d3d6df",
              },
            },
            itemStyle: {
              color: "#ff4949",
            },
          },
        ],
      };
      return option;
    },
  },
  mounted() {},
  methods: {},
};
</script>
<style scoped>
.lineEcharts {
  height: 300px;
}
</style>
