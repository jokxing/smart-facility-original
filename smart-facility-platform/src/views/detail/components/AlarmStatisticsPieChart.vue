<template>
  <Echarts :option="option" />
</template>
<script>
import Echarts from "@/components/Echarts";
export default {
  components: {
    Echarts,
  },
  props: {
    data: {
      type: Array,
      default: () => [],
    },
  },
  watch: {
    data: {
      handler(newVal) {
        let option = {
          color: ["#13ce66", "#e5e5e5", "#ff4949"],
          tooltip: {
            trigger: "item",
            formatter: "{b} : {c}次 ({d}%)",
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
              data: newVal,
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
      deep: true,
      immediate: true,
    },
  },

  data() {
    return {
      option: {},
    };
  },
};
</script>
<style scoped>
.lineEcharts {
  height: 300px;
}
</style>
