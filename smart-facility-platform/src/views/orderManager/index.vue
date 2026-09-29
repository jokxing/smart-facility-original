<template>
  <div class="labDevicePage page">
    <template v-if="!isDrawVisible">
      <div class="page-content">
        <div class="table-group session">
          <div class="table-handle">
            <div class="table-filter left">
              <el-row :gutter="10">
                <el-col :span="3">
                  <el-select v-model="status" :placeholder="$t('common.changeStatus')" @change="handleInstrumentTypeChange">
                    <el-option
                      v-for="item in statusSet"
                      :key="item.value"
                      :value="item.value"
                      :label="item.label"
                    ></el-option>
                  </el-select>
                </el-col>
                <el-col :span="5">
                  <!-- <SelectDepartment placeholder="请选择设备的所属部门" @setDepartmentId="setDepartmentId"></SelectDepartment> -->
                  <select-department
                    :placeholder="$t('common.selectDepartemnt')"
                    :department-id.sync="departmentId"
                    :is-company="true" :select-tree-value.sync="departmentId"
                    @change="handleDepartment"/>
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
                <el-col :span="4">
                  <el-date-picker
                    v-model="createDate"
                    type="date"
                    :placeholder="$t('labDevice.applyTime')"
                    value-format="yyyy-MM-dd"
                    @change="handleCreateDate">
                  </el-date-picker>
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
              </el-row>
            </div>
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
                  <el-button type="text" @click="handleSeedDetail(scope.row)"
                    >{{ scope.row.instrumentName }}
                  </el-button>
                </template>
              </el-table-column>
                <el-table-column slot="createDate" :label="$t('labDevice.applyTime')">
                    <template v-slot="{row}">
                        {{ row.createDate | localToUtc }}
                    </template>
                </el-table-column>
              <el-table-column slot="status" :label="$t('hardware.status')">
                <template v-slot="scope">
                  {{ getStatusProto(scope.row.status, "label", statusSet) }}
                </template>
              </el-table-column>

              <el-table-column
                slot="operate"
                :label="$t('common.handle')"
                fixed="right"
                min-width="100">
                <template v-slot="scope">
                  <el-button
                    type="text"
                    :disabled="scope.row.status ===2 "
                    @click="handleChange(scope.row)"
                    >{{ $t('labDevice.change') }}
                  </el-button>
                  <el-button
                    type="text"
                    :disabled="scope.row.status !== 0"
                    @click="handleDelete(scope.row)"
                    >{{ $t('common.cancel') }}
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
      <DrawerPage :detailId="detailId"></DrawerPage>
    </Drawer>
    <!-- 开通2.0打开新详情 -->
    <LabDeviceDrawer :id="detailId" :is-drawer.sync="isDrawer"/>
  </div>
</template>


<script>
import Drawer from "@/components/Drawer";
import DrawerPage from "@/views/detail";
import LabDeviceDrawer from "../labDevice/components/LabDeviceDrawer";
import Modal from "./Modal";
import SelfTable from "@/components/Table";
// import SelectDepartment from "../labDevice/components/SelectDepartment";
import SelectDepartment from "@c/SelectdePartment";
import {
  getInstrumentReservationSchedulerList,
  getInstrumentReservationCancle,
} from "@/api/labDevice";
import { items, STATUS_VALUE } from "@/utils/constant";
import { serializeScreenData } from "@/utils/methods";
import { mapMutations, mapState } from "vuex";
import i18n from '@/i18n'
/*-------------预约管理状态-------------*/
const STATUSSET = [
  {
    label: i18n.t('labDevice.inUse'),
    value: 1,
  },
  {
    label: i18n.t('labDevice.notStarted'),
    value: 0,
  },
  {
    label: i18n.t('labDevice.finished'),
    value: 2,
  },
];

const TABLECOLUMN = [
  {
    title: i18n.t('labDevice.userName'),
    dataIndex: "userName",
    sortable: true
  },
  {
    title: i18n.t('labDevice.telNo'),
    dataIndex: "tel",
  },
  {
    title: i18n.t('labDevice.labDeviceName'),
    dataIndex: "instrumentName",
    slot: "instrumentName",
    sortable: true
  },
  {
    title: i18n.t('labDevice.labDeviceNo'),
    dataIndex: "instrumentNo",
    sortable: true
  },
  {
    title: i18n.t('labDevice.applyTime'),
    dataIndex: "createDate",
    sortable: true,
      slot: "createDate"
  },
  {
    title: i18n.t('labDevice.startTime'),
    dataIndex: "timeFrom",
    sortable: true
  },
  {
    title: i18n.t('labDevice.endTime'),
    dataIndex: "timeTo",
    sortable: true
  },
  {
    title: i18n.t('hardware.status'),
    dataIndex: "status",
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
      detailId: "",
      gather: [],
      deviceFiterData: [],
      status: undefined,
      keyswordInput: undefined,
      keyword: undefined,
      statusSet: serializeScreenData(STATUSSET),
      // 表格
      dataSource: [],
      loading: false,
      column: TABLECOLUMN,
      pageSize: items.PAGE_SIZE,
      pageNum: items.PAGE_NUM,
      pageSizes: items.PAGE_SIZES,
      total: 0,
      dateTime: "",
      createDate: "",
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
    getStatusProto(status, proto, arr) {
      let c = "";
      arr.map((a) => {
        if (a.value === status) {
          c = a[proto];
        }
      });
      return c;
    },

    // 选中部门id
    setDepartmentId(val){
      this.departmentId = val;
    },
    handleDepartment(){
      this.pageNum = items.PAGE_NUM;
    },

    handleSearch() {
      this.pageNum = items.PAGE_NUM;
      this.keyword = this.keyswordInput;
    },
    handleCreateDate() {
      this.pageNum = items.PAGE_NUM;
    },
    handleDatePicker() {
      this.pageNum = items.PAGE_NUM;
    },
    handlePageSizeChange(size) {
      this.pageSize = size;
    },
    handlePageNumChange(num) {
      this.pageNum = num;
    },

    handleSelectStatusChange() {
      this.pageNum = items.PAGE_NUM;
    },
    handleInstrumentTypeChange() {
      this.pageNum = items.PAGE_NUM;
    },
    ...mapMutations("lab", {
      handleAddModal: "ADDMODAL",
      handleEditModal: "EDITMODAL",
      handleReflesh: "REFLESH",
    }),

    async getTableData(params) {
      const _ = this;
      try {
        _.loading = true;
        let result = await getInstrumentReservationSchedulerList({ ...params });
        if (result.code === STATUS_VALUE.NORMAL) {
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

    async deleteAsync(id) {
      try {
        let result = await getInstrumentReservationCancle({}, id);
        if (result.code === STATUS_VALUE.NORMAL) {
          this.$message({
            type: "success",
            message: this.$t('labDevice.cancelSuccess'),
          });
          this.handleReflesh();
        } else {
          this.$message.error(result.message);
        }
      } catch (err) {
        this.$message({
          type: "error",
          message: err,
        });
      }
    },

    handleSeedDetail(record) {
      this.detailId = record.instrumentId;
      if(record.openTwoSystem){
        this.isDrawer = true;
      }else{
        this.handleDrawerOpen();
      }
    },
    handleDelete(record) {
      this.$confirm(this.$t('labDevice.confirmCancel'), this.$t('common.hint'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: "warning",
      })
        .then(() => {
          this.deleteAsync(record.id);
        })
        .catch(() => {});
    },

    handleChange(record) {
      this.handleEditModal(record);
    },
    startUsing() {},
    delete() {},
  },
  computed: {
    ...mapState("lab", {
      modalVisible: "modalVisible",
      isReflesh: "isReflesh",
      isDrawVisible: "isDrawVisible",
    }),

    changeTableData() {
      let { keyword, status, pageSize, pageNum, isReflesh, dateTime, createDate, departmentId } = this;
      if (status === this.$t('common.all')) {
        status = null;
      }
      return {
        keyword,
        dateTime,
        status,
        pageSize,
        pageNum,
        createDate,
        departmentId
      };
    },
  },
  watch: {
    changeTableData: {
      handler(newval) {
        let { dateTime } = newval;
        var obj = newval;
        if (dateTime != "") {
          let startDate = dateTime[0];
          let endDate = dateTime[1];
          obj = { ...obj, startDate, endDate };
        }
        this.getTableData(obj);
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
.equipmentStatus {
  padding: 20px 36px;
  .title {
    height: 40px;
    line-height: 40px;
    font-size: 16px;
    .infoIcon {
      position: relative;
      top: 2px;
    }
  }
}
.echartsBox {
  padding: 20px 36px;
}

.table-group {
  .table-handle {
    height: 40px;
    margin-bottom: 20px;
    .el-select{
      width: 100%!important;
    }
    .el-date-editor.el-input, .el-date-editor.el-input__inner{
      width: auto;
    }
    ///deep/.el-input__inner {
    //  height: 40px;
    //  line-height: 40px;
    //}
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
