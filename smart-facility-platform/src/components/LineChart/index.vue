<template>
    <div>
        <ve-line
            :colors="colors"
            :data="dataCharts"
            v-if="dataCharts.rows.length"
            :extend="options"
            :loading="dataCharts.loading">
        </ve-line>
        <data-empty v-loading="dataCharts.loading" v-else/>
    </div>

</template>

<script>
import VeLine from "v-charts/lib/line.common"
import "v-charts/lib/style.css"
import DataEmpty from "@c/DataEmpty";

export default {
  name: "index",
  components: {
    VeLine,
    DataEmpty
  },
  props: {
    dataCharts: {
      type: Object,
      default: null
    },
    colors: {
      type: Array,
      default: () => {
      }
    },
    name: {
        type: String,
        default: ""
    }
  },
  data() {
      const _this = this;
    this.options = {
      legend: {
        show: false,
        top: 16
      },
        tooltip: {
          show: true,
            formatter: (params) => {
                return this.handleFormatter(params);
            }
        },
      yAxis: {
        axisLabel: {
          formatter: "{value} %"
        },
        minInterval: 1,
        max: function (value) {
          if (value.max >= 10) {
            const units = value.max % 10;
            return value.max - units + 10;
          } else {
            return value.max + 1;
          }
        }
      },
      series: {
          name: _this.name
      }
    }
    return {}
  },
    methods: {
        handleFormatter(params) {
            if (params.length === 1) {
                return '<div>'+ params[0].name +'</div><span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;left:5px;background-color:#1890ff"></span>' + params[0].seriesName + " : " + params[0].value[1];
            }
        }
    }
}
</script>

<style scoped>

</style>
