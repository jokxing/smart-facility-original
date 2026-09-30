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
                :selected-tree-node-key.sync="selectedKey"
                :treeData="companyNames"
                @getId="handleCutItem"/>
        </div>
    </div>
    </transition>
</template>

<script>
import Tree from "@/views/mapSettings/components/MapSetTree";
import {getMapGardenList} from "@/api/mapSet";

export default {
    name: "index",
    components: {
        Tree
    },
    data() {
        return {
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
        open(obj) {
            this.drawer = true;
            this.handleGetMapGardenList();
            if (obj.gardenId) {
                this.defaultOpenArray[0] = "a" + obj.gardenId;
            }
            if (obj.buildingId) {
                this.defaultOpenArray[1] = "b" + obj.buildingId;
            }
            if (obj.floorId) {
                this.defaultOpenArray[2] = "c" + obj.floorId;
            }
            this.selectedKey = this.defaultOpenArray.slice(-1)[0];
            this.companyName = JSON.parse(localStorage.getItem("USERINFO")).companyName;
        },
        handleGetMapGardenList() {
            this.treeLoading = true;
            this.loading = true;
            this.companyNames = [];
            getMapGardenList().then((res) => {
                this.treeLoading = false;
                this.loading = false;
                if (res.code && res.items.length) {
                    for (const item of res.items) {
                        let grandpaKey = "a";
                        let grandpa = {
                            key: grandpaKey + item.gardenId,
                            id: item.gardenId,
                            name: item.gardenName,
                            subDivisions: [],
                        };
                        for (const element of item.subDivisions) {
                            let fatherKey = "b";
                            let father = {
                                key: fatherKey + element.id,
                                id: element.id,
                                name: element.name,
                                subDivisions: [],
                            };
                            grandpa.subDivisions.push(father);
                            for (const sun of element.subDivisions) {
                                let sunKey = "c";
                                let grandson = {
                                    key: sunKey + sun.id,
                                    id: sun.id,
                                    name: sun.name,
                                };
                                father.subDivisions.push(grandson);
                            }
                        }
                        this.companyNames.push(grandpa);
                    }
                    if (!this.defaultOpenArray.length) {
                        this.companyObject.gardenId = res.items[0].gardenId;
                        this.companyObject.gardenName = res.items[0].gardenName;
                        // this.handleTableData(obj.level, obj.data.id, obj.name)
                    } else {
                        // this.handleTableData(obj.level, obj.data.id, obj.label)
                    }
                }

            });
        },
        handleCutItem(object) {
            this.handleSaveTreeId(object);
            this.$emit("handle", object)
        },
        // 刷新存储tree展开节点id
        handleSaveTreeId(object) {
            this.$set(this.defaultOpenArray, object.level - 1, object.key);
            if (object.level === 1) {
                this.defaultOpenArray = this.defaultOpenArray.slice(0, 1);
            }
            if (object.level === 2) {
                this.defaultOpenArray = this.defaultOpenArray.slice(0, 2);
            }
        },
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