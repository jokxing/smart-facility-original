<template>
  <el-dialog
      :before-close="handleClose"
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="dialogVisible"
      append-to-body
      width="75%">
    <div class="data-export">
      <div class="data-export-left">
        <div>
          <el-radio-group v-model="radio" @change="getList">
              <el-radio-button :label="1">{{ $t('hardware.hardware') }}</el-radio-button>
              <el-radio-button :label="2">{{ $t('common.equipment') }}</el-radio-button>
            <el-radio-button :label="3">{{ $t('common.room') }}</el-radio-button>
          </el-radio-group>
        </div>
        <div class="search">
          <select-department
              :department-id.sync="items.departmentId"
              :is-company="true"
              :select-tree-value.sync="items.departmentId"
              @change="handleQuery"/>
          <el-input
              v-model="items.keyword"
              class="input-with-select"
              :placeholder="$t('common.inputKeyword')"
              @keyup.enter.native="handleQuery">
            <el-button
                slot="append"
                class="el-button-host"
                icon="icon-search1"
                @click="handleQuery">
            </el-button>
          </el-input>
        </div>
        <div class="checked">{{ $t("common.multipleSelection") }}<span>{{ multipleSelection.length }}</span>{{ $t("hardware.exportNum") }}</div>
        <el-table
            ref="multipleTable"
            v-loading="loading"
            :data="exportData"
            stripe
            border
            :row-key="getRowKey"
            @selection-change="handleSelectionChange">
          <el-table-column :reserve-selection="true" type="selection" width="50"/>
          <el-table-column label="#" type="index" width="70px">
            <template v-slot="scope">
            <span v-if="`${total !== 0}`">{{
                (items.pageNum - 1) * items.pageSize + scope.$index + 1
              }}</span>
            </template>
          </el-table-column>
            <el-table-column :label="$t('common.name')" prop="thingsName"/>
            <el-table-column :label="$t('common.no')" prop="no"/>
            <el-table-column :label="$t('common.owningDepartment')" prop="departmentName"/>
        </el-table>
        <div class="paging">
          <pagination
              v-show="total > 10"
              :limit.sync="items.pageSize"
              :page.sync="items.pageNum"
              :total="total"
              @pagination="getList"/>
        </div>
      </div>
      <div class="center-line"></div>
      <div class="data-export-right">
        <el-form label-width="auto" label-position="left">
          <el-form-item :label="$t('hardware.sensorStr')" required>
          </el-form-item>
            <el-checkbox-group v-model="checkList">
                <el-checkbox label="0" @change="handleAllCheck">{{ $t("common.all") }}</el-checkbox>
                <el-checkbox v-for="item in sensorsList" :key="item.type" :label="item.type">{{ item.name }}</el-checkbox>
            </el-checkbox-group>
          <el-form-item :label="$t('common.exportInterval')" required>
          </el-form-item>
            <el-select
                v-model="interval"
                class="select-change-p"
                filterable
                :placeholder="$t('common.placeholder')">
                <el-option
                    v-for="(item) in timeInterval"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id">
                </el-option>
            </el-select>
          <el-form-item :label="$t('hardware.dayScope')" required>
          </el-form-item>
            <el-date-picker
                v-model="datetimer"
                :picker-options="pickerOptions"
                align="right"
                class="select-change-p"
                :end-placeholder="$t('common.endDate')"
                :range-separator="$t('common.most')"
                :start-placeholder="$t('common.startDate')"
                type="datetimerange"
                @change="handleDate"
                value-format="yyyy-MM-dd HH:mm:ss">
            </el-date-picker>
        </el-form>
        <div class="paging">
          <el-button style="width: 100%" type="primary" :loading="subLoading" @click="handleExport">{{ $t("hardware.startExport") }}</el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import SelectDepartment from "@c/SelectdePartment";
import {historyTimeInterval, items} from "@/utils/constant"
import Pagination from "@c/Pagination/index";
import {postDeviceExportHistoryData, postInstrumentExportList} from "@/api/dataExport";
import {postmonitorIndicatorExportHistory, postMonitorIndicatorExportList} from "@/api/monitorIndicator";
import {picker1} from "@/views/assetManagement/components/mixin";

export default {
  name: "DataExportDialog",
  components: {
    Pagination,
    SelectDepartment
  },
  data() {
      const _this = this;
    return {
      title: _this.$t("route.dataExport"),
      dialogVisible: false,
      radio: 1,
      items: {
        keyword: "",
        departmentId: "",
        type: 2,
        pageSize: items.PAGE_SIZE,
        pageNum: items.PAGE_NUM
      },
      total: 0,
      exportData: [],
      checkList: [],
      sensorsList: [],
      interval: 1,
      pickerOptions: {
          disabledDate(time) {
              if (_this.datetimer && _this.datetimer.length) {
                  const currentTime = new Date(_this.datetimer[0]);
                  const threeMonths = 60 * 60 * 1000 * 24 * 1095;
                  if (currentTime) {
                      return time.getTime() > currentTime.getTime() + threeMonths || time.getTime() < currentTime.getTime() - threeMonths;
                  }
              } else {
                  return false
              }
          },
          onPick({minDate, maxDate}) {
              // 当第一时间选中才设置禁用
              if (minDate && !maxDate) {
                  if (_this.datetimer) {
                      _this.$set(_this.datetimer, 0, minDate);
                  }
              }
              if (maxDate) {
                  if (_this.datetimer) {
                      _this.$set(_this.datetimer, 1, maxDate);
                  }
              }
          },
      },
      datetimer: [],
      loading: false,
      multipleSelection: [],
      timeInterval: historyTimeInterval,
      subLoading: false,
      allChecked: false,
      list: []
    }
  },
  watch: {
    radio: function (newValue) {
      this.items.keyword = "";
      this.items.departmentId = "";
      this.resetItems();
    },
    multipleSelection: {
      handler: function (newValue) {
        if (newValue.length === 0) {
          this.checkList = [];
          this.allChecked = false;
        }
        const obj = newValue.reduce((prev, current) => {
          prev[current] = true;
          return prev
        }, {})
        this.sensorsList = [];
        if (this.list) {
          this.list.map(item => {
            if (obj[item.thingsId] && item.sensorIds) {
              item.sensorIds.map(sensors => {
                this.sensorsList.push({
                  type: sensors.monitorSensorId,
                  name: sensors.monitorSensorName
                });
              })
            }
          })
        }
        let map = new Map();
        for (let item of this.sensorsList) {
          if (!map.has(item.type)) {
            map.set(item.type, item);
          }
        }
        this.sensorsList = [...map.values()];
        if (this.allChecked) {
          this.sensorsList.map(item => {
            this.checkList.push(item.type);
          })
          this.checkList = [...new Set(this.checkList)];
        }
      },
      deep: true
    },
    checkList: {
      handler: function (newArray) {
        if (newArray.length - 1 !== this.sensorsList.length) {
          this.allChecked = false;
          this.checkList.map((item, index) => {
            if (Number(item) === 0) {
              this.checkList.splice(index, 1);
            }
          })
        }
        if (newArray.length === this.sensorsList.length && newArray.length !== 0) {
          this.checkList.push("0");
          this.allChecked = true;
        }
      },
      deep: true
    }
  },
  methods: {
      handleDate(arr) {
          if (arr && arr.length) {
              this.datetimer = arr;
          } else {
              this.datetimer = [];
          }
      },
    getList() {
      this.loading = true;
      this.items.type = this.radio;
      this.getEquipmentList();
    },
    resetItems() {
      this.interval = 1;
      this.items.pageNum = items.PAGE_NUM;
      this.items.pageSize = items.PAGE_SIZE;
      this.multipleSelection = [];
      this.datetimer = [];
      this.checkList = [];
      this.$refs.multipleTable.clearSelection();
    },
    handleQuery() {
      this.resetItems();
      this.getList();
    },
    handleClose() {
      this.dialogVisible = false;
      this.resetItems();
    },
    open() {
      this.dialogVisible = true;
      this.getList()
    },
    getRowKey(row) {
      return row.thingsId
    },
    async getEquipmentList() {
      this.exportData = [];
      let res = await postMonitorIndicatorExportList(this.items);
      try {
        this.loading = false;
        this.exportData = res.items.list;
        this.list = res.items.list;
        if (res.items.pageNum === items.PAGE_NUM) {
          this.total = res.items.total;
        }
      } catch (e) {
        this.loading = false;
        throw e
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = [];
      val.map(item => {
        this.multipleSelection.push(item.thingsId);
      })
    },
    handleAllCheck(value) {
      this.allChecked = value;
      if (value) {
        this.sensorsList.map(item => {
          this.checkList.push(item.type);
        })
        this.checkList = [...new Set(this.checkList)];
      } else {
        this.checkList = [];
      }
    },
    handleVerify() {
      if (!this.checkList.length) {
        this.$message.error(this.$t("hardware.exportSensors"));
        return false
      }
      if (!this.datetimer.length) {
        this.$message.error(this.$t("hardware.exportDateScope"));
        return false
      }
      return true
    },
    async handleExport() {
      if (!this.handleVerify()) {
        return
      }
      let sensorIds = [];
      this.checkList.map(item => {
        if (Number(item) !== 0) {
          sensorIds.push(item)
        }
      })
      const obj = {
        beginTime: this.datetimer[0],
        endTime: this.datetimer[1],
        timeInterval: this.interval,
        objType: this.radio,
        sensorIds,
        objIds: this.multipleSelection
      };
      this.subLoading = true;
      const res = await postmonitorIndicatorExportHistory(obj);
      this.subLoading = false;
      if (res.code) {
        this.$confirm(this.$t("hardware.exportDownload"), this.$t("common.exportSuccess"), {
          cancelButtonText: this.$t("common.cancel"),
          confirmButtonText: this.$t("hardware.goOn"),
          type: "success"
        }).then(() => {
          this.resetItems();
        }).catch(() => {
          this.$emit("handle");
          this.resetItems();
          this.dialogVisible = false;
        })
      } else {
        this.$message.error(res.message)
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import "../../../../src/style/variable";

.data-export {
  width: 100%;
  height: 600px;
  overflow: hidden;
  display: flex;
  justify-content: flex-start;

  .data-export-left {
    width: 70%;
    overflow-y: auto;
    margin-right: 24px;
    position: relative;

    /deep/ .el-table {
      height: 400px !important;
      overflow-y: auto;

    }

    .search {
      display: flex;
      margin: 16px 0;
    }

    .checked {
      margin: 16px 0;

      span {
        color: @blue;
        margin: 0 8px;
      }
    }

    .paging {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      margin: 0 auto;
      background: #FFFFFF;
    }
  }

  .data-export-right {
    border-left: 1px solid @999;
    padding-left: 24px;
    width: 30%;
  }
}
</style>
