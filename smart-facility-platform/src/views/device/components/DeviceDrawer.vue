<template>
  <el-drawer
      :before-close="handleClose"
      :modal="false"
      :visible.sync="isDrawer"
      :withHeader="false"
      v-loading="$store.state.loading"
      element-loading-text="拼命加载中"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
      size="70%">
    <template>
      <div class="detail-container" v-if="isDrawer">
        <DeviceModel  ref="device" :id.sync="id" @handleCloseDrawer="handleClose"></DeviceModel>
      </div>
    </template>
  </el-drawer>
</template>

<script>
import DeviceModel from "@c/DeviceModel/index";

export default {
  name: "DeviceDrawer",
  components: {
    DeviceModel,
  },
  props: {
    isDrawer: {
      type: Boolean,
      default: false
    },
    id: {
      type: [String, Number],
      default: null,
    },
  },
  data() {
    return {
      device: {}
    }
  },
  methods: {
    handleClose() {
      this.$emit("update:isDrawer", false);
    },
  },
}
</script>
