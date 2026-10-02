<template>
  <div>
    <el-row justify="space-between" type="flex">
      <div class="flex">
        <slot name="left"></slot>
        <div class="charts-type" v-if="isShow">
          <el-button :class="{'is-active':interval === item.index, mini}" v-for="(item,index) in intervalType" :key="index" @click="handleInterval(item.index)" :type="item.type ? item.type: ''">{{ item.label }}</el-button>
        </div>
          <slot name="leftRight"></slot>
      </div>

      <div class="charts-type">
        <el-button v-for="item in dimensionType" :key="item.INTERVAL"
                   :class="{'is-active': type == item.INTERVAL, mini}" @click="handleCutSensor(item.INTERVAL)">
          {{ item.LABEL }}
        </el-button>
        <el-date-picker
            v-model="equipmentDate"
            class="picker"
            type="datetimerange"
            size="mini"
            :range-separator="$t('common.most')"
            :start-placeholder="$t('common.startDate')"
            :end-placeholder="$t('common.endDate')"
            @change="handleEquipmentData"
            align="right"
            :default-time="defaultTime">
        </el-date-picker>
        <slot name="right"></slot>
      </div>
    </el-row>
  </div>
</template>

<script>
import {TIME_DIMENSION} from "@/utils/constant";
import CustomTime from "@/components/CustomTime"
import i18n from "@/i18n";
export default {
  name: "index",
  components: {
    CustomTime
  },
  props: {
    type: {
      type: [String,Number],
      default: 2
    },
    interval: {
      type: [String, Number],
      default: 0
    },
    isShow: {
      type: Boolean,
      default: true
    },
    intervalType: {
      type: Array,
      default: () => {
        return [
          {index: 0, label: i18n.t('hardware.duration')},
          {index: 1, label: i18n.t('labDevice.degree')},]
      }
    },
    dimensionType: {
      type: Array,
      default: () => {
        return TIME_DIMENSION
      }
    },
    mini: {
      type: String,
      default: ""
    },
    defaultTime: {
      type: Array,
      default: () => {
          return ['00:00:00', '00:00:00']
      }
    }
  },
  data() {
    return {
      active: 2,
      equipmentDate: "",
      lastEmittedRangeKey: ""
    }
  },
  created() {
  },
  watch: {
    type: {
      handler(val) {
        console.log(val)
      },
      deep: true
    }
  },
  methods: {
    rangeEmitKey(value) {
      if (!Array.isArray(value) || value.length < 2) {
        return "";
      }
      return value.map(item => {
        if (item == null || item === "") return "";
        const ms = item instanceof Date ? item.getTime() : Number(new Date(item));
        return Number.isFinite(ms) ? String(ms) : String(item);
      }).join("|");
    },
    handleCutSensor(e) {
      this.equipmentDate = "";
      this.lastEmittedRangeKey = "";
      this.$emit("handle", e);
    },
    handleInterval(e) {
      this.$emit("change", e);
    },
    handleEquipmentData() {
      const key = this.rangeEmitKey(this.equipmentDate);
      if (key === this.lastEmittedRangeKey) {
        return;
      }
      this.lastEmittedRangeKey = key;
      this.active = "";
      this.$emit("handleTime", this.equipmentDate);
    }
  }
}
</script>

<style lang="less" scoped>
.picker {
    width: 280px;
  margin-left: 8px !important;
}

/deep/.el-date-editor.is-active {
  background: #FFFFFF;
  border: 1px solid #3F51B5;
}
.mini {
    height: 30px !important;
    padding: 8px !important;
}
/deep/.el-range-editor--mini.el-input__inner {
    background: #F4F4F9;
    height: 30px;
}
</style>
