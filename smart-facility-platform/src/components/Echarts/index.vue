<template>
  <div class="echarts" ref="echarts"></div>
</template>
<script>
let echarts = require("echarts/lib/echarts");
require("echarts/lib/chart/line");
require("echarts/lib/chart/bar");
require("echarts/lib/chart/pie");
require("echarts/lib/component/tooltip");
require("echarts/lib/component/title");
require("echarts/lib/component/markLine");
require("echarts/lib/component/legend");
export default {
  name: "echarts",
  props: {
    option: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      chart: null,
    };
  },

  watch: {
    option: {
      handler(newVal, oldVal) {
        if (this.chart) {
          if (newVal) {
            this.chart.setOption(newVal);
          } else {
            this.chart.setOption(oldVal);
          }
        } else {
          this.initEcharts();
        }
      },
      deep: true,
    },
  },

  mounted() {
    this.$nextTick(() => {
      this.initEcharts();
      window.addEventListener("resize", this.resize);
      // on(window, "resize", this.resize);
    });
  },

  methods: {
    resize() {
      this.chart.resize();
    },
    initEcharts() {
      this.chart = echarts.init(this.$refs.echarts);
      this.chart.setOption(this.option);
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
};
</script>
<style scoped>
.echarts {
  height: 100%;
}
</style>
