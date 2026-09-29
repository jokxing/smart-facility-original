<template>
  <el-dialog
      :close-on-click-modal="false"
      :title="dialogTitle"
      :visible.sync="visible"
      :before-close="handleClose"
      width="40%"
      append-to-body>
    <div class="search-bar-container">
      <el-input
          v-model="query.key"
          class="input-with-select"
          :placeholder="$t('transport.inputDriverNameOrTel')"
          @keyup.enter.native="handleFilter">
        <el-button
            icon="icon-search1"
            slot="append"
            class="el-button-host"
            @click="handleFilter"/>
      </el-input>
    </div>

    <el-table
        stripe
        v-loading="tableLoading"
        :data="list"
        border
        class="margin-center">

      <el-table-column
          fixed="left"
          label="#"
          width="60px"
          align="center">
        <template v-slot="scope">
          {{ (query.pageNum - 1) * query.pageSize + scope.$index + 1 }}
        </template>
      </el-table-column>

      <el-table-column prop="driverName" :label="$t('transport.driverName1')"/>
      <el-table-column prop="sex" :label="$t('transport.sex')">
        <template v-slot="{row}">
          {{ row.sex === 1 ? $t('transport.man') : $t('transport.woman') }}
        </template>
      </el-table-column>
      <el-table-column prop="tel" :label="$t('system.phone')"/>

      <el-table-column :label="$t('common.handle')" width="100px">
        <template v-slot="{row}">
          <el-button type="text" @click="handleSelect(row.id)">{{ $t('system.change') }}</el-button>
        </template>
      </el-table-column>

    </el-table>

    <div class="paging">
      <Pagination
          v-show="total>0"
          :total="total"
          :limit.sync="query.pageSize"
          :page.sync="query.pageNum"
          @pagination="getList"/>
    </div>


  </el-dialog>
</template>

<script>
import {getUserDriverList} from "@/api/transport";
import Pagination from "@c/Pagination"
import i18n from "@/i18n";
export default {
  name: "SelectDriverDialog",
  components: {
    Pagination
  },
  props: {
    dialogTitle: {
      type: String,
      default: i18n.t('transport.changeDriver1'),
    }
  },
  data() {
    return {
      selectedCallback: null,
      visible: false,

      // 表格数据
      list: [],
      total: 0,
      tableLoading: false,
      // 分页查询信息
      query: {
        pageNum: 1,
        pageSize: 10,
        key: ""
      },

    }
  },
  methods: {
    openSelect(selectedCallback) {
      this.selectedCallback = selectedCallback;
      this.visible = true;
      this.getList();
    },
    getList() {
      this.tableLoading = true;
      getUserDriverList(this.query).then(res => {
        if (res.code) {
          let {list, total} = res.items
          this.list = list
          this.total = total
        } else {
          this.$message.error(res.message)
        }
      }).finally(() => {
        this.tableLoading = false;
      })
    },
    handleFilter() {
      this.query.pageNum = 1;
      this.getList();
    },
    handleClose() {
      this.visible = false;
      this.selectedCallback = null;
    },
    handleSelect(driverId) {
      if (this.selectedCallback) {
        this.selectedCallback(driverId);
      }
      this.handleClose();
    }
  },
}
</script>

<style scoped>

</style>