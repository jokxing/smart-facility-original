<template>
  <div class="box">
    <template v-for="item in list">
      <el-submenu
        v-if="item.children && item.children.length > 0"
        :key="item.id"
        :index="`${item.id}-menu`"
      >
        <template slot="title">
          <i class=""></i>
          <span>{{ item.name }}</span>
        </template>
        <SubMenu :list="item.children"></SubMenu>
      </el-submenu>

      <el-menu-item v-else :key="item.id" :index="`${item.id}-menu`">
        <template slot="title">
          <i class=""> </i>
          <span>{{ item.name }}</span>
        </template>
      </el-menu-item>
    </template>
  </div>
</template>
<script>
import SubMenu from "@/views/system/components/SubMenu.vue";
export default {
  name: "SubMenu",
  components: {
    SubMenu,
  },
  props: {
    list: {
      type: Array,
      default: () => [],
    },
    mode: {
      type: String,
      default: "horizontal",
    },
  },
  data() {
    return {};
  },
};
</script>>
<style lang="less" scoped>
</style>
