<template>
  <div class="drawer">
    <el-drawer
        :before-close="handleClose"
        :modal="false"
        :visible.sync="isDrawer"
        size="70%"
        :withHeader="false">
      <div class="detail-container">
        <Module v-if="isDrawer" @handleCloseDrawer="handleClose" :id="id"></Module>
      </div>
    </el-drawer>
  </div>
</template>
<script>
import Module from "@/views/gateway/components/Module";

export default {
  name: "GatewayDrawer",
  components: {
    Module,
  },
  props: {
    isDrawer: {
      type: Boolean,
      default: true
    },
    id: {
      type: String,
      default: null
    },
  },
  methods: {
    handleClose() {
      this.$emit("handleCloseDrawer", false);
    }
  }
}
</script>
