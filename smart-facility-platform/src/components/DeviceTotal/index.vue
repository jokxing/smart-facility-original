<template>
  <div class="total">
    <div :class="isType && object.deviceType.length ? 'total-height' : 'total-card'" class="totality cursor" @click="handleQueryAll()">
      <div class="float-left">
        <div class="total-title">{{ object.total.title }}</div>
        <div class="total-sum">
          <span class="num">{{ object.total.num }}</span>
          <span v-if="showUnit">{{ unit != '' ? unit : $t('common.individual') }}</span>
        </div>
      </div>
      <div class="total-img">
        <div class="image"></div>
      </div>
    </div>
    <div class="total-type">
      <div v-if="object['deviceType']" class="total-type-top">
        <div v-for="item in object.deviceType" :class="isTop === item.code ? 'is-active': ''" :key="item.code" class="type-list cursor"
             @click="handleQueryType(item.code)">
          <div class="type-list-num">
            <div class="type-list-num-title"  :title="item.name">{{ item.name }}</div>
            <div class="type-list-num-total">
              <span class="num">{{ item.count }}</span>
             <!-- <span>{{ unit != '' ? unit : $t('common.individual') }}</span> -->
            </div>
          </div>
          <div class="type-list-icon">
            <div class="type-icon">
              <i :class="handleDeviceTypeIcon(item.code)"></i>
            </div>
            <div class="type-line"></div>
          </div>
        </div>
      </div>
      <div class="total-type-bottom">
        <div v-for="item in object.overview" :key="item.title" :class="[handleStatus(item.status).color, isBottom === item.status ? 'is-active' : '', item.className]"
             class="bottom-type-list cursor"
             @click="handleQueryStatus(item.status, item)">
          <div class="type-list-num">
            <div class="type-list-num-title" :title="item.title">{{ item.title }}</div>
            <div class="type-list-num-total">
              <span class="num">{{ item.num }}</span>
              <span v-if="showUnit">{{ unit != '' ? unit : $t('common.individual') }}</span>
            </div>
          </div>
          <div v-if="item.tooltipText">
            <el-tooltip class="item" effect="dark" :content="item.tooltipText" placement="top">
              <i class="el-icon-warning-outline"></i>
            </el-tooltip>
          </div>
          <div v-else :class="handleStatus(item.status).iconColor" class="device-right-icon">
            <i :class="item.icon ? item.icon : handleStatus(item.status).icon"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

let defaultHeight;
export default {
  name: "index",
  props: {
    object: {
      type: Object,
      default: () => {
      }
    },
    isType: {
      type: Boolean,
      default: false
    },
    isType2: {
      type: Boolean,
      default: false
    },
    isHome: {
      type: Boolean,
      default: false
    },
    isGun: {
      type: Boolean,
      default: false
    },
    isAssetTag: {
      type: Boolean,
      default: false
    },
    unit: {
      type: String,
      default: ''
    },
    showUnit: {
      type: Boolean
    },
      // 是否是门磁
    isNotCamera: {
        type: Boolean,
        default: false
    }
  },
  data() {
    return {
      isTop: null,
      isBottom: null
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.handleResize();
      window.onresize = () => {
        this.handleResize();
      }
    })
  },
  updated() {
    this.handleResize();
  },
  methods: {
    handleResize() {
      const topElement = document.querySelector(".total-type-top");
      const bottomElement = document.querySelector(".total-type-bottom");
      const leftElement = document.querySelector(".totality");
      const marginBottom = document.querySelector(".bottom-type-list");
      const divMarginBottom = getComputedStyle(marginBottom, null);
      let rightElement = topElement ? topElement.clientHeight + bottomElement.clientHeight : bottomElement.clientHeight;
      if (rightElement === defaultHeight) {
        return;
      }
      defaultHeight = rightElement - divMarginBottom.marginBottom.toString().replaceAll("px", "");
      leftElement.style.height = defaultHeight + "px";
    },
    handleStatus(value) {
      if (!this.isHome) {
        if(this.isGun){
          switch (value) {
            case 0:
              return {color: "device-normal", icon: "icon-xianzhi", iconColor: "device-normal-icon"};
            case 1:
              return {color: "device-alarm", icon: "icon-shiyongzhong", iconColor: "device-alarm-icon"};
            case 2:
              return {color: "device-offline", icon: "icon-chaoshiweiguihuan", iconColor: "device-offline-icon"};
          }
        }else if(this.isType2){
          switch (value) {
            case 0:
              return {color: "device-not-monitoring", icon: "icon-equipment3", iconColor: "device-offline-icon"};
            case 1:
              return {color: "device-not-monitoring", icon: "icon-equipment4", iconColor: "device-offline-icon"};
            case 2:
              return {color: "device-not-monitoring", icon: "icon-equipment4", iconColor: "device-offline-icon"};
            case 3:
              return {color: "device-not-monitoring", icon: "icon-equipment2", iconColor: "device-offline-icon"};
            case -99:
              return {color: "device-not-monitoring", icon: "icon-equipment2", iconColor: "device-noActivated-icon"};
            case -100:
              return {color: "device-not-monitoring", icon: "icon-equipment4", iconColor: "device-offline-icon"};
          }
        }else{
          switch (value) {
              case 101:
                  return {color: "switch-bg", icon: "icon-switch-line", iconColor: "device-switch-icon"}
              case -99:
              return {color: "device-normal", icon: "icon-chaoshiweiguihuan", iconColor: "device-noActivated-icon"};
            case 1:
              return {color: "device-normal", icon: "icon-normal1", iconColor: "device-normal-icon"};
            case 2:
              return {color: "device-alarm", icon: "icon-alarm1", iconColor: "device-alarm-icon"};
            case -1:
              return {color: "device-alarm", icon: "icon-alarm1", iconColor: "device-alarm-icon"};
            case -100:
              return {color: "device-offline", icon: "icon-offline", iconColor: "device-offline-icon"};
            case 3:
              return {color: "device-not-monitoring", icon: "icon-equipment2", iconColor: "device-offline-icon"};
          }
        }
      } else {
        switch (value) {
          case -99:
            return {color: "device-normal", icon: "icon-chaoshiweiguihuan", iconColor: "device-noActivated-icon"};
          case 2:
            return {color: "default-bg", icon: "icon-camera1", iconColor: "default-status"};
          case 12:
            return {color: "default-bg", icon: "icon-Sprinkler-System", iconColor: "default-status"};
          case 13:
            return {color: "default-bg", icon: "icon-pipette", iconColor: "default-status"};
          case 14:
            return {color: "default-bg", icon: "icon-signal-reception", iconColor: "default-status"};
          case 7:
            return {color: "default-bg", icon: "icon-Audible-alarm", iconColor: "default-status"};
          case 8:
            return {color: "default-bg", icon: "icon-power-outage1", iconColor: "default-status"};
          case 10:
            return {color: "default-bg", icon: "icon-equipment5", iconColor: "default-status"};
          default:
            return {color: "default-bg", icon: "icon-equipment5", iconColor: "default-status"}
        }
      }
    },
    handleDeviceTypeIcon(value) {
      switch (value) {
        case 1:
          return "icon-temperature"
        case 2:
          return "icon-equipment1"
        case 3:
          return "icon-water"
        case 4:
          return "icon-eryanghuatan"
        case 7:
          return "icon-speed"
        case 5:
          return "icon-differential-pressure"
        case 6:
          return "icon-Oxygen-sensor1"
        case 8:
          return "icon-camera3"
      }
    },
    handleQueryAll() {
      this.isBottom = null;
      this.isTop = null;
      if(this.isGun){
        this.$emit("handleAll", null);
      }else{
        this.$emit("handleAll", 0);
      }
    },
    handleQueryType(value) {
      if (this.isHome) {
        this.isBottom = null;
      }
      this.isTop = value;
      this.$emit("change", value);
    },
    handleQueryStatus(value, item) {
      this.isBottom = value;
      if (this.isHome) {
        this.isTop = null;
      }
      if (this.isNotCamera) {
          this.$emit("handle", value, item);
      } else {
          this.$emit("handle", value);
      }

    }
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
  }
}
</script>

<style lang="less" scoped>
@import "../../style/deviceTotal";
</style>
