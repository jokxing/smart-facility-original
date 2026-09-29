<template>
  <div class="session">
    <div class="handleAndScreen">
      <el-row :gutter="10" justify="space-between" type="flex">
        <div>
          <el-col :span="3">
            <SelectDepartment @setDepartmentId="setDepartmentId"></SelectDepartment>
          </el-col>
          <el-col :span="3">
            <el-select
                v-model="type"

                :placeholder="$t('system.changeEventType')"
                @change="handleSelectType"
            >
              <el-option
                  v-for="(item, index) in typeList"
                  :key="index"
                  :label="item.label"
                  :value="item.value"
              ></el-option>
            </el-select>
          </el-col>
          <el-col :span="3">
            <el-select
                v-model="userId"

                :placeholder="$t('system.changeHandler')"
                @change="handleUserChange"
            >
              <el-option
                  v-for="(item, index) in userList"
                  :key="index"
                  :label="item.name"
                  :value="item.id"
              ></el-option>
            </el-select>
          </el-col>
          <el-col :span="5">
            <el-date-picker
                v-model="dateBtween"
                :default-time="['00:00:00', '23:59:59']"
                :picker-options="pickerOptions"
                :end-placeholder="$t('common.endDate')"
                :range-separator="$t('common.most')"
                :start-placeholder="$t('common.startDate')"
                type="daterange"
                @change="handlePicker"
            >
            </el-date-picker>
          </el-col>
          <el-col :span="3">
            <el-input
                v-model="inputKeyword"
                class="input-with-select"
                :placeholder="$t('common.inputKeyword')"
                @blur="handleKeywordBlur"
                @keyup.enter.native="handleKeywordBlur"
            >
              <el-button
                  slot="append"
                  class="el-button-host"
                  icon="icon-search1"
                  @click="handleKeywordBlur">
              </el-button>
            </el-input>
          </el-col>
        </div>
        <div>
          <el-button class="icon-download1" type="primary" @click="handleExport"> {{ $t('common.export') }}</el-button>
        </div>
      </el-row>
    </div>
    <SelfTable
        :columns="columns"
        :loading="tableLoading"
        :pageNum="pageNum"
        :pageSize="pageSize"
        :tabledata="dataSource"
        :total="total"
        @pageNumChange="handlePageNumChange"
        @pageSizeChange="handlePageSizeChange"
    >
      <el-table-column
          slot="detail"
          :label="$t('system.eventDetail')"
          show-overflow-tooltip
      >
        <template v-slot="scope">
          <div>{{ scope.row.operateContent }}</div>
        </template>
      </el-table-column>
        <el-table-column slot="logDate" :label="$t('system.logDate')">
            <template v-slot="{row}">
                {{ row.logDate | localToUtc }}
            </template>
        </el-table-column>
    </SelfTable>
  </div>
</template>

<script>
import SelfTable from "@/components/Table";
import SelectDepartment from "../labDevice/components/SelectDepartment";
import {items} from "@/utils/constant.js";
import {getLogList, getLogUserList, getLogExport} from "@/api/system";
import {serializeScreenData} from "@/utils/methods.js";
import mixin from "@/utils/mixin";
import moment from "moment";
import {ERROR} from "@/utils/constant";
import i18n from "@/i18n";
const TABLECOLUMN = [
  {
    title: i18n.t('system.eventType'),
    dataIndex: "operateEvents",
  },
  {
    title: i18n.t('system.eventDetail'),
    dataIndex: "operateContent",
    slot: "detail",
  },
  {
    title: i18n.t('system.handler'),
    dataIndex: "userName",
  },
  {
    title: i18n.t('common.department'),
    dataIndex: "departmentName",
  },
  {
    title: i18n.t('system.logDate'),
    dataIndex: "logDate",
      slot: 'logDate'
  },
  {
    title: i18n.t('hardware.ipAdress'),
    dataIndex: "ipAddress",
  },
];
const TYPELIST = [
  {
    label: i18n.t('common.add1'),
    value: 1,
  },
  {
    label: i18n.t('system.edit'),
    value: 2,
  },
  {
    label: i18n.t('common.delete'),
    value: 3,
  },
  {
    label: i18n.t('common.export'),
    value: 4,
  },
];
export default {
  components: {
    SelfTable,
    SelectDepartment
  },
  data() {
    let {PAGE_SIZE, PAGE_NUM} = items;
    const _this = this;
    return {
      typeList: serializeScreenData(TYPELIST),
      userList: [],
      dateBtween: [moment(new Date()).format("yyyy-MM-DD") + " 00:00:00", moment(new Date()).format("yyyy-MM-DD") + " 23:59:59"],
      columns: TABLECOLUMN,
      total: 0,
      dataSource: [],
      tableLoading: false,
      pageSize: PAGE_SIZE,
      pageNum: PAGE_NUM,
      type: "",
      userId: "",
      inputKeyword: "",
      keyword: "",
      startDate: "",
      endDate: "",
      checkedDate: 1, //用于时间选择判断第一次还是第二次
      // 部门ID
      departmentId: undefined,
      pickerOptions: {
        disabledDate(time) {
            if (_this.dateBtween) {
                const currentTime = new Date(_this.dateBtween[0]);
                const threeMonths = 60 * 60 * 1000 * 24 * 30;
                if (currentTime) {
                    return time.getTime() > currentTime.getTime() + threeMonths || time.getTime() < currentTime.getTime() - threeMonths;
                }
            } else {
                _this.dateBtween = [];
            }

        },
        onPick({minDate, maxDate}) {
          // 当第一时间选中才设置禁用
          if (minDate && !maxDate) {
              console.log('minDate', minDate)
            _this.checkedDate = 0;
            _this.$set(_this.dateBtween, 0, minDate);
          }
          if (maxDate) {
            _this.checkedDate = 1;
            _this.$set(_this.dateBtween, 1, maxDate);
          }
        },
      }
    };
  },

  computed: {
    tableParam() {
      let {pageSize, pageNum, dateBtween, type, userId, keyword, departmentId, isFresh} =
          this;
      return {
        pageSize,
        pageNum,
        dateBtween,
        type,
        userId,
        keyword,
        departmentId
      };
    },
  },
  watch: {
    tableParam: {
      handler(newVal) {
        let {pageSize, pageNum, dateBtween, type, userId, keyword, departmentId} = newVal;
        let obj = {pageSize, pageNum, keyword, departmentId};
        if (!type || type !== "全部") {
          obj = {...obj, type};
        }
        if (!userId || userId !== "全部") {
          obj = {...obj, userId};
        }
        if (dateBtween) {
          let startDate = dateBtween[0];
          let endDate = dateBtween[1];

          this.startDate = startDate;
          this.endDate = endDate;

          obj = {...obj, startDate, endDate};
        }
        if (this.checkedDate === 1) {
          this.getListAsync(obj);
        }
      },
      immediate: true,
    },
  },
  created() {
    this.getOperatorListAsync();
  },
  methods: {
    // 选中部门id
    setDepartmentId(val) {
      this.departmentId = val;
    },
    async getListAsync(params) {
      this.tableLoading = true;
      try {
        let temp = [];
        let total = 0;
        let result = await getLogList(params);
        if (result.code == 1) {
          if (result.items.list && result.items.list.length > 0) {
            temp = result.items.list;
            total = result.items.total;
          }
        } else {
          this.$message.error(result.message);
        }
        this.tableLoading = false;
        this.dataSource = temp;
        this.total = total;
      } catch (err) {
        this.tableLoading = false;
        this.dataSource = [];
        this.total = 0;
        this.$message.error(ERROR);
        throw err;
      }
    },
    async getOperatorListAsync() {
      try {
        let temp = [];
        let result = await getLogUserList();
        if (result.code == 1) {
          temp = result.items;
          temp.unshift({id: "全部", name: this.$t('common.all')});
        } else {
          this.$message.error(result.message);
        }
        this.userList = temp;
      } catch (err) {
        this.userList = [];
        this.$message.error(ERROR);
        throw err;
      }
    },

    async getLogExportAsync() {
      try {
        this.$message.warning(this.$t('common.exportMessage'));
        var data = {
          keyword: this.keyword,
          departmentId: this.departmentId,
          type: this.type === '全部' ? '' : this.type,
          userId: this.userId === '全部' ? '' : this.userId,
          startDate: this.startDate,
          endDate: this.endDate
        };
        let result = await getLogExport(data);
        setTimeout(function () {
            const data = moment(new Date()).format("YYYYMMDDHHmmss");
            mixin.methods.download(
                result,
                decodeURIComponent(this.$t('system.export') + data, "UTF-8")
            )
        }, 1000);
      } catch (err) {
        this.$message.error(ERROR);
        throw err;
      }
    },

    handleExport() {
      this.getLogExportAsync();
    },

    handlePicker(value) {
      this.pageNum = items.PAGE_NUM;
      if (!value) {
          this.dateBtween = [];
      }
    },

    handleSelectType() {
      this.pageNum = items.PAGE_NUM;
    },
    handleUserChange() {
      this.pageNum = items.PAGE_NUM;
    },

    handleKeywordBlur() {
      this.keyword = this.inputKeyword;
      this.pageNum = items.PAGE_NUM;
    },
    handlePageNumChange(num) {
      this.pageNum = num;
    },
    handlePageSizeChange(size) {
      this.pageSize = size;
    },
  },
};
</script>
<style lang="less">
@import "./index.less";
</style>
<style lang="less" scoped>
@import "../../style/default.less";

.gap-default-left {
  margin-left: 20px;

  &:first-child {
    margin: 0;
  }
}

.pageContent {
  padding: 20px;
}

.handleAndScreen {
  height: 40px;
  margin-top: 10px;
  margin-bottom: 20px;

  /deep/ .el-date-editor--daterange.el-input__inner {
    width: 100%;
  }

  .btn-group {
    float: left;
  }

  .screen-group {
    float: right;

    .el-range-editor {
      .el-range-separator {
        line-height: 30px;
      }
    }

    .el-select {
      width: 200px;
    }

    .el-input {
      width: 200px;
    }

    .el-input__inner {
      height: 40px;
      line-height: 40px;
    }
  }
}
</style>
