<template>
    <div>
        <ve-pie
            :colors="colors"
            :data="dataCharts"
            v-if="dataCharts.rows.length"
            :extend="options"
            :height="height"
            :loading="dataCharts.loading"
            :settings="settings"
            :title="title"
            :width="width"
        ></ve-pie>
        <data-empty :height="height" v-loading="dataCharts.loading" v-else/>
    </div>

</template>

<script>
import VePie from "v-charts/lib/pie.common"

require("echarts/lib/component/title");
import "v-charts/lib/style.css"
import DataEmpty from "@c/DataEmpty";

export default {
  name: "index",
  components: {
    VePie,
      DataEmpty
  },
  props: {
    dataCharts: {
      type: Object,
      default: null
    },
    colors: {
      type: Array,

    },
    titleText: {
      type: String,
      default: ""
    },
    width: {
      type: String,
      default: "100%"
    },
    height: {
      type: String,
      default: "350px"
    }
  },
  data() {
    this.settings = {
      limitShowNum: "10"
    }
    this.options = {
      legend: {
        right: 40,
        bottom: 20,
        orient: "vertical",
        // padding: [0,30,0,0]
      },
      series: {
        center: ["45%", "55%"],
        radius: 80,
        label: {
          show: true,
          formatter: "{b}: {d}%",
        }
      }
    }
    return {
      title: {
        textAlign: "left",
        text: "设备报警",
        top: 20,
        left: 20,
        textStyle: {
          fontSize: 16,
          fontWeight: "bold",
          lineHeight: 30,
          fontFamily: "Microsoft YaHei",
          color: "#555555"
        }
      }
    }
  },
  mounted() {
    this.title.text = this.titleText;
  }
}
</script>

<style lang="less" scoped>

</style>
