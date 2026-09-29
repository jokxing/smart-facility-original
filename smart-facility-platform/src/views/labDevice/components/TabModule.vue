<template>
  <el-tabs v-model="activeName" @tab-click="handleClick">
    <el-tab-pane
      v-for="item in tabsList"
      :label="item.label"
      :name="item.value"
      :key="item.value"
    >
      <div class="btnGroup">
        <el-button
          type="primary"
          class="btn-default"
          v-if="`${activeName === 1}`"
          >{{ $t('labDevice.addOrder') }}</el-button
        >
        <el-button
          type="primary"
          class="btn-default"
          v-else-if="`${activeName === 2}`"
          >{{ $t('labDevice.addMaintenance') }}</el-button
        >
      </div>
      <SelfTable
        :loading="loading"
        :columns="item.column"
        :pageSize="pageSize"
        :pageNum="pageNum"
        :pageSizes="pageSizes"
        :total="total"
        :tabledata="dataSource"
        @pageNumChange="handlePageNumChange"
        @pageSizeChange="handlePageSizeChange"
      >
        <el-table-column slot="name" :label="$t('common.name')" align="center">
          <template v-slot="scope">
            <el-button type="text" @click="handleSeedDetail(scope.row)"
              >{{ scope.row.name }}
            </el-button>
          </template>
        </el-table-column>

        <el-table-column
          slot="operate"
          :label="$t('common.handle')"
          align="center"
          fixed="right"
          width="300"
        >
          <template v-slot="scope">
            <el-button type="text" @click="handleEdit(scope.row)"
              >{{ $t('common.edit') }}
            </el-button>
            <el-button type="text" @click="handleDelete(scope.row)"
              >{{ $t('common.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </SelfTable>
    </el-tab-pane>
  </el-tabs>
</template>
<script>
import SelfTable from "@/components/Table";
export default {
  components: {
    SelfTable,
  },
  data() {
      const _this = this;
    return {
      loading: false,
      dataSource: [],
      pageSizes: [],
      total: 0,
      pageSize: 5,
      pageNum: 1,
      tabsList: [
        {
          label: _this.$t("labDevice.orderUseLog"),
          value: "1",
          column: [
            {
              title: _this.$t("labDevice.borrower"),
              dataIndex: "name",
              slot: "name",
            },
            {
              title: _this.$t("labDevice.telNo"),
              dataIndex: "no",
            },
            {
              title: _this.$t("labDevice.applyTime"),
              dataIndex: "price",
            },
            {
              title: _this.$t("hardware.status"),
              dataIndex: "socketStatus",
            },
            {
              title: _this.$t("labDevice.returnTime"),
              dataIndex: "departmentName",
            },
            {
              title: _this.$t("common.owningRoom"),
              dataIndex: "no",
            },
            {
              title: _this.$t("hardware.status"),
              dataIndex: "status",
            },
            {
              title: _this.$t("labDevice.monitorTime"),
              dataIndex: "createDate",
            },
            {
              title: _this.$t("common.handle"),
              dataIndex: "operate",
              slot: "operate",
            },
          ],
        },
        {
          label: _this.$t("labDevice.maintenanceRecord"),
          value: "2",
          column: [
            {
              title: _this.$t("common.name"),
              dataIndex: "name",
              slot: "name",
            },
            {
              title: _this.$t("common.no"),
              dataIndex: "no",
            },
            {
              title: _this.$t("common.department"),
              dataIndex: "price",
            },
            {
              title: _this.$t("hardware.status"),
              dataIndex: "socketStatus",
            },
            {
              title: _this.$t("hardware.status"),
              dataIndex: "departmentName",
            },
            {
              title: _this.$t("labDevice.startTime"),
              dataIndex: "no",
            },
            {
              title: _this.$t("labDevice.remark"),
              dataIndex: "status",
            },
            {
              title: _this.$t("common.handle"),
              dataIndex: "operate",
              slot: "operate",
            },
          ],
        },
        {
          label: _this.$t("labDevice.manager"),
          value: "3",
          column: [
            {
              title: _this.$t("common.useName"),
              dataIndex: "name",
              slot: "name",
            },
            {
              title: _this.$t("common.weixinAlarm"),
              dataIndex: "price",
            },
            {
              title: _this.$t("common.smsAlarm"),
              dataIndex: "socketStatus",
            },
            {
              title: _this.$t("common.phoneAlarm"),
              dataIndex: "departmentName",
            },
            {
              title: _this.$t("common.timeFrame"),
              dataIndex: "no",
            },
            {
              title: _this.$t("common.handle"),
              dataIndex: "operate",
              slot: "operate",
            },
          ],
        },
        {
          label: _this.$t("labDevice.bindDevice"),
          value: "4",
          column: [
            {
              title: _this.$t("common.name"),
              dataIndex: "name",
              slot: "name",
            },
            {
              title: _this.$t("labDevice.type"),
              dataIndex: "no",
            },
            {
              title: _this.$t("common.no"),
              dataIndex: "price",
            },
            {
              title: _this.$t("hardware.value"),
              dataIndex: "socketStatus",
            },
            {
              title: _this.$t("hardware.status"),
              dataIndex: "status",
            },
            {
              title: _this.$t("hardware.handle"),
              dataIndex: "operate",
              slot: "operate",
            },
          ],
        },
        {
          label: _this.$t("labDevice.inOrOut"),
          value: "5",
          column: [
            {
              title:  _this.$t("common.name"),
              dataIndex: "name",
              slot: "name",
            },
            {
              title:  _this.$t("labDevice.model"),
              dataIndex: "no",
            },
            {
              title: _this.$t("labDevice.specification"),
              dataIndex: "price",
            },
            {
              title: _this.$t("labDevice.outTime"),
              dataIndex: "socketStatus",
            },
            {
              title: _this.$t("labDevice.returnTime"),
              dataIndex: "departmentName",
            },
            {
              title: _this.$t("labDevice.lookVoid"),
              dataIndex: "no",
            },
            {
              title: _this.$t("labDevice.useBeforeNum"),
              dataIndex: "status",
            },
            {
              title: _this.$t("labDevice.useAfterNum"),
              dataIndex: "createDate",
            },
            {
              title: _this.$t("common.remark"),
              dataIndex: "remark",
            },
            {
              title: _this.$t("common.handle"),
              dataIndex: "operate",
              slot: "operate",
            },
          ],
        },
        {
          label: _this.$t("labDevice.historyLog"),
          value: "6",
          column: [
            {
              title: _this.$t("labDevice.borrower"),
              dataIndex: "name",
              slot: "name",
            },
            {
              title: _this.$t("labDevice.telNo"),
              dataIndex: "no",
            },
            {
              title: _this.$t("labDevice.applyTime"),
              dataIndex: "price",
            },
            {
              title: _this.$t("labDevice.returnTime"),
              dataIndex: "socketStatus",
            },
            {
              title: _this.$t("labDevice.useStatus"),
              dataIndex: "departmentName",
            },
            {
              title: _this.$t("common.owningRoom"),
              dataIndex: "no",
            },
            {
              title: _this.$t("hardware.status"),
              dataIndex: "status",
            },
            {
              title: _this.$t("labDevice.monitorTime"),
              dataIndex: "createDate",
            },
            {
              title: _this.$t("hardware.handle"),
              dataIndex: "operate",
              slot: "operate",
            },
          ],
        },
      ],
      activeName: "1",
    };
  },
  methods: {
    handleClick(tab, event) {

    },
    handlePageNumChange(num) {},
    handlePageSizeChange(size) {},
  },
};
</script>
<style lang="less" scoped>
.btnGroup {
  height: 40px;
  margin-bottom: 15px;
  float: right;
}
</style>
