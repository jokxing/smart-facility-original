<template>
  <el-dialog
      :before-close="handleClose"
      :close-on-click-modal="false"
      :title="$t('hardware.exportDetail') "
      :visible.sync="dialogVisible"
      append-to-body
      width="50%">
    <el-table
        stripe
        ref="multipleTable"
        v-loading="loading"
        border
        :data="detailList">
      <el-table-column label="#" type="index" width="70px">
        <template v-slot="scope">
            <span v-if="`${total !== 0}`">{{
                (items.pageNum - 1) * items.pageSize + scope.$index + 1
              }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.name')" prop="thingsName"/>
      <el-table-column :label="$t('common.no')" prop="thingsNo"/>
      <el-table-column :label="$t('common.owningDepartment')" prop="departmentName"/>
    </el-table>
    <div class="paging">
      <pagination
          v-show="total > 10"
          :limit.sync="items.pageSize"
          :page.sync="items.pageNum"
          :total="total"
          @pagination="getDeviceExportDetail"/>
    </div>
  </el-dialog>
</template>

<script>
import Pagination from "@c/Pagination/index";
import {items} from "@/utils/constant";
import {postDeviceExportDetail} from "@/api/dataExport";

export default {
  name: "DataDetailList",
  components: {
    Pagination,
  },
  data() {
    return {
      dialogVisible: false,
      items: {
        id: null,
        pageNum: items.PAGE_NUM,
        pageSize: items.PAGE_SIZE
      },
      detailList: [],
      total: 0,
      loading: false,
    }
  },
  methods: {
    handleClose() {
      this.dialogVisible = false;
    },
    open(id) {
      this.dialogVisible = true;
      this.items.id = id;
      this.getDeviceExportDetail();
    },
    async getDeviceExportDetail() {
      this.loading = true;
      try {
        const res = await postDeviceExportDetail(this.items);
        this.loading = false;
        if (res.code) {
          this.detailList = res.items.list;
          if (res.items.pageNum === items.PAGE_NUM) {
            this.total = res.items.total;
          }
        } else {
          this.$message.error(res.message)
        }
      } catch (e) {
        this.loading = false;
        throw e
      }
    }
  }
}
</script>

<style scoped>

</style>
