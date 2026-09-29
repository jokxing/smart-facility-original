<template>
  <el-drawer
      :before-close="handleClose"
      :modal="false"
      :visible.sync="isDrawer"
      :withHeader="false"
      v-loading="$store.state.loading"
      :element-loading-text="$t('common.hintDefault')"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
      size="70%">
    <template>
      <div class="detail-container" v-if="isDrawer">
        <DeviceModel :id.sync="id" ref="device" :titleType="10" @handleCloseDrawer="handleClose"></DeviceModel>
      </div>
    </template>
  </el-drawer>
</template>

<script>
import DeviceModel from "@c/DeviceModel/index";

export default {
  name: "SmartSocketDrawer",
  components: {
    DeviceModel
  },
  props: {
    isDrawer: {
      type: Boolean,
      default: true
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
  }
}
</script>
