<template>
  <el-dialog
      :before-close="handleClose"
      :close-on-click-modal="false"
      :visible.sync="dialogVisible"
      append-to-body
      :title="$t('doorMagneticCamera.todayExceptionsNums')"
      @opened="opened"
      custom-class="reset-dialog-titleBody-padding">
    <el-row justify="end" type="flex" v-if="showClearMessageBtn">
      <el-button type="primary" :disabled="total == 0" @click="handleClearData">{{ $t('hardware.clearHistroyMessage') }}</el-button>
    </el-row>
    <el-table
        v-loading="loading"
        :data="tableData"
        class="margin-center"
        border
        size="medium">
      <el-table-column :label="$t('common.tableIndex')" type="index" width="70px"/>
      <el-table-column :label="$t('doorMagneticCamera.exceptionContent')" prop="todayErrorTypeStr"/>
      <el-table-column :label="$t('doorMagneticCamera.reportTime')" prop="todayReportTime">
          <template v-slot="scope">
              {{ scope.row.todayReportTime | localToUtc }}
          </template>
      </el-table-column>
    </el-table>
    <div class="paging">
      <pagination
          v-show="total > pageInfo.pageSize"
          :layout="'prev, pager, next, total'"
          :limit.sync="pageInfo.pageSize"
          :page.sync="pageInfo.pageNum"
          :total="total"
          :isBut="false"
          @pagination="handlePaginationChange"/>
    </div>
  </el-dialog>
</template>

<script>
import { queryErrorData, clearErrorData } from '@/api/doorMagneticCamera'
import {items} from "@/utils/constant";
import Pagination from "@/components/Pagination";

export default {
  name: "ExceptionsNumsDialog",
  components: {
    Pagination
  },
  props: {
    showClearMessageBtn: {
      type: Boolean,
      default: true
    },
    dialogVisible: {
      type: Boolean
    },
    cameraInfo: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      tableData: [],
      loading: false,
      total: 0,
      pageInfo: {
        pageNum: items.PAGE_NUM,
        pageSize: items.PAGE_SIZE
      }
    }
  },
  methods: {
    opened() {
      this.handleGetHistoryQuery();
    },
    handleClose() {
      this.tableData = [];
      this.$emit('close')
    },
    handlePaginationChange (page) {
      this.pageInfo.pageSize = page.limit
      this.pageInfo.pageNum = page.page
      this.handleGetHistoryQuery()
    },
    handleGetHistoryQuery() {
      queryErrorData({...this.pageInfo, ...this.cameraInfo}).then(res => {
        if (res.code) {
          this.tableData = res.items.list;
          this.total = res.items.total;
        } else {
          this.$message.error(res.message);
        }
        this.loading = false;
      })
    },
    handleClearData() {
      this.$confirm(this.$t('doorMagneticCamera.clearErrorMessage1'), this.$t('common.hint'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: "warning"
      }).then(() => {
        clearErrorData({contactNo: this.cameraInfo.contactNo}).then(res => {
          if (res.code) {
            this.handleGetHistoryQuery();
            this.$message.success(this.$t('doorMagneticCamera.clearErrorSuccess'));
            this.handleClose()
          } else {
            this.$message.error(res.message);
          }
        })
      }).catch(() => {
        this.$message.info(this.$t('common.deleteCanceled'));
      })
    },
  }
}
</script>

<style scoped>

</style>
