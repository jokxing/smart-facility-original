<template>
  <el-table
    :data="data"
    size="medium"
    ref="elTable"
    stripe
    class="table-body"
    border
    header-cell-class-name="table-header"
    :row-key="getRowKeys"
    :row-class-name="rowClassName"
    @filter-change="filterTag"
    @selection-change="handleSelectionChange"
    @select="handleSelect"
    @sort-change="$emit('sortChange', $event)"
    @select-all="handleSelectAll"
    @row-click="singleElection"
    :cell-class-name="cellClassNameFunction">
    <template v-for="(item, index) in tableData">
      <el-table-column
        v-if="!item.isButton && !item.field && !item.isSlot && !item.filters && !item.isRadio && !item.isSlotColumn && !item.isCheckbox"
        :key="index"
        :reserve-selection="item.reserveSelection"
        :label="item.label"
        :type="item.type"
        :prop="item.prop"
        :sortable="item.sortable"
        :width="item.width"
        :min-width="item.minWidth"
        :formatter="item.formatter"
        :className="item.className"
        :align="item.align"
        >
      </el-table-column>
      <!-- 单选 -->
      <el-table-column
        v-if="item.isRadio"
        :key="index"
        :width="item.width">
        <template slot-scope="scope">
            <el-radio-group
                v-model="radio"
                @click.native="radioSelected(scope.row, $event)"
            >
                <el-radio class="radio" :label="scope.$index">&nbsp;
                </el-radio>
            </el-radio-group>

        </template>
      </el-table-column>
      <!-- 多选  -->
      <el-table-column 
        v-if="item.isCheckbox" 
        :key="index" 
        type="selection" 
        :width="item.width"/>

      <!-- 绑定事件 -->
      <el-table-column
        :key="index"
        v-if="item.isButton"
        :label="item.label"
        :type="item.type"
        :prop="item.prop"
        :width="item.width">
        <template slot-scope="scope">
          <a
            v-if="item.prop"
            link
            type="primary"
            size="small"
            @click="$emit(item.click, scope.row, item.clickCallbackName)">
            {{ scope.row[item.prop] }}
          </a>

          <div v-else>
            <slot v-if="item.isButtonSlot" :isButton="true" :data="scope.row"></slot>
            <el-button
              v-else
              v-for="(items,indexs) in item.clickList"
              :key="indexs"
              link
              type="text"
              :class="items.class"
              @click="handle(items.click,scope.row, item.clickCallbackName)">
              {{ items.text }}
            </el-button>
          </div>
        </template>
      </el-table-column>
      <!-- slot -->
      <el-table-column
        :key="index"
        v-if="item.isSlot"
        :label="item.label"
        :type="item.type"
        :prop="item.prop"
        :sortable="item.sortable"
        :width="item.width"
        :min-width="item.minWidth">
        <template slot-scope="scope">
          <slot v-if="item.isStrings" :data="[scope.row[item.props[0]],scope.row[item.props[1]]]"></slot>
          <slot v-else-if="item.judgeField" :data="[scope.row[item.prop],scope.row[item.judgeField]]"></slot>
          <slot v-else :data="scope.row" :prop="item.prop"></slot>
          <!-- <slot v-else :data="scope.row[item.prop]"></slot> -->
        </template>
      </el-table-column>
      <!-- 区分颜色 -->
      <el-table-column
        :key="index"
        v-if="item.field"
        :label="item.label"
        :type="item.type"
        :sortable="item.sortable"
        :prop="item.prop"
        :width="item.width">
        <template slot-scope="scope">
          <div
            v-if="item.class[scope.row[item.field]]"
            :class="item.field === item.prop ? item.class[scope.row[item.field]].name : item.class[scope.row[item.field]]">
            {{ item.field === item.prop ? item.class[scope.row[item.prop]].text : scope.row[item.prop] }}
          </div>
        </template>
      </el-table-column>

      <slot v-if="item.isSlotColumn"></slot>
    </template>
  </el-table>
</template>

<script>
export default {
  props: {
    data: {
      type: Array,
      default: () => []
    },
    tableData: {
      type: Array,
      default: () => []
    },
    filters: {
      type: Array,
      default: () => []
    },
    rowClassName: {
      type: Function,
      default: () => {}
    },
    cellClassNameFunction: {
      type: Function
    }
  },
  data() {
    return {
      radio: "",
      checkList: []
    }
  },
  watch: {
    tableData: {
      handler() {

      },
      deep: true
    }
  },
  methods: {
    handle(click, row, callbackName) {
      this.$emit(click, row, callbackName)
    },
    handleSelectionChange(val) {
      this.$emit('handleSelectionChange', val)
    },
    handleSelect(val,row){
      this.$emit('handleSelect',val,row)
    },
    handleSelectAll(val){
      this.$emit('handleSelectAll', val)
    },
    filterTag(value, row) {
      this.$emit('handleFilterTag', value, row)
    },
    singleElection(row) {
      this.$emit('handleSingleElection', row)
    },
    getRowKeys(row) {
      for(var i = 0; i < this.tableData.length; i++){
        if(this.tableData[i].reserveSelection){
          return row[this.tableData[i].rowKey];
        }
      }
    },
    radioSelected(row, e) {
        if (e.target.tagName === "INPUT") {
            if (this.radio === "") {
                this.radio = "1";
            } else {
                this.radio = "";
            }
            this.$emit('handleRadioSelected', row)
        }

    },
    selectRadio(index) {
      this.radio = index
    },
    selectCheckboxs(rows){
      this.$refs.elTable.clearSelection();
      rows && rows.forEach(row=>{
        this.$refs.elTable.toggleRowSelection(row,true);
      });
    }
  }
}
</script>

<style lang="less" scoped>
@import "../../style/variable.less";

.table-handle-right {
  text-align: right;

  /deep/ .el-button > span {
    margin-left: 4px;
  }
}

.table-batch-update {
  .checked {
    line-height: 32px;
    margin-right: 10px;

    span {
      color: @naColor;
      margin: 0 6px;
    }
  }
}

/deep/ .table-header {
  background-color: #f1f6ff !important;
}

/deep/ .el-table {
  margin-top: 20px;
}

.table-body {
  margin-top: 0;

  .normal {
    color: @normal;
  }

  .abnormal {
    color: @abnormal;
  }
}
</style>