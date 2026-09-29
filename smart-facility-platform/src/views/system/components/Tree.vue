<template>
  <div class="tree-container">
    <el-tree
        ref="departmentTree"
        :current-node-key="selectedTreeNodeKey"
        :data="treeData"
        :expand-on-click-node="false"
        :props="treeProps"
        accordion
        :indent="0"
        class="tree-default tree"
        default-expand-all
        highlight-current
        icon-class="icon-organization"
        node-key="id"
    >
      <div slot-scope="{ node, data }" class="treeNodeWrap">
        <div
            :style="{ fontWeight: 600 - (node.level - 1) * 100 }"
            class="treeNode"
            @click="handleChangeDept(node, data)"
        >
            <el-tooltip class="item" effect="dark" :content="data.name" placement="top-start">
                <span>{{ data.name }}</span>
            </el-tooltip>
        </div>
        <el-tooltip
            v-if="node.data.defaultDepartment == 1 && isHandle"
            class="item"
            :content="$t('common.edit')"
            placement="top-start">
          <i class="icon el-icon-edit" v-if="isHandle" @click="handleEdit(node, data)"></i>
        </el-tooltip>

        <el-popover
            v-else-if="node.data.defaultDepartment !== 1 && isHandle"
            :ref="`popover-${data.id}`"
            :width="200"
            placement="bottom"
            popper-class="popover-default"
        >
          <div class="popover-operate">
            <ul class="operateList">
              <li
                  v-for="(item, index) in moreHandle"
                  :key="index"
                  class="operateList-item">
                <span v-if="data.isOperation == 1 || (data.isOperation == 0 && item.fn != 'handleDeptAdd') "
                      @click="operateClick(item.fn, { node, data })">{{ item.name }}</span>
              </li>
            </ul>
          </div>
          <el-tooltip
              slot="reference"
              class="item"
              :content="$t('system.handles')"
              placement="top-start"
          >
            <i class="icon el-icon-more" @click="handleSeedMore(node, data)"></i>
          </el-tooltip>
        </el-popover>
      </div>
    </el-tree>
  </div>
</template>
<script>
import {mapState, mapMutations} from "vuex";
import {departmentRemove, putDepartmentMove} from "@/api/department";
import {ERROR} from "@/utils/constant";
import i18n from "@/i18n";
const MOREHANDLE = [
  {
    name: i18n.t('system.updateDepartment'),
    fn: "handleDeptEdit",
  },
  {
    name: i18n.t('system.addSunDepartment'),
    fn: "handleDeptAdd",
  },
  //后端未做排序的功能
  {
    name: i18n.t('system.turnUp'),
    fn: "handleTurnUp",
  },
  {
    name: i18n.t('system.turnDown'),
    fn: "handleTurnDown",
  },
  {
    name: i18n.t('common.delete'),
    fn: "handleDeptDelete",
  },
];
export default {
  props: {
    treeData: {
      type: Array,
      default: [],
    },
    departmentId: {
      type: Number,
      default: null
    },
    isHandle: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      moreHandle: MOREHANDLE,
      treeProps: {
        //数配置项
        label: "name",
        children: "subDivisions",
      },
      selectedTreeNodeKey: this.deptId,
    };
  },
  computed: {
    ...mapState("sys", {
      deptId: "deptId",
    }),
  },
  watch: {
    deptId: {
      handler(newVal) {
        this.selectedTreeNodeKey = newVal;
        this.$nextTick(function () {
          this.$refs.departmentTree.setCurrentKey(newVal || null);
        });
      },
      immediate: true,
    },
  },
  methods: {
    ...mapMutations("sys", {
      handleOpenDeptModal: "OPENDEPTMODAL",
      handleSeleteDept: "SETLETEDEPT",
      handleRefresh: "DEPTREFLESH",
    }),

    operateClick(fn, params) {
      this.$options.methods[fn](this, params);
    },
    handleSeedMore(node, data) {
      let {parent, id, level} = node;
      let handleList = MOREHANDLE.slice(0);
      if (parent) {
        let {childNodes} = parent;
        let index = childNodes.map((item) => item.id).indexOf(id);
        let len = level === 1 ? 2 : 1;
        let first = level === 1 ? 1 : 0;

        if (childNodes.length === len) {
          handleList.splice(2, 2);
        } else if (index === first) {
          handleList.splice(2, 1);
        } else if (index === childNodes.length - 1) {
          handleList.splice(3, 1);
        }
      }
      this.moreHandle = handleList;

      for (const key in this.$refs) {
        if (key.indexOf("popover-") !== -1) {
          try{
            this.$refs[key].doClose();
          }catch(e){
            return
          }
        }
      }
    },
    handleEdit(node, data) {
      this.handleOpenDeptModal({
        title: i18n.t('system.updateDepartment'),
        type: 2,
        editData: data,
      });
    },
    handleDeptEdit(_, params) {
      let {data} = params;
      _.handleOpenDeptModal({
        title: i18n.t('system.updateDepartment'),
        type: 2,
        editData: data,
      });
    },
    handleDeptAdd(_, params) {
      let {data} = params;
      _.handleOpenDeptModal({
        title: i18n.t('system.addSunDepartment'),
        type: 3,
        editData: data,
      });
    },

    handleTurnUp(_, params) {
      let {node} = params;
      let {parent} = node;
      let {childNodes} = parent;

      let departmentIdOne = null;
      let departmentIdtwo = null;
      for (let i = 0; i < childNodes.length; i++) {
        if (childNodes[i].isCurrent) {
          let {data} = childNodes[i];
          departmentIdOne = data.id;
          departmentIdtwo = childNodes[i - 1].data.id;
        }
      }
      _.deptSortAsync(departmentIdOne, departmentIdtwo, i18n.t('system.turnUp'));
    },
    handleTurnDown(_, params) {
      let {node} = params;
      let {parent} = node;
      let {childNodes} = parent;
      let departmentIdOne = null;
      let departmentIdtwo = null;
      for (let i = 0; i < childNodes.length; i++) {
        if (childNodes[i].isCurrent) {
          let {data} = childNodes[i];
          departmentIdOne = data.id;
          departmentIdtwo = childNodes[i + 1].data.id;
        }
      }
      _.deptSortAsync(departmentIdOne, departmentIdtwo, i18n.t('system.turnDown'));
    },

    handleChangeDept(node, data) {
      this.$emit("update:departmentId", Number(data.id));
      let {id, parentDepartmentId, name} = data;
      this.handleSeleteDept({
        deptId: id,
        pid: parentDepartmentId,
        currentDept: data,
      });

      for (const key in this.$refs) {
        if (key.indexOf("popover-") !== -1) {
          try{
            this.$refs[key].doClose();
          }catch(e){
            return
          }
        }
      }
    },

    async deptDeleteAsync(id) {
      try {
        let result = await departmentRemove({}, id);
        if (result.code == 1) {
          this.$message.success(i18n.t('common.deleteSuccess'));
          this.handleRefresh();
        } else {
          this.$message.error(result.message);
        }
      } catch (err) {
        this.$message.error(ERROR);
        throw err;
      }
    },

    async deptSortAsync(departmentIdOne, departmentIdTwo, str) {
      try {
        let result = await putDepartmentMove({
          departmentIdOne,
          departmentIdTwo,
        });
        if (result.code == 1) {
          this.$message.success(`${str}`+this.$t('common.success'));
          for (const key in this.$refs) {
            if (key.indexOf("popover-") !== -1) {
              this.$refs[key].doClose();
            }
          }
          this.handleRefresh();
        } else {
          this.$message.error(result.message);
        }
      } catch (err) {
        this.$message.error(ERROR);
        throw err;
      }
    },

    handleDeptDelete(_, params) {
      let {data} = params;
      _.$confirm(_.$t('system.deleteDep'), _.$t('system.deleteHint'), {
        confirmButtonText: _.$t('common.confirm'),
        cancelButtonText: _.$t('common.cancel'),
        type: "warning",
      })
          .then(() => {
            _.deptDeleteAsync(data.id);
          })
          .catch((err) => {
            throw err;
          });
    },
    handleChange(e, node) {
      this.$emit("handle", e);
    },
  },
};
</script>
<style lang="less" scoped>
.tree-default {
  /deep/ .el-tree-node {
    border-radius: 3px;

    .el-tree-node__content {
      height: 35px;
      line-height: 35px;
      color: #252629;
      font-size: 14px;
      position: relative;

      .treeNodeWrap {
        width: 80%;

          .treeNode {
              width: 100%;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
          }

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

          &.is-leaf {
            color: transparent;
          }
        }

        .treeNodeWrap {
          padding-right: 45px;
          position: relative;

          .icon {
            display: block;
            width: 35px;
            height: 35px;
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
        }
      }
    }
  }
}
/deep/ .el-tree-node__expand-icon.expanded {
  transform: none;
}

</style>
<style lang="less" scoped>
@import "../popover.less";


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
  top:18px;
  width: 10px ;
}

</style>
