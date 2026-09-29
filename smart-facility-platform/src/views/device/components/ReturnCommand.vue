<template>
  <el-dialog
      :before-close="handleClose"
      :close-on-click-modal="false"
      :visible.sync="dialogVisible"
      append-to-body
      :title="$t('hardware.seeEquipmentReport')"
      custom-class="reset-dialog-titleBody-padding">
    <el-row justify="end" type="flex" v-if="showClearMessageBtn">
      <el-button type="primary" @click="handleClearData" :disabled="tableData.length === 0">{{ $t('hardware.clearHistroyMessage') }}</el-button>
    </el-row>
    <el-table
        v-loading="loading"
        :data="tableData"
        class="margin-center"
        border
        size="medium">
      <el-table-column label="#" type="index" width="70px"/>
      <el-table-column :label="$t('hardware.commandText')" prop="commandText"/>
      <el-table-column :label="$t('hardware.backDate')" prop="createDate">
          <template v-slot="scope">
              {{ scope.row.createDate | localToUtc }}
          </template>
      </el-table-column>
    </el-table>
    <div class="paging">
      <pagination
          v-show="total > 10"
          :layout="'prev, pager, next, total'"
          :limit.sync="items.pageSize"
          :page.sync="items.pageNum"
          :total="total"
          @pagination="handleGetHistoryQuery"/>
    </div>
  </el-dialog>
</template>

<script>
import {getBackData, getClearData} from "@/api/device";
import {items} from "@/utils/constant";
import Pagination from "@/components/Pagination";

export default {
  name: "ReturnCommand",
  components: {
    Pagination
  },
  props: {
    showClearMessageBtn: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      dialogVisible: false,
      tableData: [],
      loading: false,
      total: 0,
      items: {
        equipmentNo: null,
        pageNum: items.PAGE_NUM,
        pageSize: items.PAGE_SIZE
      }
    }
  },
  methods: {
    open(type, row) {
      this.items.equipmentNo = row.no;
      this.dialogVisible = true;
      this.loading = true;
      this.handleGetHistoryQuery();
    },
    handleClose() {
      this.dialogVisible = false;
      this.tableData = [];
    },
    handleGetHistoryQuery() {
      getBackData(this.items).then(res => {
        if (res.code) {
          this.tableData = res.items.list;
          if (res.items.pageNum === items.PAGE_NUM) {
            this.total = res.items.total;
          }
        } else {
          this.$message.error(res.message);
        }
        this.loading = false;
      })
    },
    handleClearData() {
      this.$confirm(this.$t('hardware.clearHistoryMessage1'), this.$t('common.hint'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: "warning"
      }).then(() => {
        getClearData({equipmentNo: this.items.equipmentNo}).then(res => {
          if (res.code) {
            this.handleGetHistoryQuery();
            this.$message.success(this.$t('hardware.clearHistorySuccess'));
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
