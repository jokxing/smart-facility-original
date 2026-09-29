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
  mounted() {
    let option = {
      color: ["#13ce66", "#ffd591", "#ff4949"],
      tooltip: {
        trigger: "item",
        formatter: "{b} : {c} ({d}%)",
      },
      legend: {
        bottom: 0,
        left: "center",
        data: ["正常", "报警", "离线"],
      },
      series: [
        {
          type: "pie",
          radius: "70%",
          center: ["50%", "50%"],
          selectedMode: "single",
          data: [
            {
              value: 1548,
              name: "正常",
            },
            { value: 735, name: "报警" },
            { value: 510, name: "离线" },
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    };
    this.option = option;
  },
  watch: {
    data: {
      handler(newVal) {


      },
      immediate: true,
    },
  },

  methods: {},
};
</script>
<style scoped>
.lineEcharts {
  height: 300px;
}
</style>
