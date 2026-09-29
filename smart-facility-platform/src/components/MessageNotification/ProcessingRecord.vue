<template>
  <div class="processing">
    <el-dialog
      :title="$t('labDevice.disposeLog')"
      :before-close="handleClose"
      :close-on-click-modal="false"
      append-to-body
      width="55%"
      :visible.sync="dialogVisible">
      <div class="flex">
        <el-input
          v-model.trim="items.keyword"
          class="input-with-select margin-small-right"
          clearable
          :placeholder="$t('common.inputKeyword')"
          @keyup.enter.native="handleQuery()">
          <el-button
            slot="append"
            class="el-button-host"
            icon="icon-search1"
            @click="handleQuery()">
          </el-button>
        </el-input>
        <el-date-picker
          v-model="value1"
          type="datetimerange"
          @change="handleQueryDate"
          :range-separator="$t('common.most')"
          :start-placeholder="$t('common.startDate')"
          :end-placeholder="$t('common.endDate')">
        </el-date-picker>
      </div>
      <el-table
        :data="list"
        border
        max-height="350px"
        class=" margin-center"
        style="width: 100%">
        <el-table-column type="index" label="#" width="70"/>
        <el-table-column
          prop="instrumentName"
          :label="$t('labDevice.labDeviceName')">
        </el-table-column>
        <el-table-column
          prop="instrumentNo"
          :label="$t('labDevice.labDeviceNo')">
        </el-table-column>
        <el-table-column
          prop="labelNo"
          :label="$t('hardware.assetTag')">
        </el-table-column>
        <el-table-column
          prop="frontPositionName"
          min-width="90"
          :label="$t('labDevice.disposeBefore')">
        </el-table-column>
        <el-table-column
          prop="afterPositionName"
          min-width="90"
          :label="$t('labDevice.disposeAfter')">
        </el-table-column>
        <el-table-column
          prop="createUserName"
          :label="$t('hardware.processUsername')">
        </el-table-column>
        <el-table-column
          prop="departmentName"
          :label="$t('common.owningDepartment')">
        </el-table-column>
        <el-table-column
          prop="remark"
          :label="$t('room.groupMsg')">
        </el-table-column>
        <el-table-column
          prop="createDate"
          :label="$t('hardware.disposeTime')">
        </el-table-column>
      </el-table>
      <div class="paging">
        <pagination
          v-show="total > 10"
          :limit.sync="items.pageSize"
          :page.sync="items.pageNum"
          :total="total"
          @pagination="handleList"/>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from "@c/Pagination";
import {postPropertyPositionHandleRecord} from "@/api/property";
import moment from "moment";
import {TIME_FORMAT} from "@/utils/constant";

export default {
  name: "ProcessingRecord",
  components: {
    Pagination,
  },
  data() {
    return {
      dialogVisible: false,
      list: [],
      total: 0,
      items: {
        pageSize: 10,
        pageNum: 1,
        keyword: "",
        endDate: "",
        startDate: ""
      },
      value1: ""
    }
  },
  methods: {
    open() {
      this.dialogVisible = true;
      this.handleList();
    },
    handleList() {
      postPropertyPositionHandleRecord(this.items).then(res => {
        if (res.code) {
          this.list = res.items.list;
          this.total = res.items.total;
        }
      })
    },
    handleClose() {
      this.dialogVisible = false;
      this.$emit('close')
    },
    handleQuery() {
      this.items.pageNum = 1;
      this.items.pageSize = 10;
      this.handleList();
    },
    handleQueryDate(e) {
      console.log( e)
      if (e) {
        this.items.endDate = moment(e[1]).format(TIME_FORMAT);
        this.items.startDate = moment(e[0]).format(TIME_FORMAT);
      } else {
        this.items.endDate = "";
        this.items.startDate = "";
      }
      this.handleList();
    }
  }
}
</script>

<style scoped>

</style>