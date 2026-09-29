<template>
  <div class="clearfix">
    <div v-for="item in data" :key="item.field">
      <circle-ring :item="item" :total="total"/>
    </div>
  </div>
</template>
<script>
import Echarts from "@/components/Echarts";
import {getinstrumentStatistics} from "@/api/labDevice";
import CircleRing from "@c/CircleProgress/index";
import i18n from "@/i18n";
let statusSet = [
  {
    name: i18n.t('labDevice.runing'),
    num: 0,
    field: "runCount",
    color: "#01CD9B"
  },
  {
    name: i18n.t('labDevice.standbyPower'),
    num: 0,
    field: "standbyCount",
    color: "#00B1FF"
  },
  {
    name: i18n.t('labDevice.standbyOff'),
    num: 0,
    field: "closeCount",
    color: "#FE5268"
  },
];
export default {
  name: "pieChatrs",
  components: {
    Echarts,
    CircleRing,

  },
  props: ["status"],
  data() {
    return {
      data: statusSet,
      option: {},
      total: 0,
    };
  },
  computed: {
    options() {
      return this.handleOptions();
    }
  },

  mounted() {
    this.getData();
  },
  watch: {
    status: function (value) {
      this.getData();
    }
  },
  methods: {
    handleOptions() {
      let {data} = this;
      let option = {
        grid: {
          top: 20,
          left: 0,
          right: 0,
          bottom: 0,
        },
        title: [],
        color: ["#13ce66", "#f2a645", "#000000", "#e5e5e5", "#ffd591"],
        series: [],
      };
      for (let i = 0; i < data.length; i++) {
        this.$set(option.title, i, {
          text: "{pp|" + data[i].name + "}",
          left: (i + 1) * 25 - 2 + "%",
          y: 0,
          textStyle: {
            fontSize: 15,
            rich: {
              pp: {
                fontWeight: "bold",
                fontSize: 15,
                width: "9",
                align: "left",
              },
            },
          },
        })
        this.$set(option.series, i, {
          name: i18n.t('labDevice.labDeviceStat'),
          type: "pie",
          center: [(i + 1) * 25 + "%", "55%"],
          radius: [70, 90],
          // x: i * 20 + '%', // for funnel
          label: {
            position: "center",
            formatter: "{d}%\n{c}台",
          },
          labelLine: {
            show: false,
          },
          data: [
            {
              name: data[i].name,
              value: data[i].num,
              label: {
                position: "center",
                fontSize: 20,
              },
            },
            {
              name: "",
              value: this.total - data[i].num,
              label: {
                show: false,
              },
              itemStyle: {
                color: "#d3d6df",
              },
            },
          ],
        })
      }
      return option;
    },
    async getData() {
      try {
        let result = await getinstrumentStatistics({});
        if (result.code === 1) {
          let items = result.items;
          let temp = [];
          for (let i = 0; i < statusSet.length; i++) {
            for (let j in items) {
              if (statusSet[i].field === j) {
                temp.push({
                  ...statusSet[i],
                  num: items[j],
                });
              }
            }
          }
          this.total = result.items.totalCount;
          this.data = temp;
        } else {
          this.total = 0;
          this.data = statusSet;
        }
      } catch (err) {
        this.total = 0;
        this.data = statusSet;
        throw err;
      }
    },
  },
};
</script>
<style scoped>
.pieChart {
  height: 240px;
}
</style>
