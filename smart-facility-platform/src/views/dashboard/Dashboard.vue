<template>
  <div class="bg-color">
    <div class="bg-img">
      <img src="../../../src/assets/bashboard/bg.png" alt="">
    </div>
    <div class="home-container">
      <div class="navbar">
          <el-dropdown trigger="click" @command="handleCutLang">
                  <span class="el-dropdown-link ft24">
                    {{ languageName }}<i class="el-icon-arrow-down el-icon--right"></i>
                  </span>
              <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="zh">中文</el-dropdown-item>
                  <el-dropdown-item command="en">English</el-dropdown-item>
              </el-dropdown-menu>
          </el-dropdown>
        <div class="left-logo">
          <div>
            <el-avatar :src="url"/>
          </div>
        </div>

        <div class="right-menu">
          <el-dropdown trigger="click" @command="handleDropdownMenu">
            <div class="avatar-wrapper">
              <div class="company-title">{{ companyName ? companyName : "智慧设施" }}</div>
              <i class="icon-down"></i>
            </div>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="/sys/user">{{ $t("route.sysUser") }}</el-dropdown-item>
              <el-dropdown-item v-if="$store.state.level" command="/sys/base">{{ $t("route.sysbase") }}</el-dropdown-item>
              <el-dropdown-item command="3" divided>{{ $t("login.logout") }}</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
      <div class="bashboard-session">
        <img alt="" class="logo" src="../../../src/assets/systemImages/facility-logo.svg"/>
        <div class="title">
          <span class="facility-title" v-if="languageName == '中文'">智慧设施智能监控平台</span>
          <span class="facility-title" v-else>Smart Facility Monitoring</span>
        </div>
        <div class="session-t">
          <div class="box-button">
            <div
                v-for="(item, index) in menuList"
                :key="item.id"
                class="grid-content btn-3d-roll">
              <div class="div-a" @click="handleForward(item.id, item.path, index)">
                <div class="home-icon">
                  <img :src="item.icon" alt=""/>
                </div>
                <div class="subText">{{ item.name }}</div>
              </div>
              <div class="div-a" @click="handleForward(item.id, item.path, index)">
                <div class="home-icon">
                  <img :src="item.icon" alt=""/>
                </div>
                <div class="subText">{{ item.name }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="copyright">Copyright © {{ $t('other.copyright') }}</div>
        <div class="version">{{ $t('other.version') }}：{{version}}</div>
      <particles/>
      <disc-container :data="overview"/>
    </div>
  </div>
</template>
<script>
import Particles from "./components/Particles";
import DiscContainer from "@/views/dashboard/components/DiscContainer";
import {getLang, logout} from "@/api/login";
import {menuList, shebei1, shebei2} from "@/utils/menuManager";
import {getEquipmentDashboard} from "@/api/device";
import store from "@/store";
const lang = {
    "zh": "中文",
    "en": "English",
}
export default {
  name: "Dashboard",
  components: {
    DiscContainer,
    Particles,
  },
  data() {
    return {
      menuList: [],
      overview: {
        total: 0,
        alarmCount: 0,
        poor: 0,
      },
      companyName: "",
      url: require("../../assets/bashboard/head-portrait.png"),
      languageName: "中文",
        version: "1.0.0"
    };
  },
    created() {
      this.version = process.env.VUE_APP_VERSION;
        console.log(this.version)
    },
    mounted() {
      if (localStorage.getItem("lang")) {
          this.languageName = lang[localStorage.getItem("lang")]
          const lang1 = localStorage.getItem("lang") === 'en' ? 2 : 1;
          this.handleLang(lang1);
      } else {
          this.handleLang(1);
      }
    let menus = menuList.slice(0, -1);
    menus.unshift({
      id: "ccm",
      name: this.$t('route.map'),
      icon: require("../../assets/bashboard/icon-map.png"),
      path: "/building",
    });
    this.menuList = menus;
    const loginId = JSON.parse(localStorage.getItem("USERINFO")).loginId;
    // 获取记录仪总数计算分差
    getEquipmentDashboard({equipmentType: 0}).then((res) => {
      const {alarmCount, total} = res.items;
      this.overview = {
        alarmCount,
        total,
      };
      this.overview.poor = total > 0 ? 100 - Math.ceil((alarmCount / total) * 100) : 0;
    });
    this.companyName = JSON.parse(localStorage.getItem("USERINFO")).companyName;

  },
  methods: {
      handleLang(lang) {
          getLang({code: lang}).then(res => {

          })
      },
      handleCutLang(type) {
          localStorage.setItem('lang', type);
          window.location.reload();
      },
    handleDropdownMenu(e) {
      if (e == 3) {
        logout().then((res) => {
          if (res.code) {
            let path = "/login";
            localStorage.clear();
            this.$message.success("退出登录成功，正在跳至首页……");
            setTimeout(() => {
              this.$router.push(path);
            }, 1500)
          }
        });
      } else {
        localStorage.setItem("menuKey", "sys");
        this.$router.push(e);
      }
    },
    handleForward(id, path, index) {
      // 改用户为普通用户时
      if (!(index <= 3) && store.state.level === 0) {
        localStorage.setItem("menuKey", id);
        this.$store.commit("SETMENUKEY", id);
        return this.$router.push("/sys/user");
      }
      localStorage.setItem("menuKey", id);
      this.$store.commit("SETMENUKEY", id);
      this.$router.push({path})
    },
  },
};
</script>
<style lang="less">
@import "../../style/bashboard.less";
.ft24 {
    color: #FFFFFF;
    margin-right: 8px;
}
</style>
