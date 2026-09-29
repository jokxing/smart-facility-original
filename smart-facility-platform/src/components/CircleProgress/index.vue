<template>
  <div class="svg-progress">
    <div class="clearfix row">
      <div class="svg-status">{{ item.name }}</div>
      <div class="svg-total">{{ $t('labDevice.labDeviceSum') }}：{{ total }}</div>
    </div>
    <div style="text-align: center">
      <svg-bar
          :options="options"
          :value="value">
        <div>22</div>
      </svg-bar>
    </div>
  </div>
</template>

<script>
import SvgBar from "svg-progress-bar";

export default {
  name: "index",
  components: {
    SvgBar
  },
  props: {
    item: {
      type: Object,
      default: () => {}
    },
    total: {
      type: Number,
      default: 0
    },
  },
  data() {
    const _this = this;
    return {
      value: 0,
      options: {
        radius: 100,
        text: function (value) {
          return '<div><span style="font-size: 0.65em;">' + this.htmlifyNumber(value) + '</span><span style="font-size: 0.35em;">%</span><div style="font-size: 0.315em;color: #666666">'+ _this.item.num +' </div></div>';
        },
        circleLineCap: 'round',
        varyStrokeArray: [10, 15],
        textColor: '#00B1FF',
        pathColors: ['#EEE', "#00B1FF"]
      }
    }
  },
  created() {
    this.$set(this.options.pathColors, 1, this.item.color);
    this.options.textColor = this.item.color;
    if (window.screen.width > 1920) {
      this.options.radius = 125;
      this.options.varyStrokeArray = [20, 30];
    } else if (window.screen.width === 1920) {
      this.options.radius = 100;
      this.options.varyStrokeArray = [15, 25];
    } else if (window.screen.width >1280){
      this.options.radius = 85;
      this.options.varyStrokeArray = [10, 20];
    } else {
      this.options.radius = 65;
      this.options.varyStrokeArray = [10, 15];
    }
  },
  mounted() {
    const circlesArray = document.querySelectorAll(".circles-text");
    if (circlesArray.length === 3) {
      for (let i = 0; i < circlesArray.length; i++) {
        const item = circlesArray[i];
        item.style.lineHeight = 1.2;
        item.style.left = "50%";
        item.style.top = "50%";
        item.style.width = "";
        item.style.height = "";
        item.style.transform = "translate(-50%, -70%)";
      }
    }
  },
  updated() {
    this.value = this.item.num * 100 / this.total;
  }
}
</script>

<style lang="less" scoped>
.svg-progress {
  width: 520px;
  height: 300px;
  background: #FFFFFF;
  padding: 20px 30px;
  border-radius: 8px;

  .svg-status {
    font-size: 16px;
    font-weight: bold;
    color: #555555;
    line-height: 30px;
  }

  .svg-total {
    font-size: 12px;
    font-weight: 400;
    color: #8A8FAF;
    line-height: 30px;
  }
}
</style>
