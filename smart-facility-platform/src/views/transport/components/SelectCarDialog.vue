<template>
  <el-dialog
      :close-on-click-modal="false"
      :title="dialogTitle"
      :visible.sync="visible"
      :before-close="handleClose"
      width="60%"
      append-to-body>
    <div class="search-bar-container">
      <el-input
          v-model="query.carBoard"
          class="input-with-select"
          :placeholder="$t('transport.inputCarBoard')"
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

      <el-table-column prop="carBoard" :label="$t('transport.carBoard')"/>
      <el-table-column prop="driverName" :label="$t('transport.driverName1')"/>
      <el-table-column prop="tel" :label="$t('transport.driverTel')"/>
      <el-table-column prop="brandName" :label="$t('transport.brandName1')"/>
      <el-table-column prop="modelName" :label="$t('transport.modelName')"/>

      <el-table-column prop="carState" :label="$t('hardware.status')">
          <template v-slot="{row}">
              <span v-if="row.carState===1" style="color: red">{{ $t('transport.inTransit') }}</span>
              <span v-else-if="row.carState===0" >{{ $t('transport.leaveUnused') }}</span>
          </template>
      </el-table-column>

      <el-table-column :label="$t('common.handle')" width="100px">
        <template v-slot="{row}">
          <el-button type="text" @click="handleSelect(row)">{{ $t('system.change') }}</el-button>
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
import { queryRefrigerateCar} from "@/api/transport";
import Pagination from "@c/Pagination"
import i18n from "@/i18n";
export default {
  name: "SelectCarDialog",
  components: {
    Pagination
  },
  props: {
    dialogTitle: {
      type: String,
      default: i18n.t('transport.changeChillCar'),
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
        carBoard: ""
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
        queryRefrigerateCar(this.query).then(res => {
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
    handleSelect(row) {
      if (this.selectedCallback) {
        this.selectedCallback(row);
      }
      this.handleClose();
    }
  },
}
</script>

<style scoped>

</style>