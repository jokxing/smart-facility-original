<!-- 分类 -->
<template>
    <transition name="moveL">
    <div class="select-asset-class" v-if="drawer">
        <el-row type="flex" justify="end">
            <el-button type="text" @click="handleClose"><i class="el-icon-close" style="color: #777777"></i></el-button>
        </el-row>
        <div class="left-top">
            <p :title="companyName" class="icon-building1">
                {{ companyName ? companyName : "智慧设施" }}
            </p>
        </div>
        <div class="scrollbar">
            <Tree
                ref="Tree"
                :show="false"
                v-loading="treeLoading"
                :default-array="defaultOpenArray"
                :node-key="'id'"
                :selected-tree-node-key.sync="selectedKey"
                :treeData="companyNames"
                :treeProps="props"
                @getId="handleCutItem"
            />
        </div>
    </div>
    </transition>
</template>

<script>
import Tree from "@/views/mapSettings/components/MapSetTree";
import {mapActions} from "vuex";
export default {
    name: "index",
    components: {
        Tree
    },
    data() {
        return {
            props: {
              value: "id",
              label: "name",
              children: "childrenList"
            },
            drawer: false,
            treeLoading: false,
            defaultOpenArray: [],
            selectedKey: "",
            companyNames: [],
            companyObject: {
                gardenName: "",
                gardenId: "",
                buildingName: "",
                buildingId: "",
                floorName: "",
                floorId: "",
            },
            companyName: "",
        }
    },
    methods: {
        handleClose() {
            this.drawer = false;
        },
        handleCutItem(object) {
            this.$emit("handle", object);
        },
        ...mapActions(["getAccessClassify"]),
        open(id) {
            this.drawer = true;
            this.companyName = JSON.parse(localStorage.getItem("USERINFO")).companyName;
            this.companyNames = this.$store.state.assetClassify;
            if (id) {
                this.defaultOpenArray = [id];
                this.selectedKey = id;
            }

        }
    }
}
</script>

<style lang="less" scoped>
.select-asset-class {
    height: calc(100vh - 60px);
    width: 240px;
    position: fixed;
    top: 60px;
    left: 0;
    background: #FFFFFF;
    padding: 0 20px;

    .left-top {
        p {
            width: 100%;
            font-weight: bold;
            color: #303F9F;
            line-height: 30px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
    }

    .scrollbar {
        height: calc(100% - 140px);
        overflow: hidden;
        overflow-y: auto;
    }
}

.moveL-enter-active,
.moveL-leave-active {
    transition: all 0.3s linear;
    transform: translateX(0%);
}
.moveL-enter,
.moveL-leave {
    transform: translateX(-100%);
}
.moveL-leave-to {
    transform: translateX(-100%);
}
</style>