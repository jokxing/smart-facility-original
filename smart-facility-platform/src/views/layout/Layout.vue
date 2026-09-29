<template>
  <div>
    <div class="navbar-top clearfix">
      <navbar :menus="menus" />
    </div>
    <router-view></router-view>
  </div>
</template>
<script>
import Navbar from "@/views/layout/components/Navbar";
import { getRoleMenu } from "@/api/system";
import { mapMutations } from "vuex";
export default {
  name: "Layout",
  data() {
    return {
      menus: []
    }
  },
  components: {
    Navbar,
  },
  created() {
    this.getMenuListAsync();
  },
  methods: {
    ...mapMutations({
      setMenu: "SETMENU",
    }),
    async getMenuListAsync() {
      try {
        let result = await getRoleMenu();
        if (result.code == 1) {
          localStorage.setItem("MENU", JSON.stringify(result.items));
          this.menus = result.items;
          this.setMenu({ menu: JSON.stringify(result.items) });
        }
      } catch (err) {
        throw err;
      }
    },
  },
};
</script>

<style lang="less" scoped>
@import "../../../src/style/variable";
.navbar-top {
  height: 60px;
  line-height: 60px;
  background: @naColor;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.16);
  overflow: hidden;
  padding: 0 30px 0 30px;
}
</style>
