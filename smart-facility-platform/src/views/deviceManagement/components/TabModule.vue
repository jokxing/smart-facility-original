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
          >新增预约</el-button
        >
        <el-button
          type="primary"
          class="btn-default"
          v-else-if="`${activeName === 2}`"
          >申请维保</el-button
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
        <el-table-column slot="name" label="名称" align="center">
          <template v-slot="scope">
            <el-button type="text" @click="handleSeedDetail(scope.row)"
              >{{ scope.row.name }}
            </el-button>
          </template>
        </el-table-column>

        <el-table-column
          slot="operate"
          label="操作"
          align="center"
          fixed="right"
          width="300"
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
    return {
      loading: false,
      dataSource: [],
      pageSizes: [],
      total: 0,
      pageSize: 5,
      pageNum: 1,
      tabsList: [
        {
          label: "预约使用记录",
          value: "1",
          column: [
            {
              title: "借用人",
              dataIndex: "name",
              slot: "name",
            },
            {
              title: "联系方式",
              dataIndex: "no",
            },
            {
              title: "申请时间",
              dataIndex: "price",
            },
            {
              title: "归还时间",
              dataIndex: "socketStatus",
            },
            {
              title: "使用状态",
              dataIndex: "departmentName",
            },
            {
              title: "所属房间",
              dataIndex: "no",
            },
            {
              title: "状态",
              dataIndex: "status",
            },
            {
              title: "监测时间",
              dataIndex: "createDate",
            },
            {
              title: "操作",
              dataIndex: "operate",
              slot: "operate",
            },
          ],
        },
        {
          label: "维保记录",
          value: "2",
          column: [
            {
              title: "名称",
              dataIndex: "name",
              slot: "name",
            },
            {
              title: "编号",
              dataIndex: "no",
            },
            {
              title: "部门",
              dataIndex: "price",
            },
            {
              title: "状态",
              dataIndex: "socketStatus",
            },
            {
              title: "检测人",
              dataIndex: "departmentName",
            },
            {
              title: "开始时间",
              dataIndex: "no",
            },
            {
              title: "故障描述",
              dataIndex: "status",
            },
            {
              title: "操作",
              dataIndex: "operate",
              slot: "operate",
            },
          ],
        },
        {
          label: "管理人员",
          value: "3",
          column: [
            {
              title: "姓名",
              dataIndex: "name",
              slot: "name",
            },
            {
              title: "微信报警",
              dataIndex: "price",
            },
            {
              title: "短信报警",
              dataIndex: "socketStatus",
            },
            {
              title: "电话报警",
              dataIndex: "departmentName",
            },
            {
              title: "时间段",
              dataIndex: "no",
            },
            {
              title: "操作",
              dataIndex: "operate",
              slot: "operate",
            },
          ],
        },
        {
          label: "绑定的智能硬件",
          value: "4",
          column: [
            {
              title: "名称",
              dataIndex: "name",
              slot: "name",
            },
            {
              title: "类型",
              dataIndex: "no",
            },
            {
              title: "编号",
              dataIndex: "price",
            },
            {
              title: "值",
              dataIndex: "socketStatus",
            },
            {
              title: "状态",
              dataIndex: "status",
            },
            {
              title: "操作",
              dataIndex: "operate",
              slot: "operate",
            },
          ],
        },
        {
          label: "进出管理",
          value: "5",
          column: [
            {
              title: "名称",
              dataIndex: "name",
              slot: "name",
            },
            {
              title: "型号",
              dataIndex: "no",
            },
            {
              title: "规格",
              dataIndex: "price",
            },
            {
              title: "取出时间",
              dataIndex: "socketStatus",
            },
            {
              title: "归还时间",
              dataIndex: "departmentName",
            },
            {
              title: "查看视频/图片",
              dataIndex: "no",
            },
            {
              title: "使用前存量",
              dataIndex: "status",
            },
            {
              title: "使用后存量",
              dataIndex: "createDate",
            },
            {
              title: "备注",
              dataIndex: "remark",
            },
            {
              title: "操作",
              dataIndex: "operate",
              slot: "operate",
            },
          ],
        },
        {
          label: "历史异常记录",
          value: "6",
          column: [
            {
              title: "借用人",
              dataIndex: "name",
              slot: "name",
            },
            {
              title: "联系方式",
              dataIndex: "no",
            },
            {
              title: "申请时间",
              dataIndex: "price",
            },
            {
              title: "归还时间",
              dataIndex: "socketStatus",
            },
            {
              title: "使用状态",
              dataIndex: "departmentName",
            },
            {
              title: "所属房间",
              dataIndex: "no",
            },
            {
              title: "状态",
              dataIndex: "status",
            },
            {
              title: "监测时间",
              dataIndex: "createDate",
            },
            {
              title: "操作",
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
