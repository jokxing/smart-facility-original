<!--分类设置-->
<template>
    <div class="asset-classify session">
        <el-row type="flex" justify="space-between">
            <div class="title">{{ $t('labDevice.classifySet') }}</div>
            <div>
                <el-button type="primary" class="icon-add-to" @click="$refs.created.open(0, {parentId: ''})">&nbsp;{{ $t('common.add1') }}</el-button>
                <el-button @click="importFileVisible = !importFileVisible">{{ $t('common.importHandle') }}</el-button>
                <el-button @click="handleExport">{{ $t('common.export') }}</el-button>
            </div>
        </el-row>
        <div style="color: #999999;font-size: 14px;">{{ $t('labDevice.dragSort') }}</div>
        <div class="margin-center">
            <el-input
                v-model="assetCategoryName"
                @input="handleQuery"
                :placeholder="$t('labDevice.searchClassify')"/>
        </div>
        <el-tree
            :data="data"
            draggable
            class="margin-center"
            node-key="id"
            :props="props"
            default-expand-all
            @node-drop="handleDraggable"
            :allow-drop="allowDrop"
            :expand-on-click-node="false">
              <span @mouseenter="nodeId = data.id" @mouseleave="nodeId = ''" class="custom-tree-node" slot-scope="{ node, data }">
                <span>{{ node.label }}</span>
                <span v-if="nodeId == data.id">
                  <el-button
                      type="text"
                      v-if="node.level < 4"
                      @click="() => append(data)">
                    {{ $t('common.add1') }}
                  </el-button>
                  <el-button
                      type="text"
                      @click="() => edit(data)">
                    {{ $t('common.edit') }}
                  </el-button>
                  <el-button
                      type="text"
                      class="abnormal"
                      @click="() => remove(node, data)">
                    {{ $t('common.delete') }}
                  </el-button>
                </span>
              </span>
        </el-tree>
        <created ref="created" @handle="init"/>
        <ImportFile
            v-if="importFileVisible"
            :title="importTitle"
            @handleUpdateInit="handleUpdateInit"
            @hiddenModalVisible="hiddenModalVisible"></ImportFile>
    </div>
</template>

<script>
import ImportFile from "@/components/ImportFile";
import {
    postInstrumentCategoryInfoDelete,
    postInstrumentCategoryInfoExport, postInstrumentCategoryInfoUpdate, postInstrumentCategoryInfoUpdateSort
} from "../../api/labDevice";
import Created from "./components/Created";
import {mapActions} from "vuex";
import moment from "moment";
import mixin from "@/utils/mixin";

let id = 1000;
let time = null;
export default {
    name: "AssetClassify",
    components: {
        ImportFile,
        Created
    },
    data() {
        return {
            data: [],
            assetCategoryName: "",
            props: {
                children: 'childrenList',
                label: (data,node) => {
                    return data.name + "("+ data.code +")"
                }
            },
            importFileVisible: false,
            importTitle: "classifySystem",
            nodeId: ""
        }
    },
    created() {
        this.init();
    },
    methods: {
        handleQuery() {
            if (time) {
                clearTimeout(time)
            }
            time = setTimeout(() => {
                this.init();
            }, 500)
        },
        allowDrop(draggingNode, dropNode, type) {
            if (draggingNode.data.level === dropNode.data.level) {
                //fatherId 是父节点id
                if (draggingNode.data.parentId === dropNode.data.parentId) {
                    return type === 'prev' || type === 'next'
                }else{
                    return false;
                }
            } else {
                // 不同级进行处理
                return false;
            }
        },
        handleExport() {
            new Promise(resolve => {
                this.$message.warning(this.$t('common.exportMessage'));
                setTimeout(() => {
                    resolve();
                }, 1500)
            }).then(() => {
                postInstrumentCategoryInfoExport().then(res => {
                    const data = moment(new Date()).format("YYYYMMDDHHmmss");
                    mixin.methods.download(
                        res,
                        decodeURIComponent(this.$t('labDevice.classifyExport') + data, "UTF-8")
                    )
                })
            })
        },
        // 上传成功后更新初始化
        handleUpdateInit() {
            this.importFileVisible = false;
            this.$store.dispatch("getAccessClassify");
            this.init();
        },
        // 隐藏弹窗
        hiddenModalVisible() {
            this.updateModalVisible = false;
            this.importFileVisible = false;
        },
        handleDraggable(draggingNode, dropNode, dropType, ev) {
            const id = draggingNode.data.id;
            const arr = dropNode.parent.childNodes;
            const parentId = draggingNode.data.parentId || 0;
            let sort = 0;
            for (sort ;sort < arr.length; sort++) {
                if (arr[sort].data.id == id) {
                    break;
                }
            }
            postInstrumentCategoryInfoUpdateSort({id, parentId, sort}).then(res => {

            }).catch(e => {
                this.loading = false;
                console.log(e)
            })
        },
        append(data) {
            this.$refs.created.open(0, {parentId: data.id});
        },
        edit(data) {
            const obj = {
                parentId: data.parentId ? data.parentId : "",
                id: data.id,
                assetCategoryName: data.name,
                assetCategoryCode: data.code
            }
            this.$refs.created.open(1, obj)
        },
        init() {
            this.handleGetClassifyList();
        },
        ...mapActions(["getAccessClassify"]),
        handleGetClassifyList() {
            this.getAccessClassify(this.assetCategoryName).then(res => {
                this.data = res;
            })
        },
        remove(node, data) {
            this.$confirm(this.$t('labDevice.classifyDeleteMessage') + data.name +">"+ this.$t('labDevice.classify'),this.$t('labDevice.classifyDelete'), {
                confirmButtonText: this.$t('common.confirm'),
                cancelButtonText: this.$t('common.cancel'),
                type: "warning"
            }).then(res1 => {
                postInstrumentCategoryInfoDelete({ids: [data.id]}).then(res => {
                    if (res.code) {
                        this.$message.success(this.$t('common.deleteSuccess'));
                        const parent = node.parent;
                        const children = parent.data.childrenList || parent.data;
                        const index = children.findIndex(d => d.id === data.id);
                        children.splice(index, 1);
                    } else {
                        this.$message.error(res.message);
                    }
                })
            }).catch(e => {
                this.$message.info(this.$t('common.cancelHandle'));
            })
        },

        renderContent(h, {node, data, store}) {
            return (
                <span class="custom-tree-node">
            <span>{node.label}</span>
            <span>
              <el-button size="mini" type="text" on-click={() => this.append(data)}>Append</el-button>
              <el-button size="mini" type="text" on-click={() => this.remove(node, data)}>Delete</el-button>
            </span>
          </span>);
        }
    }
}
</script>

<style lang="less" scoped>
.asset-classify {
    width: 40%;

    .title {
        font-size: 18px;
        font-weight: bold;
        color: #3F51B5;
    }
}

.custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 16px;
    padding-right: 8px;
    line-height: 2;
}
</style>
