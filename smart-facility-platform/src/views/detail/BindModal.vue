<template>
  <el-dialog
    title="绑定智能硬件"
    width="780px"
    :visible="true"
    :before-close="handleModalClose"
    destroy-on-close
    :close-on-click-modal="false"
    custom-class="modal-default"
    :modal-append-to-body="false"
  >
    <div class="modal-default-body">
      <el-scrollbar style="height: 100%">
        <div class="modal-default-content">
          <div class="input-row-tag">
            <div class="input-row-label">已绑定的智能硬件：</div>
            <div class="tag-group disable">
              <el-tag v-for="tag in bindData" :key="tag.id">
                {{ tag.name }}
              </el-tag>
            </div>
          </div>

          <div class="input-row-tag">
            <div class="input-row-label">已选择的智能硬件：</div>
            <div class="tag-group">
              <el-tag
                v-for="tag in deviceList"
                :key="tag.id"
                closable
                @close="handleTagClose(tag)"
              >
                {{ tag.name }}
              </el-tag>
            </div>
          </div>
          <div class="table-group">
            <div class="table-handle">
              <div class="table-filter left">
                <el-input placeholder="请输入关键字" v-model="keywordInput">
                  <el-button
                    slot="append"
                    icon="icon-search1"
                    @click="handleSearch"
                  ></el-button>
                </el-input>
              </div>
            </div>
            <div class="table-default">
              <SelfTable
                ref="table"
                :loading="loading"
                :columns="column"
                :pageNum="pageNum"
                :pageSize="pageSize"
                :total="total"
                :tabledata="dataSource"
                @pageNumChange="handlePageNumChange"
                @pageSizeChange="handlePageSizeChange"
                @handleRowsSelect="handleRowsSelect"
                isSelected
                paginationLayout="prev, pager, next"
              >
              </SelfTable>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button
        type="primary"
        :loading="submitLoading"
        @click="handleFormSubmit('labDeviceForm')"
      >
        确 定</el-button
      >
    </span>
  </el-dialog>
</template>
<script>
import {
  postInstrumentThingsPreLink,
  getInstrumentThingsAdd,
} from "@/api/labDevice";
import {ERROR, items, STATUS_VALUE} from "@/utils/constant";
import SelfTable from "@/components/Table";
// import { getInstrumentAdd, getInstrumentUpdate } from "@/api/labDevice";
import { mapState, mapMutations } from "vuex";
const COLUMN = [
  {
    title: "设备名称",
    dataIndex: "name",
  },
  {
    title: "编号",
    dataIndex: "no",
  },
  {
    title: "部门",
    dataIndex: "departmentName",
  },
];
export default {
  components: {
    SelfTable,
  },

  data() {
    return {
      loading: true,
      total: 0,
      submitLoading: false,
      pageSize: items.PAGE_SIZE,
      pageNum: items.PAGE_NUM,
      keywordInput: "",
      keyword: "",
      dataSource: [],
      column: COLUMN,
      deviceList: [],
    };
  },

  created() {},
  computed: {
    ...mapState("detail", {
      detailData: "detailData",
      bindData: "bindData",
    }),
    params() {
      let { pageSize, pageNum, keyword } = this;
      return {
        pageSize,
        pageNum,
        keyword,
      };
    },
  },
  watch: {
    params: {
      handler(newVal) {
        this.getDeviceData(newVal);
      },
      immediate: true,
    },
  },
  methods: {
    ...mapMutations("detail", {
      handleHideModal: "HIDEBINDMODAL",
      handleReflesh: "ISREFLESHBIND",
    }),

    handlePageNumChange(num) {
      this.pageNum = num;
    },
    handlePageSizeChange(size) {
      this.pageSize = size;
    },
    handleSearch() {
      this.pageNum = items.PAGE_NUM;
      this.keyword = this.keywordInput;
    },

    handleRowsSelect(selection) {
      this.deviceList = selection;
    },

    handleTagClose(item) {
      let list = this.deviceList.slice(0);
      let temp = list.filter((l) => l.id != item.id);
      this.deviceList = temp;
      this.$nextTick(function () {
        this.$refs.table.toggleSelected(item);
      });
    },

    handleModalClose(done) {
      done();
      this.handleHideModal();
    },

    async bindAsync(thingsEquipmentList) {
      try {
        let result = await getInstrumentThingsAdd(thingsEquipmentList);
        if (result.code === STATUS_VALUE.NORMAL) {
          this.submitLoading = false;
          this.$message.success("新增成功");
          this.handleHideModal();
          this.handleReflesh();
        } else {
          this.submitLoading = false;
          this.$message.error(result.message);
        }
      } catch (err) {
        this.submitLoading = false;
        this.$message.error(ERROR);
        throw err;
      }
    },

    handleFormSubmit() {
      if (this.submitLoading) return;
      this.submitLoading = true;
      let list = this.deviceList.slice(0);
      let temp = [];
      list.map((l) => {
        let obj = {
          thingsId: this.detailData.id,
          equipmentId: l.id,
          equipmentType: l.equipmentTypeCode,
        };
        temp.push(obj);
      });
      if (temp.length > 0) {
        this.bindAsync(temp);
      } else {
        this.submitLoading = false;
        this.$message.error("暂未选择绑定的设备");
      }
    },
    handleCancel() {
      this.handleHideModal();
    },
    async getDeviceData(obj) {
      const _ = this;
      try {
        let temp = [];
        let num = 0;
        let result = await postInstrumentThingsPreLink(obj);
        if (result.code == 1) {
          let { items } = result;
          num = items.total;
          if (items.list && items.list.length > 0) {
            temp = result.items.list;
          }
        }
        _.total = num;
        _.loading = false;
        _.dataSource = temp;
      } catch (err) {
        this.total = 0;
        _.dataSource = [];
        _.loading = false;
        _.$message.error(ERROR);
        throw err;
      }
    },
  },
};
</script>

<style lang="less" scoped>
.formDesc {
  padding-left: 16px;
  color: #ff4949;
}
.input-row-tag {
  display: flex;
  .input-row-label {
    width: 135px;
  }
  .tag-group {
    flex: 1;
    min-height: 48px;
    border: 1px solid #e5e5e5;
    border-radius: 3px;
    padding: 4px 10px 0;
    .el-tag {
      height: 40px;
      line-height: 38px;
      font-size: 14px;
      margin: 0 4px 4px 0;
    }
    &.disable {
      border: none;
      padding: 0;
      .el-tag {
        background-color: #c0c4cc;
        border: none;
        color: #252629;
      }
    }
  }
}
.table-group {
  margin-top: 20px;
  .table-handle {
    margin-bottom: 20px;
  }
}
</style>
