<template>
  <div class="labDevicePage page">
    <!-- <h3 class="page-title">实验室设备</h3> -->
    <template v-if="!isDrawVisible">
      <div class="page-content">
        <el-row class="gatherBox" type="flex" justify="center">
          <el-col
            :span="4"
            class="gatherBox-item"
            v-for="(item, index) in gather"
            :key="index"
          >
            <div class="box" :class="`border-${item.class}`" @click="handleGatherBoxClick(item.value)">
              <div class="name">{{ item.label }}</div>
              <div class="num">{{ item.num }}</div>
            </div>
          </el-col>
        </el-row>
        <div class="table-group">
          <div class="table-handle">
            <div class="table-filter left">
              <el-row :gutter="10">
                <el-col :span="3">
                  <SelectDepartment @setDepartmentId="setDepartmentId"></SelectDepartment>
                </el-col>
                <el-col :span="5">
                  <el-date-picker
                    v-model="dateTime"
                    type="daterange"
                    range-separator="——"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="yyyy-MM-dd HH:mm:ss"
                  >
                  </el-date-picker>
                </el-col>
                <el-col :span="4">
                  <el-input placeholder="请输入关键字" v-model="keyswordInput">
                    <el-button
                      slot="append"
                      icon="icon-search1"
                      @click="handleSearch"
                    ></el-button>
                  </el-input>
                </el-col>
                <el-col :span="6" :offset="6" class="table-handle-right">
                  <el-button
                    class="defaultBtn"
                    @click="showSetUp = !showSetUp">
                      {{ showSetUp ? '取消批量设置' : "批量设置" }}
                  </el-button>
                  <el-button
                    class="defaultBtn"
                    type="primary"
                    icon="el-icon-plus"
                    v-if="roleId != 5"
                    @click="handleAdd"
                    >新增</el-button
                  >
                </el-col>
              </el-row>
            </div>
          </div>
          <div v-if="showSetUp || multipleSelection.length > 0" class="choose-bar">
            <template>
              <div class="checked">
                已选中<span>{{ multipleSelection.length }}</span>项
              </div>
            </template>
            <template>
              <el-button
                v-for="item in setUpList"
                :key="item.value" @click="handleBatchUpdate(item)">{{ item.title }}</el-button>
            </template>
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
              isSelected
              @handleRowsSelect="handleRowsSelect"
              @pageNumChange="handlePageNumChange"
              @pageSizeChange="handlePageSizeChange"
            >
              <el-table-column slot="name" label="名称" sortable align="center">
                <template v-slot="scope">
                  <a @click="handleSeedDetail(scope.row)"
                    >{{ scope.row.name }}
                  </a>
                </template>
              </el-table-column>

              <el-table-column slot="status" label="状态" align="center">
                <template v-slot="scope">
                  {{
                    getStatusProto(
                      scope.row.status,
                      "label",
                      INTELLEGENTSOKETSTATUS
                    )
                  }}
                </template>
              </el-table-column>

              <el-table-column
                slot="operate"
                label="操作"
                align="center"
                fixed="right"
                width="100"
                v-if="roleId != 5"
              >
                <template v-slot="scope">
                  <el-button type="text" @click="handleEdit(scope.row)"
                    >编辑
                  </el-button>
                  <el-button type="text" @click="handleDelete(scope.row)"
                    >删除
                  </el-button>
                </template>
              </el-table-column>
            </SelfTable>
          </div>
        </div>
      </div>
    </template>
    <Modal v-if="modalVisible"></Modal>
    <UpdateModal
      ref="updateModal"
      v-if="updateModalVisible"
      :setData="setUpData"
      :multipleSelection="multipleSelection"
      @hiddenModalVisible="hiddenModalVisible"></UpdateModal>
    <Drawer>
      <DrawerPage :detailId="detailId" :type="type"></DrawerPage>
    </Drawer>
  </div>
</template>


<script>
import Drawer from "@/components/Drawer";
import Modal from "./Modal";
import UpdateModal from "../labDevice/components/updateModal";
import SelfTable from "@/components/Table";
import SelectDepartment from "../labDevice/components/SelectDepartment"
import {
  postInstrumentAdministrationList,
  getInstrumentRemove,
  postInstrumentAdministrationDashboard,
} from "@/api/labDevice";
import { items, STATUS_VALUE } from "@/utils/constant";
import { mapMutations, mapState } from "vuex";
import DrawerPage from "@/views/detail";

/*-------------智能插座的状态-------------*/
const INTELLEGENTSOKETSTATUS = [
  {
    label: "运行中",
    value: 1,
  },
  {
    label: "待机中",
    value: 2,
  },
  {
    label: "已关机",
    value: 0,
  },
  {
    label: "维护中",
    value: 3,
  },
  {
    label: "未检测",
    value: 4,
  },
];

const INSTRUMENTSTATISTICS = [
  // {
  //   num: 0,
  //   name: "administrationGoodsCount",
  //   label: "行政设备总数",
  // },
  // {
  //   num: 0,
  //   name: "maintainCount",
  //   label: "维护中的设备",
  // },
  {
    num: 0,
    name: "total",
    label: "总数",
    value: 3,
  },
  {
    num: 0,
    name: "monitorCount",
    label: "被监测",
    value: 1,
  },
  {
    num: 0,
    name: "noMonitorCount",
    label: "未监测",
    value: 2,
  },
  {
    num: 0,
    name: "maintainCount",
    label: "维护中",
    value: 4,
  },
];

const TABLECOLUMN = [
  {
    title: "名称",
    dataIndex: "name",
    slot: "name",
  },
  {
    title: "编号",
    dataIndex: "no",
    sortable: true
  },
  {
    title: "创建时间",
    dataIndex: "createDate",
    sortable: true
  },
  {
    title: "所属部门",
    dataIndex: "departmentName",
  },
  {
    title: "所属房间",
    dataIndex: "roomName",
  },
  {
    title: "购买时间",
    dataIndex: "buyDate",
    sortable: true
  },
  {
    title: "价格（元）",
    dataIndex: "price",
    sortable: true
  },
  {
    title: "操作",
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
    UpdateModal,
    SelectDepartment
  },
  data() {
    return {
      // 用户层级
      roleId: JSON.parse(localStorage.getItem('USERINFO')).roleId,
      // 搜索条件
      search: undefined,
      // 批量数据
      multipleSelection: [],
      // 批量修改弹窗
      updateModalVisible: false,
      // 批量设置
      showSetUp: false,
      // 批量设置按钮
      setUpList: [
        {
          title: "修改房间",
          value: 1
        },
        {
          title: "修改部门",
          value: 2
        },
        {
          title: "修改设备类型",
          value: 3
        },
        {
          title: "修改设备图片",
          value: 4
        },
        {
          title: "设置管理人员",
          value: 5
        },
        {
          title: "批量删除",
          value: 6
        }
      ],
      setUpData: {},
      // 表头排序
      defaultSort: {
        order: 'descending'
      },
      // 部门ID
      departmentId: undefined,

      detailId: "",
      device: {
        total: 18,
        warning: 0,
      },
      dateActive: 0,
      gather: [],
      deviceFiterData: [],
      status: undefined,
      keyswordInput: undefined,
      keyword: undefined,
      // 表格
      dataSource: [],
      loading: false,
      column: TABLECOLUMN,
      pageSize: items.PAGE_SIZE,
      pageNum: items.PAGE_NUM,
      pageSizes: items.PAGE_SIZES,
      total: 0,
      dateTime: "",
      type: 2,
      INTELLEGENTSOKETSTATUS,
    };
  },

  created() {
    let that = this;
    let data = this.device;
    let gatherTemp = [];
    this.getGatherData(INSTRUMENTSTATISTICS)
  },

  methods: {
    getStatusProto(status, proto, arr) {
      let c = "";
      arr.map((a) => {
        if (a.value === status) {
          c = a[proto];
        }
      });
      return c;
    },
    ...mapMutations({
      handleDrawerOpen: "DRAWEROPEN",
    }),

    // 点击
    handleGatherBoxClick(value) {
      this.search = value;
    },

    // 表格Checkbox
    handleRowsSelect(selection) {
      this.multipleSelection = selection;
    },
    // 显示批量更新弹窗
    handleBatchUpdate(item){
      if(item.value != 6){
        this.setUpData = item;
        this.updateModalVisible = true;
      }else{
        this.handleBatchDeleteDevice()
      }
    },
    // 隐藏弹窗
    hiddenModalVisible(){
      this.updateModalVisible = false;
      this.importFileVisible = false
    },
    // 批量删除
    handleBatchDeleteDevice() {
      this.form.ids = [];
      for(var i = 0; i < this.multipleSelection.length; i++){
        this.form.ids.push(this.multipleSelection[i].id)
      }
      this.$confirm("确定删除已选中的设备吗？此操作不可逆", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        postInstrumentBatchDelete(this.form).then(res => {
          if (res.code == 1) {
            this.$message.success("批量删除成功");
            this.handleReflesh()
          } else {
            this.$message.error("删除失败，原因" + res.message);
          }
        }).catch(err => {

        })
      }).catch(() => {
        this.$message.info("已取消删除")
      })
    },
    // 选中部门id
    setDepartmentId(val){
      this.departmentId = val;
    },

    handleSearch() {
      this.pageNum = items.PAGE_NUM;
      this.keyword = this.keyswordInput;
    },
    handleDateSelect(keys) {
      this.dateActive = keys;
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
    ...mapMutations("lab", {
      handleAddModal: "ADDMODAL",
      handleEditModal: "EDITMODAL",
      handleReflesh: "REFLESH",
    }),
    handleAdd() {
      this.handleAddModal();
    },

    async getGatherData(arry) {
      //获取统计类目
      let gatherTemp = arry.slice(0);
      try {
        let result = await postInstrumentAdministrationDashboard();
        if (result.code === STATUS_VALUE.NORMAL) {
          let data = result.items;
          let temp = [];

          for (let j = 0; j < gatherTemp.length; j++) {
            for (let i in data) {
              if (gatherTemp[j].name === i) {
                temp.push({ ...gatherTemp[j], num: data[i] });
              }
            }
          }
          this.gather = temp;
        } else {
          this.gather = gatherTemp;
        }
      } catch (err) {
        this.gather = gatherTemp;
        throw err;
      }
    },

    async getTableData(params) {
      const _ = this;
      try {
        _.loading = true;
        let result = await postInstrumentAdministrationList({ ...params });
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
        let result = await getInstrumentRemove({}, id);
        if (result.code === STATUS_VALUE.NORMAL) {
          this.$message({
            type: "success",
            message: "删除成功!",
          });
          this.handleReflesh();
        }
      } catch (err) {
        this.$message({
          type: "error",
          message: err,
        });
      }
    },

    handleSeedDetail(record) {
      this.detailId = record.id;
      this.handleDrawerOpen();
    },
    handleDelete(record) {
      this.$confirm("请您确认是否该条删除数据", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.deleteAsync(record.id);
        })
        .catch(() => {});
    },

    handleEdit(record) {
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
      let { keyword, pageSize, pageNum, type, dateTime, departmentId, search, isReflesh } = this;
      return {
        keyword,
        dateTime,
        type,
        pageSize,
        pageNum,
        search,
        departmentId
      };
    },
  },
  watch: {
    changeTableData: {
      handler(newval) {
        let { keyword, dateTime, type, pageSize, pageNum, departmentId, search } = newval;
        let obj = { keyword, type, pageSize, pageNum, departmentId, search };
        if (dateTime) {
          let buyEndTime = dateTime[0];
          let buyStartTime = dateTime[1];
          obj = { ...obj, buyEndTime, buyStartTime };
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
      // border: 1px solid #dfe6ec;
      border-radius: 3px;
      padding: 30px;
      font-size: 16px;
      text-align: center;
      box-shadow: 1px 0 5px 2px #dfe6ec;
      cursor: pointer;
      .name {
        font-weight: 600;
      }
      .num {
        margin-top: 10px;
        font-size: 48px;
      }
    }
    .border-warn {
      box-shadow: 1px 0 5px 2px #ffd591;
      .num {
        color: #ffd591;
      }
    }
    .border-danger {
      box-shadow: 1px 0 5px 2px #ff4949;
      .num {
        color: #ff4949;
      }
    }
    .border-success {
      box-shadow: 1px 0 5px 2px #13ce66;
      .num {
        color: #13ce66;
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

.defaultBtn {
  padding: 0 20px;
  height: 40px;
  line-height: 40px;
  /deep/.el-icon-plus {
    color: #ffffff;
    font-size: 14px;
  }
}
.table-group {
  padding: 20px 0;
  .table-handle {
    height: 40px;
    margin-bottom: 20px;
    .table-filter{
      width: 100%;
      /deep/ .el-range-editor--medium.el-input__inner{
        width: 100%;
        margin-right: 0;
      }
    }
    .table-handle-right{
      text-align: right;
    }
    /deep/.el-input__inner {
      height: 40px;
      line-height: 40px;
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
