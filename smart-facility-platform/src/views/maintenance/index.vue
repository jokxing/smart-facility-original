<template>
  <div class="labDevicePage page">
    <!-- <h3 class="page-title">实验室设备</h3> -->
    <template v-if="!isDrawVisible">
      <div class="page-content">
        <div class="table-group session">
          <div class="table-handle">
            <el-row :gutter="10">
              <el-col :span="5">
                <!-- <SelectDepartment @setDepartmentId="setDepartmentId"></SelectDepartment> -->
                <select-department
                  :department-id.sync="departmentId"
                  :is-company="true" :select-tree-value.sync="departmentId"/>
              </el-col>
              <el-col :span="7">
                <el-date-picker
                  v-model="dateTime"
                  type="daterange"
                  :range-separator="$t('common.most')"
                  :start-placeholder="$t('common.startDate')"
                  :end-placeholder="$t('common.endDate')"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  @change="handleDatePicker"
                >
                </el-date-picker>
              </el-col>
              <el-col :span="5">
                <el-input :placeholder="$t('common.inputKeyword')" v-model="keyswordInput" @keyup.enter.native="handleSearch">
                  <el-button
                    slot="append"
                    icon="icon-search1"
                    class="el-button-host"
                    @click="handleSearch"
                  ></el-button>
                </el-input>
              </el-col>
            </el-row>
          </div>
          <div class="table-default">
            <SelfTable
              :loading="loading"
              :columns="column"
              :pageSize="pageSize"
              :pageNum="pageNum"
              :pageSizes="pageSizes"
              :total="total"
              :tabledata="dataSource"
              :defaultSort="defaultSort"
              @pageNumChange="handlePageNumChange"
              @pageSizeChange="handlePageSizeChange"
            >
              <el-table-column
                slot="instrumentName"
                :label="$t('labDevice.labDeviceName')"
              >
                <template v-slot="scope">
                  <a @click="handleSeedDetail(scope.row)"
                    >{{ scope.row.instrumentName }}
                  </a>
                </template>
              </el-table-column>
              <el-table-column
                slot="instrumentNo"
                :label="$t('labDevice.labDeviceNo')"
              >
                <template v-slot="scope">
                  <a @click="handleSeedDetail(scope.row)"
                    >{{ scope.row.instrumentNo }}
                  </a>
                </template>
              </el-table-column>
                <el-table-column slot="createDate" :label="$t('labDevice.applyTime')">
                    <template v-slot="{row}">
                        {{ row.createDate | localToUtc }}
                    </template>
                </el-table-column>
                <el-table-column slot="maintenanceDate" :label="$t('labDevice.startTime')">
                    <template v-slot="{row}">
                        {{ row.maintenanceDate | localToUtc }}
                    </template>
                </el-table-column>
              <el-table-column slot="status" :label="$t('hardware.status')" width="70">
                <template v-slot="scope">
                  {{
                    getStatusProto(scope.row.completeFlag, "label", STATUSSET)
                  }}
                </template>
              </el-table-column>

              <el-table-column
                slot="operate"
                :label="$t('common.handle')"
                fixed="right"
                width="180"
              >
                <template v-slot="scope">
                  <el-button type="text" @click="handleEdit(scope.row)"
                    >{{ $t('labDevice.nextMaintenanceDate') }}
                  </el-button>
                  <el-button
                    type="text"
                    @click="handleConfirm(scope.row)"
                    :disabled="scope.row.completeFlag == 1"
                    >{{ $t('labDevice.inspectConfirm') }}
                  </el-button>
                </template>
              </el-table-column>
            </SelfTable>
          </div>
        </div>
      </div>
    </template>
    <Modal v-if="modalVisible"></Modal>
    <!-- 没开通2.0打开旧详情 -->
    <Drawer>
      <DrawerPage :detailId="detailId" :instrumentId="instrumentId"></DrawerPage>
    </Drawer>
    <!-- 开通2.0打开新详情 -->
    <LabDeviceDrawer :id="instrumentId" :is-drawer.sync="isDrawer" />
  </div>
</template>


<script>
import Drawer from "@/components/Drawer";
import Modal from "./Modal";
import SelfTable from "@/components/Table";
// import SelectDepartment from "../labDevice/components/SelectDepartment";
import SelectDepartment from "@c/SelectdePartment";
import LabDeviceDrawer from "@/views/labDevice/components/LabDeviceDrawer";
import { postMaintenanceList, getMaintenanceComplete } from "@/api/labDevice";
import { items } from "@/utils/constant";
import { mapMutations, mapState } from "vuex";
import DrawerPage from "@/views/detail";
import i18n from "@/i18n";
const STATUSSET = [
  {
    label: i18n.t('labDevice.maintained'),
    value: 0,
  },
  {
    label: i18n.t('labDevice.maintainedFin'),
    value: 1,
  },
];

const TABLECOLUMN = [
  {
    title: i18n.t('labDevice.labDeviceName'),
    dataIndex: "instrumentName",
    slot: "instrumentName",
    sortable: true
  },
  {
    title: i18n.t('labDevice.labDeviceNo'),
    dataIndex: "instrumentNo",
    slot: "instrumentNo",
    sortable: true
  },
  {
    title: i18n.t('common.createName'),
    dataIndex: "userName",
    width: "100",
  },
  {
    title: i18n.t('labDevice.telNo'),
    dataIndex: "tel",
    width: "110"
  },
  {
    title: i18n.t('labDevice.applyTime'),
    dataIndex: "createDate",
    width: "150",
    sortable: true,
      slot: "createDate"
  },
  {
    title:  i18n.t('labDevice.startTime'),
    dataIndex: "maintenanceDate",
    width: "150",
    sortable: true,
      slot: "maintenanceDate"
  },
  {
    title: i18n.t('labDevice.endTime'),
    dataIndex: "completeDate",
    width: "150",
    sortable: true
  },
  {
    title: i18n.t('labDevice.nextMaintenanceDate'),
    dataIndex: "nextMaintenanceDate",
    width: "150",
    sortable: true
  },
  {
    title: i18n.t('labDevice.remark'),
    dataIndex: "remark",
  },
  {
    title: i18n.t('hardware.status'),
    dataIndex: "completeFlag",
    slot: "status",
  },
  {
    title: i18n.t('common.handle'),
    dataIndex: "operate",
    slot: "operate",
  },
];

export default {
  components: {
    SelfTable,
    Modal,
    Drawer,
    DrawerPage,
    LabDeviceDrawer,
    SelectDepartment
  },
  data() {
    return {
      isDrawer: false,
      keyword: undefined,
      // 表格
      keyswordInput: undefined,
      dataSource: [],
      loading: false,
      column: TABLECOLUMN,
      pageSize: items.PAGE_SIZE,
      pageNum: items.PAGE_NUM,
      pageSizes: items.PAGE_SIZES,
      total: 0,
      dateTime: "",
      STATUSSET,
      detailId: "",
      instrumentId: "",
      // 表头排序
      defaultSort: {
        order: 'descending'
      },
      // 部门ID
      departmentId: undefined,
    };
  },

  created() {
    // this.getTableData();
  },

  methods: {
    ...mapMutations({
      handleDrawerOpen: "DRAWEROPEN",
    }),
    ...mapMutations("lab", {
      handleReflesh: "REFLESH",
      handleEditModal: "EDITMODAL",
    }),

    // 选中部门id
    setDepartmentId(val){
      this.departmentId = val;
    },

    handleEdit(record) {
      this.handleEditModal(record);
    },

    getStatusProto(status, proto, arr) {
      let c = "";
      arr.map((a) => {
        if (a.value === status) {
          c = a[proto];
        }
      });
      return c;
    },

    handleDatePicker(value) {
      this.dateTime = value;
    },
    handleSearch() {
      this.pageNum = items.PAGE_NUM;
      this.keyword = this.keyswordInput;
    },
    handlePageSizeChange(size) {
      this.pageSize = size;
    },
    handlePageNumChange(num) {
      this.pageNum = num;
    },

    handleSoketStatusChange() {
      this.pageNum = items.PAGE_NUM;
    },
    handleSelectStatusChange() {
      this.pageNum = items.PAGE_NUM;
    },

    async confirmAsync(maintenanceId) {
      try {
        let result = await getMaintenanceComplete({ maintenanceId });
        if (result.code === 1) {
          this.$message({
            type: "success",
            message: this.$t('labDevice.cancelSuccess'),
          });
          this.handleReflesh();
        } else {
          this.$message({
            type: "error",
            message: result.message,
          });
        }
      } catch (err) {
        this.$message({
          type: "error",
          message: err,
        });
      }
    },

    handleConfirm(record) {
      this.$confirm(this.$t('labDevice.maintaining'), this.$t('labDevice.inspectConfirm'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
      })
        .then(() => {
          this.confirmAsync(record.id);
        })
        .catch(() => {});
    },

    async getTableData(params) {
      const _ = this;
      try {
        _.loading = true;
        let result = await postMaintenanceList({ ...params });
        if (result.code === 1) {
          _.loading = false;
          _.dataSource = result.items.list;
          _.total = result.items.total;
          // _.pageObj = { ...[_.pageObj], total: result.items.total };
        } else {
          _.loading = false;
          _.$message.error(result.message);
        }
      } catch (err) {
        _.loading = false;
        _.$message.error(err);
        throw err;
      }
    },

    handleSeedDetail(record) {
      this.detailId = record.id;
      this.instrumentId = record.instrumentId;
      if(record.openTwoSystem){
        this.isDrawer = true;
      }else{
        this.handleDrawerOpen();
      }
    },

    startUsing() {},
    delete() {},
  },
  computed: {
    ...mapState("lab", {
      isReflesh: "isReflesh",
      modalVisible: "modalVisible",
      isDrawVisible: "isDrawVisible",
    }),

    changeTableData() {
      let { dateTime, keyword, pageSize, pageNum, departmentId, isReflesh } = this;
      let startDate = "";
      let endDate = "";
      if (dateTime) {
        startDate = dateTime[0];
        endDate = dateTime[1];
      }
      return {
        startDate,
        endDate,
        keyword,
        pageSize,
        pageNum,
        departmentId
      };
    },
  },
  watch: {
    changeTableData: {
      handler(newval) {
        this.getTableData({ ...newval });
      },
      immediate: true,
    },
  },
};
</script>

<style lang="less" scoped>
@import "./index.less";
.warn {
  color: #ffd591;
}
.danger {
  color: #ff4949;
}
.success {
  color: #13ce66;
}
.left {
  float: left;
}
.right {
  float: right;
}

.gatherBox {
  position: relative;
  .gatherBox-item {
    padding: 20px 10px;
    .box {
      border: 1px solid #dfe6ec;
      border-radius: 3px;
      padding: 30px;
      font-size: 16px;
      text-align: center;
      .num {
        margin-top: 20px;
        font-size: 24px;
        font-weight: 600;
      }
    }
  }
  &::after {
    display: block;
    content: "";
    height: 1px;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #dfe6ec;
  }
}

.table-group {
  .table-handle {
    width: 100%;
    height: 40px;
    margin-bottom: 20px;
    /deep/.el-date-editor {
      width: 100%;
    }
    .el-select{
      width: 100%!important;
    }
    &::after {
      display: block;
      content: "";
      height: 0;
      clear: both;
      overflow: hidden;
    }
  }
}
</style>
