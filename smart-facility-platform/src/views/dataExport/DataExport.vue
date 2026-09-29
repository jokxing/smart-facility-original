<template>
  <div class="session">
    <div class="search-bar-container">
      <div>
        <input-append :keyword.sync="items.keyword" @handle="handleQuery"/>
      </div>
      <div>
        <el-button class="icon-refresh" @click="getDeviceExportList">&nbsp;{{ $t("hardware.reset") }}</el-button>
        <el-button @click="handleShowDataExportDialog" class="icon-download">&nbsp;{{ $t("hardware.startExport") }}</el-button>
      </div>
    </div>
    <data-export-log
        :exports="exports"
        :runningExportId="runningExportId"
        :page-size="items.pageSize"
        :total="total"
        :page-num="items.pageNum"
        :loading="loading"/>
    <div class="paging">
      <pagination
          v-show="total > 10"
          :limit.sync="items.pageSize"
          :page.sync="items.pageNum"
          :total="total"
          @pagination="getDeviceExportList"/>
    </div>
    <data-export-dialog ref="DataExportDialog" @handle="handleQuery"/>
  </div>
</template>

<script>
import DataExportDialog from "@/views/dataExport/components/DataExportDialog";
import DataExportLog from "@/views/dataExport/components/DataExportLog";
import {postDeviceExportList} from "@/api/dataExport";
import {BASE_URL, items} from "@/utils/constant"
import InputAppend from "@c/InputAppend/index";
import Pagination from "@c/Pagination/index";

export default {
  name: "DataExport",
  components: {
    DataExportLog,
    DataExportDialog,
    Pagination,
    InputAppend
  },
  data() {
    return {
      activeName: "first",
      exports: [],
      runningExportId:undefined,
      loading: false,
      items: {
        pageNum: items.PAGE_NUM,
        pageSize: items.PAGE_SIZE,
        keyword: ""
      },
      total: 0,
    }
  },
  created() {
    this.getDeviceExportList();
  },
  methods: {
    getRowKey(row) {
      return row.id
    },
    handleQuery() {
      this.items.pageNum = items.PAGE_NUM;
      this.items.pageSize = items.PAGE_SIZE;
      this.getDeviceExportList();
    },
    handleShowDataExportDialog() {
      this.$refs.DataExportDialog.open();
    },
    async getDeviceExportList() {
      this.loading = true;
      const res = await postDeviceExportList(this.items);
      if (res.code) {
        this.loading = false;
        this.exports = res.items.list;
        this.runningExportId = res.items.runningExportTaskId;
        if (res.items.pageNum === items.PAGE_NUM) {
          this.total = res.items.total;
        }
      } else {
        this.loading = false;
        this.$message.error(res.message);
      }
    }
  }
}
</script>

<style lang="less" scoped>
</style>
