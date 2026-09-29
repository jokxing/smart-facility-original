<template>
  <el-drawer
      :before-close="handleClose"
      :direction="direction"
      :modal="false"
      :visible.sync="isDrawer"
      :withHeader="false"
      size="70%">
    <div v-if="isDrawer" class="detail-container">
      <RoomModule
          @handleCloseDrawer="handleClose"
          :id.sync="roomId" ref="Module">
      </RoomModule>
    </div>
  </el-drawer>
</template>

<script>
import RoomModule from "@/views/room/components/RoomModule";

export default {
  name: "RoomDrawer",
  components: {
    RoomModule,
  },
  props: {
    roomId: {
      type: [Number, String],
      default: null
    },
    isDrawer: {
      type: Boolean,
      default: true
    },
    direction: {
      type: String,
      default: "rtl"
    }
  },
  data() {
    return {
      loading: false,
    }
  },
  methods: {
    handleClose() {
      this.$emit("update:isDrawer", false)
    },

  }
}
</script>

<style lang="less" scoped>
.drawer {
  top: 0;
}
</style>
