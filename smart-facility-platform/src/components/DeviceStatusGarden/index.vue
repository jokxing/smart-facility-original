<template>
  <div class="outer">
    <div v-if="status !== -111">
      <div :style="{background: status === 1 || status === 0 ? '#10B89B': '#ef4d4e'}" class="circular"></div>
      <div :style="{background: status === 1 || status === 0 ? '#10B89B': '#ef4d4e'}" class="circular-center">
      </div>
      <div :style="{background: status === 1 || status === 0 ? '#10B89B': '#ef4d4e'}" class="circular-inner">{{ getSenorStatus(status, type)[0] }}</div>
    </div>
    <div v-else>
      <div style="background: #ef4d4e" class="circular"></div>
      <div style="background: #ef4d4e" class="circular-center"></div>
      <div style="background: #ef4d4e" class="circular-inner">{{ $t('common.abnormal') }}</div>
    </div>
  </div>
</template>

<script>
import { getSenorStatus } from "@/utils/methods"
export default {
  name: "index",
  props: {
    status: {
      type: Number,
      default: 1
    },
      type: {
        type: Number,
        default: 0
      }
  },
  data() {
    return {
      getSenorStatus
    }
  },
}
</script>

<style lang="less" scoped>
.outer {
  width: 120px;
  height: 120px;
  position: relative;
}

.circular {
  background: #EF4D4E;
  opacity: 0.08;
  position: absolute;
  z-index: 1;
}

.circular-center {
  width: 96px;
  height: 96px;
  background: #ef4d4e;
  opacity: 0.15;
  position: absolute;
  top: 12px;
  left: 12px;
  border-radius: 50%;
  z-index: 2;
}

.circular-inner {
  width: 76px;
  height: 76px;
  text-align: center;
  line-height: 75px;
  color: #FFFFFF;
  font-size: 22px;
  background: #EF4D4E;
  position: absolute;
  top: 22px;
  left: 22px;
  z-index: 3;
  border-radius: 50%;
}
</style>
