<template>
  <div class="content">
    <SelfMenu v-if="isMenu" />
    <div :class="isMenu ? 'main-container' : (menuPath === '/ms/mapSet' ? 'main-container1': 'main-container-is-menu')">
       <app-main />
    </div>
  </div>
</template>

<script>
import AppMain from "./components/AppMain";
import SelfMenu from "./components/Slidebar.vue";
// 隐藏左侧菜单页面
const menu = {
    "/ms/mapSet": true,
}
export default {
  name: "SubLayout",
  components: {
    SelfMenu,
    AppMain,
  },
  data() {
    return {
      isMenu: false,
        menuPath: "",
    }
  },
  watch: {
    $route(){
        // console.log(menu[this.$route.path])
        this.menuPath = this.$route.path;
        this.isMenu = !menu[this.$route.path];
    }
  },
    created() {
        this.menuPath = this.$route.path;
        this.isMenu = !menu[this.$route.path];
    }
};
</script>
<style lang="less" scoped>
@import "../../../src/style/variable";
.content {
  width: 100%;
  height: calc(100vh - 60px);
  background: @background;
  display: flex;

  .main-container {
    width: calc(100vw - 240px);
    height: 100%;
    overflow: hidden;
    overflow-y: auto;
    padding: @normalInterval;
    position: relative;
  }
  .main-container-is-menu {
    width: 100vw;
      height: 100%;
      overflow-y: auto;
      padding: 20px;
  }
    .main-container1 {
        width: 100vw;
    }
}
</style>
