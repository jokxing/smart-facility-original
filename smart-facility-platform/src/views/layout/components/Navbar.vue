<template>
    <div class="midden-area">
        <div class="a">
            <div class="navbar-logo" @click="$router.push('/dashboard')">
                <img v-if="$store.state.logoUrl" alt="" :src="BASE_URL + $store.state.logoUrl"/>
                <img v-else alt="" src="../../../../src/assets/systemImages/logo.png"/>
<!--                <h3 class="navbar-title">{{ title }}</h3>-->
            </div>
            <div class="top-navigation">
                <el-menu
                    :default-active="activeIndex"
                    active-text-color="#FABC43"
                    mode="horizontal"
                    @select="handleMenuSelect"
                >
                    <el-menu-item
                        v-for="(item, index) in menus"
                        :key="index"
                        :index="item.id"
                    >
                        <a
                            @click="handlePath(item.path)"
                        >{{ $t('route.' + item.englishName) }}</a
                        >
                    </el-menu-item>
                </el-menu>
            </div>
        </div>
        <div class="a right-menu">
            <div class="schedule-img margin-small-right" :class="{'ring': items.activitiUnread}">
                <el-popover
                    placement="bottom"
                    v-model="scheduleShow"
                    @hide="handleHide"
                    trigger="click">
                    <schedule @close="handleStopHide"/>
                    <el-button
                        slot="reference"
                        type="text">
                        <i class="icon-daiban"></i>
                    </el-button>
                </el-popover>
            </div>
            <div class="schedule-img margin-small-right" :class="{'ring': items.notifyUnread}">
                <el-popover
                    placement="bottom"
                    @hide="handleHide(1)"
                    v-model="messageShow"
                    trigger="click">
                    <message-notification @close="handleStopHide"/>
                    <el-button
                        slot="reference"
                        type="text">
                        <i class="icon-tongzhi"></i>
                    </el-button>
                </el-popover>
            </div>
            <el-dropdown trigger="click" @command="handleCutLang">
                  <span class="el-dropdown-link ft24">
                    {{ languageName }}<i class="el-icon-arrow-down el-icon--right"></i>
                  </span>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="zh">中文</el-dropdown-item>
                    <el-dropdown-item command="en">English</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
            <el-dropdown trigger="click" @command="handleCommand">
                <div class="avatar-wrapper">
                    <el-avatar :src="url"/>
                    <span>{{ name }}</span>
                    <i class="icon-down"></i>
                </div>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="/sys/user">{{ $t("route.sysUser") }}</el-dropdown-item>
                    <el-dropdown-item v-if="$store.state.level" command="/sys/base">
                        {{ $t("route.sysbase") }}
                    </el-dropdown-item>
                    <el-dropdown-item command="3" divided>{{ $t("login.logout") }}</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
<!--        <schedule v-if="scheduleShow"/>-->
<!--        <message-notification v-if="messageShow"/>-->
    </div>
</template>
<script>
import {getLang, logout} from "@/api/login";
import store from "@/store"
import Schedule from "@c/Schedule";
import MessageNotification from "@c/MessageNotification";
import {getActivitiUnread} from "@/api/activiti";
import {getCompanyGetLogo} from "@/api/system";
import {BASE_URL} from "@/utils/constant";
const lang = {
    "zh": "中文",
    "en": "English",
}
let time = null;
export default {
    name: "Navbar",
    components: {
        Schedule,
        MessageNotification
    },
    props: {
        menus: {
            type: Array,
            default: () => [],
        }
    },
    data() {
        return {
            title: '楚秀科技',
            url: require("../../../assets/bashboard/head-portrait.png"),
            name: localStorage.getItem("username"),
            activeIndex: "lhd",
            loginId: JSON.parse(localStorage.getItem("USERINFO")).loginId,
            scheduleShow: false,
            scheduleShow1: false,
            messageShow: false,
            messageShow2: false,
            items: {
                activitiUnread: false,
                notifyUnread: false
            },
            index: 0,
            languageName: "中文",
            logoUrl: "",
            BASE_URL
        };
    },
    created() {
        getCompanyGetLogo().then(res => {
            if (res['items']) {
                this.$store.commit("setLogoUrl", res.items.logoUrl)
            }
        })
    },
    mounted() {
        var _this = this;
        
        // 监听localStorage
        this.resetSetItem();
        window.addEventListener('setItemEvent', function(e) {
            if(e.key === 'username'){
                _this.name = e.newValue
            }
        })

        this.logoUrl = localStorage.getItem("USERINFO")
        if (localStorage.getItem("lang")) {
            this.languageName = lang[localStorage.getItem("lang")];
            const lang1 = localStorage.getItem("lang") === 'en' ? 2 : 1;
            this.handleLang(lang1);
        } else {
            this.handleLang(1);
        }
        this.activeIndex = localStorage.getItem("menuKey");
        if (localStorage.getItem("MENU")) {
            const menu = JSON.parse(localStorage.getItem("MENU"))
            for (let i = 0; i < menu.length; i++) {
                if (this.$route.path.indexOf(menu[i].id + '/') > 0) {
                    this.activeIndex = menu[i].id
                }
            }
        }
        this.handleGetActivityUnread();
        new Promise(resolve => {
            time = setInterval(() => {
                this.handleGetActivityUnread();
                resolve(true);
            }, 15000)
        }).then(res => {
        })
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
        handleGetActivityUnread() {
            getActivitiUnread().then(res => {
                if (res.code) {
                    this.items = res.items;
                }
            })
        },
        handleStopHide(type, val) {
            if (type) {
                this.messageShow2 = val;
                return
            }
            this.scheduleShow1 = val;
        },
        handleHide(type) {
            if (this.scheduleShow1) {
                this.scheduleShow = true;
                this.scheduleShow1 = false;
                return false;
            }
            if (type && this.messageShow2) {
                this.messageShow = true;
                this.messageShow2 = false;
                return false;
            }
        },
        handleCommand(e) {
            if (e == 3) {
                logout().then((res) => {
                    if (res.code) {
                        let path = "/login";
                        const runpengId = JSON.parse(localStorage.getItem("USERINFO")).companyId;
                        if (runpengId == 189) {
                            path = "/runpeng/login"
                        }
                        localStorage.clear();
                        this.$message.success(this.$t('login.logoutMessage'));
                        setTimeout(() => {
                            this.$router.push(path);
                        }, 1500)
                    }
                });
            } else {
                localStorage.setItem("menuKey", "sys");
                this.$store.commit("SETMENUKEY", "sys");
                this.$router.push(e);
            }
        },
        handleMenuSelect(key) {
            this.activeIndex = key;
            this.$store.commit("SETMENUKEY", key);
            localStorage.setItem("menuKey", key);
        },
        handlePath(val) {
            if (val.indexOf("gateway") !== -1 && store.state.level === 0) {
                this.$router.push("/lhd/device");
            }else {
                this.$router.push(val);
            }
        },
    },
    watch: {
        $route(to, from) {
            const menu = JSON.parse(localStorage.getItem("MENU"))
            for (let i = 0; i < menu.length; i++) {
                if (to.path.indexOf(menu[i].id + '/') > 0) {
                    this.activeIndex = menu[i].id
                }
            }
        },
        menus(val) {
            for (let i = 0; i < val.length; i++) {
                if (this.$route.path.indexOf(val[i].id + '/') > 0) {
                    this.activeIndex = val[i].id
                }
            }
        }
    },
    beforeDestroy() {
        clearInterval(time)
    }
};
</script>
<style lang="less" scoped>
@import "../../../style/variable";

.schedule-img {
    width: 40px;
    height: 40px;
    position: relative;
    cursor: pointer;

    [class^="icon-"], [class*=" icon-"] {
        font-size: 24px;
        color: #FFFFFF;
    }
}

.ring::before {
    content: "";
    width: 10px;
    height: 10px;
    position: absolute;
    top: 15px;
    right: 10px;
    display: block;
    background-color: #e76278;
    z-index: 999;
    border-radius: 50%;
}

.midden-area {
    width: 100%;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;

    .top-navigation > .el-menu {
        display: flex;
        flex-wrap: wrap;
        border-right: none;
        background: @naColor;
        margin-left: 8px;

        .el-menu-item {
            font-size: @font16;
            padding: 0;
            margin: 0 @normalInterval;

            a {
                color: @white;
                padding: @normalInterval 0;
            }
        }

        .el-menu-item.is-active {
            border-bottom-left-radius: 2px;
            border-bottom-right-radius: 2px;

            a {
                color: @await;
            }
        }

        .el-menu-item:hover {
            background: @naColor;

            a {
                color: @await;
            }
        }

        /deep/ .el-menu-item:focus-within, .el-menu-item:hover {
            background: @naColor;
        }
    }

    .el-menu.el-menu--horizontal {
        border: none;
    }
}

.midden-area > .a {
    display: flex;
}

.navbar-logo {
    width: 220px;
    display: flex;
    align-items: center;
    text-align: center;
    cursor: pointer;

    img {
        width: auto;
        height: 30px;
    }
}
.ft24 {
    color: #FFFFFF;
}
.navbar-title {
    font-size: 26px;
    font-weight: bold;
    color: @white;
    line-height: 26px;
}

.right-menu {
    height: 100%;
    padding: 0 16px;
    cursor: pointer;

    .avatar-wrapper {
        color: @white;
        display: flex;
        align-items: center;

        span {
            margin: 0 8px;
        }

        i {
            margin-left: 8px;
        }
    }

    .avatar-wrapper:hover {
        .el-icon-caret-bottom {
            color: @blue;
        }
    }
}

.el-menu--horizontal > .el-menu-item.is-active {
    position: relative;

    &::before {
        position: absolute;
        content: "";
        width: 100%;
        height: 4px;
        border-radius: 8px;
        background-color: @await;
        left: 0;
        top: 56px;
    }
}
</style>
