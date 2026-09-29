<template>
  <Echarts :option="option" />
</template>
<script>
// let echarts = require("echarts/lib/echarts");
// require("echarts/lib/chart/pie");
// require("echarts/lib/component/tooltip");
// require("echarts/lib/component/title");
import Echarts from "@/components/Echarts";
let statusSet = [
  {
    name: "运行中",
    num: 0,
  },
  {
    name: "待机中",
    num: 0,
  },
  {
    name: "已关机",
    num: 0,
  },
  {
    name: "维护中",
    num: 0,
  },
  {
    name: "未检测",
    num: 0,
  },
];
export default {
  name: "pieChatrs",
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
      title: [],
      color: ["#13ce66", "#666", "#000000", "#ff4949", "#ffd591"],
      series: [],
    };

    for (let i = 0; i < statusSet.length; i++) {
      option.title[i] = {
        text: "{pp|" + statusSet[i].name + "}",
        left: (i + 1) * 19 - 11.6 + "%",
        y: 10,
        textStyle: {
          fontSize: 15,
          rich: {
            pp: {
              fontWeight: "bold",
              fontSize: 15,
              width: "9",
              align: "center",
            },
          },
        },
      };
      option.series[i] = {
        name: "设备状态统计",
        type: "pie",
        center: [(i + 1) * 19 - 8 + "%", "50%"],
        radius: [60, 75],
        // x: i * 20 + '%', // for funnel
        label: {
          position: "center",
          formatter: "{d}%\n\n{c}",
        },
        labelLine: {
          show: false,
        },
        data: [
          {
            name: statusSet[i].name,
            value: statusSet[i].num,
            label: {
              position: "center",
              fontSize: 20,
            },
          },
          {
            name: "",
            value: 100 - statusSet[i].num,
            label: {
              show: false,
            },
            itemStyle: {
              color: "#ccc",
            },
          },
        ],
      };
    }
    this.option = option;
  },

  methods: {},
};
</script>
<style scoped>
.pieChart {
  height: 240px;
}
</style>
