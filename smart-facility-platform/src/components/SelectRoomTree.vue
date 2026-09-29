<template>
  <!-- 
  modelVal: 绑定数据
  clearable: 是否可以清空选项
  popper-class: Select 下拉框的类名
  filterable: 是否可搜索
  remote: 是否为远程搜索
  remote-method: 远程搜索方法
  disabled: 是否禁用
  @clear: 可清空的单选模式下用户点击清空按钮时触发
  -->
  <el-select
    @focus="getRoomList()"
    ref="select"
    v-model="modelVal"
    :clearable="clearable"
    :placeholder="placeholder"
    :popper-class="popperClass"
    filterable
    :remote="true"
    :remote-method="searchRoom"
    :disabled="disabled"
    @clear="handleClear"
  >
    <!-- 
    label: 标题
    value: 绑定值
    -->
    <el-option :label="valueTitle" :value="valueId" class="options">
      <!-- 
        accordion：是否每次只打开一个同级树节点展开	
        data：数据
        default-expand-all：是否默认展开所有节点	
        default-expanded-keys：默认展开的节点的 key 的数组
        expand-on-click-node：是否在点击节点的时候展开或者收缩节点， 默认值为 true，如果为 false，则只有点箭头图标的时候才会展开或者收缩节点。
        props：配置选项。{'label': '', 'children': '', 'disabled': '', 'isLeaf': ''}
          (1) label	指定节点标签为节点对象的某个属性值
          (2) children	指定子树为节点对象的某个属性值
          (3) disabled	指定节点选择框是否禁用为节点对象的某个属性值
          (4) isLeaf	指定节点是否为叶子节点，仅在指定了 lazy 属性的情况下生效
        highlight-current：是否高亮当前选中节点，默认值是 false。
        node-key：每个树节点用来作为唯一标识的属性，整棵树应该是唯一的
        @node-click：节点被点击时的回调	
      -->
      <el-tree
        id="tree-option"
        ref="selectTree"
        :accordion="accordion"
        :data="options"
        :default-expand-all="defaultOpen"
        :default-expanded-keys="[]"
        :expand-on-click-node="level"
        :props="prop"
        highlight-current
        node-key="id"
        @node-click="handleNodeClick"
      ></el-tree>
    </el-option>
  </el-select>
</template>
<script>
import { getRoomTree } from "@/api/room";
import { log } from "util";
import {debounce} from "@/utils/methods";

export default {
  name: "SelectRoomTree",
  props: {
    // 房间名称
    updateRoomName: {
      type: String,
      default: ""
    },
    // 房间ID
    roomId: {
      type: [Number, String],
      default: null
    },

    // 配置项
    prop: {
      type: Object,
      default: () => {
        return {
          value: "id", // ID字段名
          label: "name", // 显示名称
          children: "children" // 子级字段名
        };
      }
    },

    // 初始值
    selectTreeValue: { type: [Number, String], default: null },

    // 可清空选项
    clearable: { type: Boolean, default: true },

    // 自动收起
    accordion: { type: Boolean, default: false },

    placeholder: {
      type: String,
      default: ""
    },

    defaultOpen: {
      type: Boolean,
      default: true
    },

    popperClass: {
      type: String,
      default: ""
    },

    level: {
      type: Boolean,
      default: false
    },

    isCompany: {
      type: Boolean,
      default: true
    },

    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 选项列表数据(树形结构的对象数组)
      options: [],
      // el-option标签的value值
      valueId: null,
      // el-option标签的label值
      valueTitle: "",
      // 默认展开的树形菜单
      defaultExpandedKey: [],
      // el-select绑定的值（这个值和el-option标签的value值相等,就可以显示el-option标签的label值）
      modelVal: "",
      // 用于模糊搜索
      roomName: ""
    };
  },
  created() {
    // 获取房间列表(树形结构)
    this.valueId = this.roomId;
    this.valueTitle = this.updateRoomName;
    this.modelVal = this.updateRoomName;
    // this.getRoomList();
    this.getRoomList = debounce(this.getRoomList,500)
  },
  mounted() {},
  beforeUpdate() {},
  methods: {
    // 获取房间信息
    async getRoomList() {
      await getRoomTree({
        keyword: this.roomName
      }).then(res => {
        this.options = res.items;
        // this.initValueTitle(this.options, 0);
      });
    },

    // 搜索房间
    searchRoom(query) {
      if (query !== "") {
        let that = this;
        that.roomName = query;
        that.getRoomList();
      } else {
        this.roomName = query;
        this.getRoomList();
      }
    },

    // 初始化值
    initHandle() {
      // TODO
      let _this = this;
      if (this.valueId && this.valueId != 0) {
        let set = setInterval(function() {
          if (_this.options.length > 0) {
            clearInterval(set);
            if (_this.$refs.selectTree.getNode(_this.valueId)) {
              _this.valueTitle = _this.$refs.selectTree.getNode(
                _this.valueId
              ).data[_this.prop.label];
            }
          }
        }, 0);
        // 初始化显示
        this.$refs.selectTree.setCurrentKey(this.valueId); // 设置默认选中
        this.defaultExpandedKey = []; // 设置默认展开
      } else {
        this.valueTitle = "暂未选择房间";
        this.$refs.selectTree.setCurrentKey();
      }
    },
    // 初始化滚动条
    initScroll() {
      this.$nextTick(() => {
        let scrollWrap = document.querySelectorAll(
          ".el-scrollbar .el-select-dropdown__wrap"
        )[0];
        let scrollBar = document.querySelectorAll(
          ".el-scrollbar .el-scrollbar__bar"
        );
        scrollWrap.style.cssText = scrollBar.forEach(
          ele => (ele.style.width = 0)
        );
      });
    },
    handleGetId(node, data) {
      this.modelVal = node[this.prop.label];
      this.valueTitle = node[this.prop.label];
      this.valueId = node[this.prop.value];
      if (!this.level) {
        this.$emit("getValue", node[this.prop.value], this.valueTitle);
      } else {
        this.$emit("getValue", data);
      }
      this.defaultExpandedKey = [];
      this.$refs.select.blur();
    },
    // 切换选项
    handleNodeClick(node, data) {
      if (!this.level) {
        if (node.level < 4) {
          return;
        } else {
          this.handleGetId(node);
        }
      } else {
        // 无
      }
    },

    // 清除选中
    handleClear(v) {
      this.valueTitle = "";
      this.valueId = null;
      this.defaultExpandedKey = [];
      this.clearSelected();
      this.$emit("getValue", null);
    },

    // 清空选中样式
    clearSelected() {
      let allNode = document.querySelectorAll("#tree-option .el-tree-node");
      allNode.forEach(element => element.classList.remove("is-current"));
    }
  },

  watch: {
    modelVal() {
      this.valueId = this.modelVal;
      this.initHandle();
    }
  }
};
</script>

<style scoped>
.el-scrollbar .el-scrollbar__view .el-select-dropdown__item {
  height: auto;
  max-height: 260px;
  padding: 0;
  overflow-y: auto;
}

::-webkit-scrollbar {
  width: 5px;
  background-color: #f3f3f3;
}

/* 滚动槽 */
::-webkit-scrollbar-track {
  border-radius: 10px;
}

/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  border-radius: 10px;
}

.el-select-dropdown__item.selected {
  font-weight: normal;
}

ul li >>> .el-tree .el-tree-node__content {
  height: auto;
  padding: 0 20px;
}

.el-tree-node__label {
  font-weight: normal;
}

.el-tree >>> .is-current .el-tree-node__label {
  color: #3f51b5;
  font-weight: 700;
}

.el-tree >>> .is-current .el-tree-node__children .el-tree-node__label {
  color: #606266;
  font-weight: normal;
}

.Bg {
  background: #1aa094;
  color: white;
}
</style>


<style lang="less" scoped>
.el-scrollbar__view {
  .organization {
    line-height: 40px;
    text-indent: 10px;
    z-index: 999;
    font-size: 14px;
    position: relative;

    .icon {
      display: inline-block;
      text-align: center;
      font-size: 12px;
      height: 16px;
      width: 16px;
      line-height: 16px;
      background: #409eff;
      color: #fff;
      margin-right: 10px;
      border-radius: 3px;
      text-indent: 0;
    }

    &::after {
      display: block;
      content: "";
      height: 1px;
      background-color: #e5e5e5;
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
    }
  }
}
</style>
