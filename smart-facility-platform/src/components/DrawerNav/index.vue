<template>
  <div class="mb-16 console-title clearfix">
    <div class="clearfix">
      <div class="ng-binding">▍ {{ name }}</div>
<!--      <div class="equipment_pdf" v-if="type === 1 || type === 13 || type === 16">-->
<!--        <el-link-->
<!--          v-if="url && url != ''"-->
<!--          type="primary"-->
<!--          :href="`${BASE_URL+url}`"-->
<!--          target="_blank"-->
<!--          :underline="false"-->
<!--        >{{ $t('hardware.outFactory') }}</el-link>-->
<!--        <el-link v-else type="info" :underline="false" disabled>{{ $t('hardware.outFactory') }}</el-link>-->
<!--      </div>-->
    </div>
    <div>
      <slot name="status"></slot>
      <el-button v-if="icon" type="text" @click="handleClose">
        <i class="el-icon-close"></i>
      </el-button>
    </div>
  </div>
</template>

<script>
import { getEquipmentStatusPdf } from "@/api/device";
import { BASE_URL } from "@/utils/constant.js";

export default {
  name: "index",
  data() {
    return {
      url: "",
      BASE_URL
    };
  },
  props: {
    deviceName: {
      type: [Number, String],
      default: ""
    },
    name: {
      type: String,
      default: ""
    },
    isWidth: {
      type: Boolean,
      default: true
    },
    icon: {
      type: Boolean,
      default: true
    },
    // 硬件1 设备2 房间3 移液枪管理器13 资产网关16
    type: {
      type: Number,
      default: null
    }
  },
  watch: {
    deviceName(newVal, oldVal) {
      this.deviceName = newVal;
      if (this.deviceName && this.deviceName != "") {
        getEquipmentStatusPdf({
          deviceName: this.deviceName
        }).then(res => {
          if (res.code == 1) {
            this.url = res.items;
          } else {
            // this.$message.error(res.message);
            this.url = null
          }
        });
      } else {
        this.url = null
        this.$message.error(this.$t('hardware.outNotFactory'));
      }
    }
  },
  methods: {
    handleClose() {
      this.$emit("handle");
    }
  }
};
</script>

<style lang="less" scoped>
@import "../../style/variable";

.mb-16 {
  margin-bottom: 16px;
}

.console-title {
  line-height: 30px;
}
.ng-binding {
  font-size: 20px;
  font-weight: @fwbold;
  color: @subjectColor;
}
.equipment_pdf {
  font-size: 15px;
  margin-left: 50px;
  font-weight: 600;
  color: #409eff;
}
</style>
