<template>
    <div class="menu">
        <el-menu
            :collapse="isCollapse"
            :default-active="activeMenu"
            :router="true"
            class="el-menu-vertical-demo">
            <template v-for="item in subMenu">
                <el-submenu v-if="item.subMenu.length > 0" :index="item.path">
                    <template slot="title">
                        <i class="sub-icon" :class="item.icon"></i>
                        <span slot="title" class="sub-title">{{ $t('route.' + item.englishName) }}</span>
                    </template>
                    <el-menu-item-group v-if="item.subMenu.length">
                        <el-menu-item
                            v-for="sub in item.subMenu"
                            :key="sub.path"
                            :index="sub.path"
                            @click="handle(sub.path)">
<!--                            <i :class="sub.icon"></i>-->
                            <span slot="title">{{ $t('route.' + sub.englishName) }}</span>
                        </el-menu-item>
                    </el-menu-item-group>
                </el-submenu>
                <el-menu-item
                    v-else
                    :key="item.path"
                    :index="item.path"
                    @click="handle(item.path)">
                    <i :class="item.icon"></i>
                    <span slot="title">{{ $t('route.' + item.englishName) }}</span>
                </el-menu-item>
            </template>
        </el-menu>
        <div class="sidebar-bottom"></div>

    </div>
</template>

<script>
import {mapState} from "vuex";

const menuArray = require("@/utils/menuManager").menuList;
let routeLast = "";
export default {
    name: "Slidebar",
    inject: ["reload"],
    data() {
        return {
            subMenu: [],
            sidebar: {opened: true},
            permission_routes: {},
        };
    },
    computed: {
        ...mapState({
            menu: "menu",
        }),

        menuList: {
            get: function () {
                if (this.menu) return JSON.parse(this.menu);
                return [];
            },
        },
        activeMenu() {
            const route = this.$route;
            const {path} = route;
            let str = path;
            if (path.indexOf("/apply/asset/process") !== -1) {
                str = "/apply/asset/process";
            }
            if (path.indexOf("/apply/approval/process") !== -1) {
                str = "/apply/approval/process";
            }
            if (path.indexOf("/lhd/pipetteGun") !== -1) {
                str = "/lhd/pipetteGun";
            }
            if (path.indexOf("/apply/assetCount") !== -1) {
                str = "/apply/assetCount";
            }
            return str;
        },
        isCollapse() {
            return !this.sidebar.opened;
        },
        subMenuChange() {
            let {menuList, $route} = this;
            return {
                menuList,
                $route,
            };
        },
    },
    watch: {
        subMenuChange: {
            handler(newVal) {
                const loginId = JSON.parse(localStorage.getItem("USERINFO")).loginId;
                let {$route, menuList} = newVal;
                // console.log($route)
                let temp = [];
                let url = $route.path;

                for (const item of menuList) {
                    if (url.indexOf(item.id) !== -1) {
                        temp = item.subMenu;
                        break;
                    }
                }

                this.subMenu = temp;
            },
            immediate: true,
        },
    },
    methods: {
        handle(path) {
            if (routeLast === path) {
                this.reload();
            } else {
                routeLast = path;
            }
        }
    }
};
</script>

<style lang="less" scoped>
@import "../../../style/variable";

::-webkit-scrollbar {
    width: 0 !important;
    height: 0 !important;
}

.menu {
    width: 240px;
    min-width: 200px;
    height: 100%;
    background: @white;
    box-shadow: 3px 3px 6px 0 rgba(39, 53, 103, 0.08);
    border-radius: 0 10px 10px 0;
    overflow-y: scroll;

    .el-menu {
        width: 100%;
        border: none;
        background: @white;
        margin-top: 20px;
    }

    .el-menu-item {
        width: 220px;
        height: 50px;
        line-height: 45px;
        margin-left: 10px;
        margin-bottom: 15px;
        color: @555;
        border-radius: 6px;
        font-size: @font14;
        padding: 0 0 0 20px !important;

        i {
            color: @555;
            font-size: 18px;
        }

        span {
            margin-left: 16px;
        }
    }
    .el-submenu {
        width: 220px;
        line-height: 40px;
        margin-left: 10px;
        margin-bottom: 15px;
        color: @555;
        border-radius: 6px;
        font-size: @font14;
        padding: 0 0 0 0 !important;
        i {
            color: @555;
            font-size: 18px;
        }

        span {
            margin-left: 16px;
        }

        .el-menu-item {
            width: 200px;
            height: 50px;
            line-height: 45px;
            margin-left: 10px;
            margin-bottom: 15px;
            color: @555;
            border-radius: 6px;
            font-size: @font14;
            padding: 0 0 0 20px !important;

            i {
                color: @555;
                font-size: 18px;
            }

            span {
                margin-left: 16px;
            }
        }
    }
    /deep/.el-submenu__title:hover {
        border-radius: 6px;
        background: @subjectColor;

        .sub-title {
            color: @white;
        }
        .sub-icon {
            color: @white;
        }
        /deep/.el-icon-arrow-down {
            color: @white !important;
        }
    }
}

.el-menu-item.is-active {
    background: @subjectColor !important;
    color: @white !important;

    i {
        color: @white !important;
    }
}

.el-menu-item:hover {
    background: @subjectColor !important;
    color: @white !important;

    i {
        color: @white !important;
    }
}
</style>
