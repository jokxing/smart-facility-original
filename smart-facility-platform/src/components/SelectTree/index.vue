<template>
  <el-select
    ref="select"
    v-model="modelVal"
    :clearable="clearable"
    :placeholder="placeholder"
    :popper-class="popperClass"
    :disabled="disabled"
    filterable
    :filter-method="filterNode1"
    @clear="handleClear"
  >
    <el-option :label="valueTitle" :value="valueId" class="options">
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
        :filter-node-method="filterNode"
        :node-key="prop.value"
        @node-click="handleNodeClick"
      ></el-tree>
    </el-option>
  </el-select>
</template>
<script>
export default {
  name: "el-tree-select",
  props: {
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
    model: {
      type: [Number, String],
      default: null
    },

    // 选项列表数据(树形结构的对象数组)
    options: {
      type: Array,
      default: () => []
    },

    // 初始值
    value: { type: [Number, String], default: null },

    // 可清空选项
    clearable: { type: Boolean, default: true },

    // 自动收起
    accordion: { type: Boolean, default: false },
    placeholder: {
      type: String,
      default: "请选择"
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
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    // 是否选到房间
    isToRoom: {
      type: Boolean,
      default: false
    },
    // 是否精确
    isAccurate: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      valueId: null,
      valueTitle: "",
      defaultExpandedKey: [],
      modelVal: ""
    };
  },
  mounted() {
    this.modelVal = this.model;
  },
  beforeUpdate() {
    if (this.value == 0) {
      this.valueTitle = "智慧设施";
    }
    this.valueId = this.value;
    if (this.options.length > 0) {
      this.initHandle();
      this.defaultExpandedKey = [];
    }
    this.modelVal = this.model;
  },
  methods: {
      filterNode1(value) {
          this.$refs.selectTree.filter(value);
      },
      filterNode(value, data) {
          if (!value) return true;
          return data.name.indexOf(value) !== -1;
      },
    // 初始化值
    initHandle() {
      const _this = this;
      if (this.valueId && this.valueId != 0) {
          clearInterval(_this.$refs.selectTree.getNode);

          let set = setInterval(function() {
            if (_this.options.length <= 0) {
                clearInterval(set);
                return
            }
            const el = _this.$refs.selectTree.getNode(_this.valueId);
            if (!el) {
                _this.valueTitle = "";
                _this.$refs.selectTree.setCurrentKey();
                clearInterval(set);
                return;
            }
            if (_this.handleIsLabelCustom()) {
                _this.valueTitle = _this.prop.label(el.data);
                clearInterval(set);
                return;
            }
            _this.valueTitle = el.data[_this.prop.label];
              clearInterval(set);
        }, 0);
        // 初始化显示
        this.$refs.selectTree.setCurrentKey(this.valueId); // 设置默认选中
        this.defaultExpandedKey = []; // 设置默认展开
      } else {
        this.valueTitle = this.isCompany
          ? JSON.parse(localStorage.getItem("USERINFO")).companyName
          : "";
        this.$refs.selectTree.setCurrentKey();
      }
      // this.initScroll(this.$refs.selectTree);
    },
      // 判断label是否自定义
      handleIsLabelCustom() {
        return (typeof this.prop.label == "function")
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
        this.$emit("getValue", node[this.prop.value]);
      } else {
        this.$emit("getValue", data);
      }
      this.defaultExpandedKey = [];
      if(this.isAccurate){
        this.$refs.select.blur();
      }
    },
    // 切换选项
    handleNodeClick(node, data) {
        if (!this.isAccurate) {
           return this.handleGetId(node, data);
        }
        if (!this.level) {
            this.handleGetId(node)
            return
        }
        if (this.isToRoom) {
            if (data.level === 4) {
                this.handleGetId(node, data);
                return;
            }
            !node.subDivisions.length &&
              this.$message.error(
                "该" +
                  (data.level === 1 ? "楼宇" : "楼层") +
                  "暂无" +
                  (data.level === 1 ? "楼层" : "房间") +
                  "数据,请前往添加！"
              );
        } else {
            if (data.level === 3) {
                this.handleGetId(node, data);
                return;
            }
            if (this.prop.children === "subDivisions") {
                !node.subDivisions.length &&
                this.$message.error(
                    "该" +
                    (data.level === 1 ? "楼宇" : "楼层") +
                    "暂无" +
                    (data.level === 1 ? "楼层" : "房间") +
                    "数据,请前往添加！"
                );
                return;
            }
            this.handleGetId(node, data)
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
    value() {
      this.valueId = this.value;
      this.initHandle();
    },
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
