<template>
  <div class="session main-table" v-loading="tableLoading">
    <div class="search-bar-container" v-if="$slots.searchForm">
      <slot name="searchForm"></slot>
    </div>
    <el-table
      :data="tableData"
      size="medium"
      ref="mainTable"
      stripe
      class="table-body"
      border
      header-cell-class-name="table-header"
      :row-class-name="rowClassName"
      :init-select-data="initSelectData"
      :span-method="spanMethod"
      :cell-class-name="cellClassNameFunction"
      @filter-change="filterTag"
      @selection-change="handleSelectionChange"
      @select="handleSelect"
      @select-all="handleSelectAll"
      @sort-change="handleSortChange"
    >
      <template v-for="(item, index) in tableColumns">
        <el-table-column
          v-if="item.type === 'index'"
          type="index"
          :index="indexMethod"
          :key="index"
          :label="item.label"
          :prop="item.prop"
          :width="item.width"
          :min-width="item.minWidth"
          :className="item.className"
          :align="item.align ? item.align : defaultAlign"
          v-bind="item.attrs">
        </el-table-column>
        <el-table-column
          v-if="
            !item.isButton &&
            !item.field &&
            !item.isSlot &&
            !item.filters &&
            !item.isRadio &&
            !item.isSlotColumn &&
            !item.isCheckbox &&
            item.type !== 'index'
          "
          :key="index"
          :reserve-selection="item.reserveSelection"
          :label="item.label"
          :type="item.type"
          :prop="item.prop"
          :width="item.width"
          :min-width="item.minWidth"
          :formatter="item.formatter"
          :className="item.className"
          :align="item.align ? item.align : defaultAlign"
          v-bind="item.attrs"
        >
        </el-table-column>
        <!-- 单选 -->
        <el-table-column
          v-if="item.isRadio"
          :key="index"
          :width="item.width || 60"
          :align="item.align ? item.align : defaultAlign"
        >
          <template slot-scope="scope">
            <el-radio
              class="table-radio"
              v-model="radio"
              :label="scope.$index"
              @click.native.prevent="radioClick(scope.$index, scope.row)"
              >&nbsp;
            </el-radio>
          </template>
        </el-table-column>
        <!-- 多选：多选可通过配置type: "selection"实现，因此这里注释了  -->
        <!-- <el-table-column
          :key="index"
          v-if="item.isCheckbox"
          type="selection"
          :width="item.width || 60"
          :align="item.align ? item.align : defaultAlign"
          :selectable="handleSelectable"
        ></el-table-column> -->

        <!-- 绑定事件 -->
        <el-table-column
          :key="index"
          v-if="item.isButton"
          :label="item.label"
          :type="item.type"
          :prop="item.prop"
          :width="item.width"
          :align="item.align ? item.align : defaultAlign"
        >
          <template slot-scope="scope">
            <a
              v-if="item.prop"
              link
              type="primary"
              size="small"
              @click="textLinkClick(item.prop, scope.row)"
            >
              {{ scope.row[item.prop] }}
            </a>

            <div v-else>
              <slot
                v-if="item.isButtonSlot"
                :isButton="true"
                :data="scope.row"
              ></slot>
              <el-button
                v-else
                v-for="btnItem in item.clickList"
                :key="btnItem.key"
                link
                type="text"
                :class="btnItem.class"
                v-show="
                  btnItem.showBtn
                    ? btnItem.showBtn(scope.row, scope.$index, btnItem)
                    : true
                "
                @click="handleBarClick(btnItem.key, btnItem, scope, $event)"
              >
                {{ btnItem.text }}
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
          :width="item.width"
          :min-width="item.minWidth"
          :align="item.align ? item.align : defaultAlign"
        >
          <template slot-scope="scope">
            <slot
              v-if="item.isStrings"
              :data="[scope.row[item.props[0]], scope.row[item.props[1]]]"
            ></slot>
            <slot
              v-else-if="item.judgeField"
              :data="[scope.row[item.prop], scope.row[item.judgeField]]"
            ></slot>
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
          :prop="item.prop"
          :width="item.width"
          :align="item.align ? item.align : defaultAlign"
        >
          <template slot-scope="scope">
            <div
              v-if="item.class[scope.row[item.field]]"
              :class="
                item.field === item.prop
                  ? item.class[scope.row[item.field]].name
                  : item.class[scope.row[item.field]]
              "
            >
              {{
                item.field === item.prop
                  ? item.class[scope.row[item.prop]].text
                  : scope.row[item.prop]
              }}
            </div>
          </template>
        </el-table-column>

        <slot v-if="item.isSlotColumn"></slot>
      </template>
    </el-table>
    <div v-if="isPagination || $slots.pageTotalInfo">
      <div v-if="$slots.pageTotalInfo">
        <slot name="pageTotalInfo"></slot>
      </div>
      <div class="paging">
        <pagination
          v-if="isPagination"
          :limit.sync="page.pageSize"
          :page.sync="page.pageNum"
          :total="total"
          :page-sizes="$store.state.pageSizes"
          @pagination="handlePaginationChange"
        />
      </div>
    </div>
  </div>
</template>
<script>
import { items } from '@/utils/constant'
import { deleteObjectEmptyLable } from '@/utils/methods'
import { get } from 'lodash'
import Pagination from '@/components/Pagination/index'
export default {
  props: {
    api: { type: Function }, // 表格的接口函数
    isPagination: {
      type: Boolean,
      default: true
    },
    tableColumns: {
      type: Array,
      default: () => []
    },
    filters: {
      type: Array,
      default: () => []
    },
    rowClassName: {
      type: Function,
      default: () => { }
    },
    cellClassNameFunction: {
      type: Function
    },
    initSelectData: {
      type: Function
    },
    // 合并方法
    spanMethod: {
      type: Function,
      default () {
        return function () { }
      }
    },
    // 接口查询参数
    tableParams: {
      type: Object,
      default () {
        return {}
      }
    },
    requiredParam: { type: Function }, // 表格请求前的参数钩子函数
    resMethod: { type: Function }, // 表格数据返回的钩子函数
    // 数组的获取路径
    listPath: {
      type: String,
      default: 'items.list'
    },
    // 设置行是否可勾选
    handleSelectable: {
      type: Function,
      default () {
        return function () {
          return true
        }
      }
    }
  },
  components: {
    Pagination
  },
  data () {
    return {
      total: 0,
      page: {
        pageSize: items.PAGE_SIZE,
        pageNum: items.PAGE_NUM
      },
      tableData: [],
      radio: '',
      checkList: [],
      tableLoading: false,
      defaultAlign: 'left' // 单元格默认对齐方式
    }
  },
  computed: {
    // 表格是否单选
    isSelecRadio () {
      return this.tableColumns.find(v => v.isRadio && v)?.isRadio
    }
  },
  methods: {
    indexMethod (index) {
      let newIndex = index + 1
        // + (this.page.pageSize ? this.page.pageSize : 0) *
        // (this.page.pageNum - 1) ||
        // this.page.pageNo - 1 ||
        // ''
      return newIndex
    },
    handlePaginationChange () {
      this.getTableData(this.page.pageNum)
    },
    async getTableData (pageNum = 1) {
      this.tableLoading = true
      let params = {}
      //当传了页码时 改变tableParams.pageNum，用来重置currentPage
      if (pageNum) {
        this.page.pageNum = pageNum
      }

      if ({}.toString.call(this.requiredParam) === '[object Function]') {
        params =
          (await this.requiredParam(this.tableParams)) || this.tableParams
      } else {
        params = Object.assign({}, this.tableParams)
      }

      params = Object.assign({}, params, this.page)

      // 如果是不分页的，不需要传页码、页容量
      if (!this.isPagination) {
        delete params.pageNum
        delete params.pageSize
      }

      //删除空值
      params = deleteObjectEmptyLable(params)

      let res
      try {
        res = await this.api(params)
        if ({}.toString.call(this.resMethod) === '[object Function]') {
          res = (await this.resMethod(res)) || res
        }
        this.tableLoading = false
        this.total = res?.items?.total || 0
        this.tableData = get(res, this.listPath) || []
        // 手动清空单选情况下已选的数据
        this.isSelecRadio && this.clearRadioSelection()
      } catch (e) {
        this.tableLoading = false
        throw e
      }
    },
    textLinkClick (prop, row) {
      this.$emit('textLinkClick', prop, row)
    },
    // 操作栏相关事件
    async handleBarClick (type, item, scope) {
      this.$emit('handleBarClick', type, scope)
    },
    handleSelectionChange (val) {
      this.$emit('selectionChange', val)
    },
    handleSelect (val, row) {
      this.$emit('handleSelect', val, row)
    },
    handleSelectAll (val) {
      this.$emit('handleSelectAll', val)
    },
    filterTag (value, row) {
      this.$emit('handleFilterTag', value, row)
    },
    handleSortChange (e) {
      this.$emit('sortChange', e)
    },
    // 单选
    radioClick (e, row) {
      if (e === this.radio) {
        this.clearRadioSelection()
      } else {
        this.radio = e
        this.handleSelectionChange([row])
      }
    },
    // 清空单选情况下，已选的数据
    clearRadioSelection () {
      this.radio = ''
      this.handleSelectionChange([])
    },
    // 清空选中
    clearSelection () {
      this.$refs.mainTable.clearSelection()
    }
  }
}
</script>
<style lang="less" scoped>
@import "../../../style/variable.less";

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
  .table-radio /deep/ .el-radio__inner {
    border-radius: 2px;
  }
  .table-radio /deep/ .el-radio__input .el-radio__inner {
    position: relative;
  }
  .table-radio /deep/ .el-radio__input.is-checked .el-radio__inner::after {
    transform: rotate(45deg) scaleY(1);
  }
  .table-radio /deep/ .el-radio__input .el-radio__inner:after {
    box-sizing: content-box;
    content: "";
    border: 1px solid #fff;
    border-left-width: 0;
    border-top-width: 0;
    background: transparent;
    height: 7px;
    left: 4px;
    position: absolute;
    top: 1px;
    transform: rotate(45deg) scaleY(0);
    width: 3px;
    transition: transform 0.15s ease-in 0.05s;
    transform-origin: center;
    border-radius: 0;
    box-shadow: none;
  }
}
.main-table
  /deep/
  .table-radio.el-radio:focus:not(.is-focus):not(:active):not(.is-disabled)
  .el-radio__inner {
  box-shadow: none;
}
.main-table .search-bar-container {
  margin-bottom: 10px;
}
</style>
