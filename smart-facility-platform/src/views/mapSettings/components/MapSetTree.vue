<template>
  <el-tree
      ref="mapSetTree"
      :current-node-key="selectedTreeNodeKey"
      :data="treeData"
      :default-expand-all="isDefaultExpandAll"
      :props="treeProps"
      accordion
      :indent="0"
      class="tree tree-default"
      :default-expanded-keys="defaultArray"
      highlight-current
      :node-key="nodeKey"
      icon-class="icon-ring"
      @node-click="handleNodeClick">
    <div slot-scope="{ node, data }" class="custom-tree-node">
      <span :title="node.label" class="label-name">{{ node.label }}</span>
      <span v-if="show && (node.level === isLabel || isLabel === 0)">
        <el-popover
            :disabled="node.key !== isPopover"
            placement="bottom-start"
            trigger="click"
            width="80">
          <ul class="operate">
            <li>
              <el-button type="text" @click="handleGardenEdit(node, data)">{{ $t('common.edit') }}</el-button>
            </li>
            <li>
              <el-button type="text" @click="handleGardenDelete(node, data)">{{ $t('common.delete') }}</el-button>
            </li>
          </ul>
          <el-button
              slot="reference"
              size="mini"
              :title="$t('system.handles')"
              type="text"
              @click.stop.prevent="() => append(node, data)">
            <i class="icon el-icon-more"></i>
          </el-button>
        </el-popover>
      </span>
    </div>
  </el-tree>
</template>

<script>
import {deleteMapGarden} from "@/api/mapSet";
import {dateData} from "@/views/labDevice/config";
import i18n from "@/i18n";
export default {
  name: "MapSetTree",
  props: {
    /********* children指定子树为节点属性值， label指定节点标签属性值 *******/
    treeProps: {
      type: Object,
      default: () => {
        return {
          label: 'name',
          children: "subDivisions"
        }
      }
    },
    selectedTreeNodeKey: {
      type: [Number, String],
      default: null
    },
    treeData: {
      type: Array,
      default: () => []
    },
    /******** 是否展开所有节点 ******/
    isDefaultExpandAll: {
      type: Boolean,
      default: false
    },
    /********* 节点是否显示更多操作, 0：显示所有 ********/
    isLabel: {
      type: Number,
      default: 1
    },
    operate: {
      type: Array,
      default: () => [
        {name: i18n.t('common.edit'), fn: "handleGardenEdit"},
        {name:  i18n.t('common.delete'), fn: "handleGardenDelete"}
      ]
    },
      nodeKey: {
        type: String,
        default: "key"
      },
    expandedKeys: {
      type: Array,
      default: () => []
    },
    defaultArray: {
      type: Array,
      default: () => []
    },
      // 是否操作按钮
    show: {
        type: Boolean,
        default: true
    }
  },
  data() {
    return {
      isPopover: true,
    }
  },

  methods: {
    append(node, data) {
      this.isPopover = node.key;
    },
    handleGardenEdit(node, data) {
      this.$emit("handleEdit", data);
    },
    handleGardenDelete(node, data) {
      if (data.subDivisions.length) {
        return this.$message.error(i18n.t('dataV.deleteSub'));
      }
      this.$confirm(i18n.t('dataV.deleteSubMessage'), i18n.t('common.delete'), {
        type: "warning",
        confirmButtonText: i18n.t('common.confirm'),
        cancelButtonText: i18n.t('common.cancel')
      }).then(() => {
        deleteMapGarden({gardenId: data.id}).then(res => {
          if (res.code) {
            this.$message.success(res.message);
            this.$emit("handleDelete", res.code);
          } else {
            this.$message.error(res.message);
          }
        })
      }).catch(() => {
        this.$message.info(i18n.t('common.cancelHandle'));
      })
    },
    handleNodeClick(data, node) {
      this.$emit("getId", node);
    }
  }
}
</script>

<style lang="less" scoped>
.custom-tree-node {
  height: 45px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  line-height: 45px;
  color: #252629;
  padding-right: 8px;
  font-weight: 600;
  overflow: hidden;
  white-space: normal;
  text-overflow: ellipsis;
}

.tree-default {
  /deep/ .el-tree-node {
    border-radius: 3px;
    margin-bottom: 5px;

    .el-tree-node__content {
      height: 45px;
      line-height: 45px;
      color: #252629;
      font-size: 14px;
      position: relative;

      .treeNodeWrap {
        flex: 1;

        .icon {
          display: none;
        }
      }
    }

    &.is-current {
      & > .el-tree-node__content {
        background-color: #EDF0FF;
        color: #303F9F;
        position: relative;

        &::after {
          display: block;
          content: "";
          background-color: #EDF0FF;
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          border-radius: 3px;
        }

        .el-tree-node__expand-icon {
          color: #303F9F;
        }
      }
    }
  }
}

ul li {
  list-style: none;
  text-align: center;
}

.label-name {
  width: 173px;
  color: #555555;
  font-weight: 400;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.icon {
  display: block;
  width: 45px;
  height: 45px;
  position: absolute;
  top: 0;
  right: 0;
  line-height: 45px;
  text-align: center;
  z-index: 100;
  color: #303F9F;

  &.el-icon-more {
    transform: rotate(90deg);
  }
}


.tree /deep/ .el-tree-node {
  position: relative;
  padding-left: 12px ;
}

.tree /deep/ .el-tree-node__children {
  padding-left: 8px;
}

.tree /deep/ .el-tree-node :last-child:before {
  height: 20px;
}

.tree /deep/ .el-tree > .el-tree-node:before {
  border-left: none;
}


.tree /deep/ .el-tree-node:before {
  content: '';
  left: 7px;
  position: absolute;
  right: auto;
  border-width: 1px;
  border-left: 1px dashed #D4D6E2;
  bottom: 0;
  top: -1px;
  width: 1px;
}

.tree /deep/ .el-tree-node:after {
  content: '';
  left: 7px;
  position: absolute;
  border-width: 1px;
  border-top: 1px dashed #D4D6E2;
  top:21px;
  width: 10px ;
}
</style>
