<template>
  <el-dialog
    :before-close="handleClose"
    :close-on-click-modal="false"
    :title="title"
    :visible.sync="dialogVisible"
    append-to-body
    width="42%"
    custom-class="dialog"
  >
    <el-form v-model="form">
      <el-row justify="space-between" type="flex">
        <el-form-item :label="$t('hardware.dateScope')" label-width="100px">
          <el-date-picker
            v-model="form.time"
            :picker-options="pickerOptions"
            align="right"
            class="select-change-p"
            :end-placeholder="$t('common.endDate')"
            :range-separator="$t('common.most')"
            :start-placeholder="$t('common.startDate')"
            type="datetimerange"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="handleGetAlarmList">{{ $t('hardware.searchResult') }}</el-button>
            <el-button @click="handleGetAlarmListExport">{{ $t('common.export') }}</el-button>
        </el-form-item>
      </el-row>
    </el-form>
    <el-table class="seehistory-table" border v-loading="loading" :data="historyData">
      <el-table-column label="#" type="index" width="70px"></el-table-column>
      <el-table-column :label="$t('labDevice.startTime')" prop="startDate" min-width="160"></el-table-column>
      <el-table-column :label="$t('labDevice.endTime')" prop="endDate" min-width="160"></el-table-column>
      <el-table-column :label="$t('hardware.status')" prop="status" width="80">
        <template v-slot="scope">
          {{
            scope.row.status === 1
              ? $t('labDevice.runing')
              : scope.row.status === 0
              ? $t('labDevice.standbyOff')
              : $t('labDevice.standbyPower')
          }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('hardware.runDurationHMS')" prop="runDurationHMS">
      </el-table-column>
      <el-table-column :label="$t('hardware.electricity')" prop="electricity">
        <template v-slot="scope">
          {{ scope.row.electricity }}
        </template>
      </el-table-column>
    </el-table>
    <div class="paging">
      <pagination
        v-show="total > form.pageSize"
        :layout="'prev, pager, next, total'"
        :limit.sync="form.pageSize"
        :page.sync="form.pageNum"
        :total="total"
        @pagination="handleGetAlarmList"
      />
    </div>
  </el-dialog>
</template>

<script>
import { items, TIME_FORMAT } from "@/utils/constant";
import pagination from "@/components/Pagination";
import { getSmartElectricityHistory,exportSmartElectricityHistory } from "@/api/smartSocket";
import moment from "moment";
import mixin from "@/utils/mixin";

export default {
  name: "SeeHistoryData",
  components: {
    pagination,
  },

  data() {
      const _this = this;
    return {
      title: _this.$t('labDevice.powerHistoryLog'),
      dialogVisible: false,
      pickerOptions: {
        shortcuts: [
          {
            text: _this.$t('common.recentlyWeek'),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: _this.$t('common.recentlyMonth'),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: _this.$t('common.recentlyThreeMonth'),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            },
          },
        ],
      },
      form: {
        time: "",
        pageSize: items.PAGE_SIZE,
        pageNum: items.PAGE_NUM,
        deviceId: null,
      },
      loading: false,
      historyData: [],
      total: 0,
    };
  },
  methods: {
    handleClose() {
      this.dialogVisible = false;
    },
    open(id) {
      this.dialogVisible = true;
      this.form.deviceId = id;
    },
    handleGetAlarmList() {
      if (!this.form.time) {
        return this.$message.error(this.$t('common.selectTime'));
      }

      let obj = {
        endTime: moment(this.form.time[1]).format(TIME_FORMAT),
        pageNum: this.form.pageNum,
        pageSize: this.form.pageSize,
        deviceId: this.form.deviceId,
        startTime: moment(this.form.time[0]).format(TIME_FORMAT),
      };
      getSmartElectricityHistory(obj).then((res) => {
        if (res.items.pageNum === 1) {
          this.total = res.items.total;
        }
        this.historyData = res.items.list;
      });
    },
    // 导出历史记录
    handleGetAlarmListExport(){
      if (!this.form.time) {
        return this.$message.error(this.$t('common.selectTime'));
      }
      new Promise(resolve => {
        this.$message.warning(this.$t('common.exportMessage'));
        setTimeout(() => {
          resolve();
        }, 1500)
      }).then(() => {
        let obj = {
          endTime: moment(this.form.time[1]).format(TIME_FORMAT),
          deviceId: this.form.deviceId,
          startTime: moment(this.form.time[0]).format(TIME_FORMAT),
        };
        exportSmartElectricityHistory(obj).then(res => {
          const data = moment(new Date()).format("YYYYMMDDHHmmss");
          mixin.methods.download(
                  res,
                  decodeURIComponent(this.$t('labDevice.powerHistoryLog') + data, "UTF-8")
          )
        });
      })
    }
  },
};
</script>

<style scoped>
  .seehistory-table{
    height: 400px;
    overflow: auto;
  }
</style>
