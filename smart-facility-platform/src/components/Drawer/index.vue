<template>
  <el-drawer
    title="抽屉"
    :visible.sync="drawerVisible"
    :with-header="false"
    :size="drawerWidth"
    append-to-body
    :modal="false"
    :modal-append-to-body="true"
    destroy-on-close
    :direction="direction"
    :before-close="handleDrawerClose"
    custom-class="drawer-default"
  >
    <slot></slot>
  </el-drawer>
</template>
<script>
import { mapMutations, mapState } from "vuex";
export default {
  data() {
    return {
      drawerWidth: "70%",
    };
  },
  props: {
    direction: {
      type: String,
      default: "rtl",
    },
  },
  computed: {
    ...mapState({
      drawerVisible: "drawerVisible",
    }),
  },
  methods: {
    ...mapMutations({
      handleDrawerClose: "DRAWERCLOSE",
    }),
  },
};
</script>
<style lang="less">
.drawer-default {
  .el-drawer__body {
    background: #F9F9F9;
  }
}
</style>
