<template>
  <el-dialog
      :before-close="handleClose"
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="dialogVisible"
      append-to-body
      custom-class="dialog"
      width="32%">
    <el-form v-model="form" label-position="left" label-width="auto">
      <el-form-item :label="$t('hardware.searchCondition')">
        <el-select
            v-model="form.sensorsId"
            class="select-change-p"
            filterable
            :placeholder="$t('common.placeholder')">
          <el-option
              v-for="(item, index) in sensors"
              :key="type === 1 ? item.idx : item.type"
              :label="item.sensorType.name + ' ' + item.sensorType.unit"
              :value="type === 1 ? item.idx : item.type">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('hardware.dateScope')" required>
        <el-date-picker
            v-model="form.time"
            :picker-options="pickerOptions"
            align="right"
            class="select-change-p"
            :end-placeholder="$t('common.endDate')"
            :range-separator="$t('common.most')"
            :start-placeholder="$t('common.startDate')"
            type="datetimerange">
        </el-date-picker>
      </el-form-item>
      <el-form-item v-if="type !== 1" :label="$t('common.timeInternet')">
        <el-select
            v-model="form.historyTimeInterval"
            class="select-change-p"
            filterable
            :placeholder="$t('common.placeholder')">
          <el-option
              v-for="(item, index) in timeInterval"
              :key="item.id"
              :label="item.name"
              :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-row justify="end" type="flex">
          <el-button class="margin-small-right" type="text" @click="handleExportHistoryDevice">{{ $t("hardware.searchExportResult") }}</el-button>
          <el-button :loading="loading" type="primary" @click="handleGetHistoryQuery">{{ $t("hardware.searchResult") }}</el-button>
        </el-row>
      </el-form-item>
    </el-form>
    <el-table
        v-loading="loading"
        border
        :data="historyData">
      <el-table-column label="#" type="index" width="70px">
        <template v-slot="scope">
            <span v-if="`${total !== 0}`">
              {{
                (items.pageNum - 1) * items.pageSize + scope.$index + 1
              }}
            </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('hardware.searchValue')" prop="value">
      </el-table-column>
      <el-table-column
          :prop="type == 1 ? 'exportDate' : 'gauge'"
          :label="$t('hardware.searchDate')"></el-table-column>
    </el-table>
    <div class="paging">
      <pagination
          v-show="total > 10"
          :layout="'prev, pager, next, total'"
          :limit.sync="items.pageSize"
          :page-count="5"
          :page.sync="items.pageNum"
          :total="total"
          @pagination="handleGetHistoryQuery"/>
    </div>
  </el-dialog>
</template>

<script>
import {ERROR, historyTimeInterval, items, TIME_FORMAT} from "@/utils/constant";
import Pagination from "@/components/Pagination";
import moment from "moment"
import {getExportHistoryDevice, getHistoryDevice} from "@/api/device";
import mixin from "@/utils/mixin";
import {postRoomBindingEquipmentHistroy} from "@/api/room";
import {postInstrumentBindingHistory} from "@/api/labDevice";
import {postDeviceExportHistoryData} from "@/api/dataExport";
import {mapMutations} from "vuex";

export default {
  name: "SeeHistoryData",
  components: {
    Pagination
  },
  // 1:硬件；2：设备，3：房间
  props: {
    type: {
      type: Number,
      default: 1
    }
  },
  data() {
      const _this = this;
    return {
      title: _this.$t("hardware.seeHistroy"),
      dialogVisible: false,
      form: {
        time: [],
        sensorsId: null,
        historyTimeInterval: 1
      },
      items: {
        pageSize: items.PAGE_SIZE,
        pageNum: 0
      },
      sensors: [],
      total: 0,
      loading: false,
      historyData: [],
      id: null,
      timeInterval: historyTimeInterval,
      pickerOptions: {
          disabledDate(time) {
              if (_this.form.time && _this.form.time.length) {
                  const currentTime = _this.form.time[0];
                  const threeMonths = 60 * 60 * 1000 * 24 * 90;
                  console.log(currentTime)
                  if (currentTime) {
                      return time.getTime() > currentTime.getTime() + threeMonths || time.getTime() < currentTime.getTime() - threeMonths;
                  }
              } else {
                  return false
              }
          },
          onPick({minDate, maxDate}) {
              // 当第一时间选中才设置禁用
              if (minDate && !maxDate && _this.form.time) {
                  _this.$set(_this.form.time, 0, minDate);
              }
              if (maxDate && _this.form.time) {
                  _this.$set(_this.form.time, 1, maxDate);
              }
          },
        shortcuts: [{
          text: _this.$t("common.recentlyWeek"),
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: _this.$t("common.recentlyMonth"),
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: _this.$t("common.recentlyThreeMonth"),
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            picker.$emit('pick', [start, end]);
          }
        }]
      },
      deviceName: "",
      thingsId: null
    }
  },
  methods: {
    handleClose() {
      this.items = {
        pageSize: items.PAGE_SIZE,
        pageNum: items.PAGE_NUM
      }
      this.total = 0;
      this.form.time = "";
      this.form.sensorsId = "";
      this.thingsId = null;
      this.dialogVisible = !this.dialogVisible;
    },
    /**
     *
     * @param id 硬件id
     * @param items 探头
     * @param deviceName 硬件名称
     * @param type
     * @param thingsId 设备或房间ID
     */
    open(id, items, deviceName, type, thingsId) {
      this.sensors = items;
      this.id = id;
      this.thingsId = thingsId;
      this.deviceName = deviceName;
      this.form.sensorsId = this.type === 1 ? this.sensors[0].idx : this.sensors[0].type;
      this.dialogVisible = !this.dialogVisible;
      this.historyData = [];
    },
    handleGetHistoryQuery() {
      if (!this.form.time) {
        return this.$message.error(this.$t("common.selectDateScope"));
      }
      this.loading = true;
      switch (this.type) {
        case 1:
          this.handleGetAlarmList();
          return
        case 2:
          this.getInstrumentHistory();
          return;
        case 3:
          this.getRoomHistory();
          return;
      }
    },
    // 获取硬件历史数据
    async handleGetAlarmList() {
      if (!this.form.time) {
        return this.$message.warning(this.$t("hardware.seeHistroyMessage"));
      }
      this.loading = true;
      this.historyData = [];
      try {
        const res = await getHistoryDevice({
          equipmentId: this.id,
          idx: this.form.sensorsId,
          beginTime: this.form.time ? moment(this.form.time[0]).format(TIME_FORMAT) : "",
          endTime: this.form.time ? moment(this.form.time[1]).format(TIME_FORMAT) : "",
          pageNum: this.items.pageNum,
          pageSize: this.items.pageSize,
        })
        this.loading = false;
        this.handleAssignment(res);
      } catch (e) {
        this.loading = false;
        this.total = 0;
        this.items = {
          pageSize: items.PAGE_SIZE,
          pageNum: items.PAGE_NUM
        }
        this.$message.error(ERROR);
      }

    },
    // 请求参数
    handlePassingParameters() {
      let idx = "";
      this.sensors.map(item => {
        this.sensors.map(item => {
          if (this.form.sensorsId === item.type) {
            idx = item.idx;
          }
        })
      })
      return {
        equipmentId: this.id,
        senorIdx: idx,
        startDate: this.form.time[0],
        endDate: this.form.time[1],
        pageNum: this.items.pageNum,
        pageSize: this.items.pageSize,
        thingsId: this.thingsId,
        historyTimeInterval: this.form.historyTimeInterval
      }
    },
    // 获取房间历史数据
    async getRoomHistory() {
      const params = this.handlePassingParameters();
      const res = await postRoomBindingEquipmentHistroy(params);
      this.loading = false;
      if (res.code) {
        this.handleAssignment(res);
      } else {
        this.$message.error(res.message);
      }
    },
    // 获取设备历史数据
    async getInstrumentHistory() {
      const params = this.handlePassingParameters();
      const res = await postInstrumentBindingHistory(params);
      this.loading = false;
      if (res.code) {
        this.handleAssignment(res);
      } else {
        this.$message.error(res.message);
      }
    },
    // 赋值
    handleAssignment(res) {
      this.historyData = res.items.list;
      this.loading = false;
      if (res.items.pageNum === items.PAGE_NUM) {
        this.total = res.items.total;
      }
    },
    handleExportHistory() {
      let name = "";
      if (this.historyData.length === 0) {
        return this.$message.error(this.$t("hardware.searchScope"));
      }
      for (const item of this.sensors) {
        if (item.idx === this.form.sensorsId) {
          name = item.sensorType.name;
          break;
        }
      }
      this.$message({
        message: this.$t("common.exportMessage"),
        type: "warning",
        duration: 2000
      });
      getExportHistoryDevice({
        equipmentId: this.id,
        beginTime: moment(this.form.time[0]).format(TIME_FORMAT),
        endTime: moment(this.form.time[1]).format(TIME_FORMAT),
        idx: this.form.sensorsId
      }).then(res => {
        const fileName = this.deviceName.replaceAll(".", "-");
        mixin.methods.download(
            res,
            fileName
        )
      })
    },
    ...mapMutations({
      handleDrawerClose: "DRAWERCLOSE",
    }),
    async handleExportHistoryDevice() {
      if (this.type === 1) {
        this.handleExportHistory();
        return
      }
      const obj = {
        beginTime: this.form.time[0],
        endTime: this.form.time[1],
        timeInterval: this.form.historyTimeInterval,
        type: this.type == 2 ? 4 : 11,
        types: [this.form.sensorsId],
        ids: [this.thingsId],
      }
      this.loading = true;
      try {
        const res = await postDeviceExportHistoryData(obj);
        this.loading = false;
        if (res.code) {
          this.$confirm(this.$t("common.exportMessage2"), this.$t("common.exportSuccess"), {
            confirmButtonText: this.$t("common.goTo"),
            cancelButtonText: this.$t("common.cancel"),
            type: "success"
          }).then(() => {
            this.handleDrawerClose()
            this.$router.push("/sys/data/export");
          }).catch(() => {

          })
        }
      } catch (e) {
        this.loading = false;
        throw e
      }

    },
  }
}
</script>
<style lang="less" scoped>


.import {
  display: flex;
  justify-content: flex-end;
}
</style>
