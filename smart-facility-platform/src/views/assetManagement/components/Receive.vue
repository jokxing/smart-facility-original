<template>
  <div class="receive">
    <el-radio-group v-model="tabPosition" style="margin-bottom: 30px;">
      <el-radio-button label="1">领用</el-radio-button>
      <el-radio-button label="2">退还</el-radio-button>
    </el-radio-group>
    <div class="search-bar-container">
      <div>
        <el-select
            v-model="items.status"
            class="margin-small-right"
            @change="handleQuery">
          <el-option :value="0" label="全部状态"></el-option>
          <el-option :value="1" label="已同意"></el-option>
          <el-option :value="2" label="已驳回"></el-option>
          <el-option :value="3" label="审批中"></el-option>
        </el-select>
        <el-date-picker
            v-model="items.date"
            :picker-options="pickerOptions"
            align="right"
            class="margin-small-right"
            end-placeholder="结束日期"
            range-separator="至"
            start-placeholder="开始日期"
            type="daterange"
            unlink-panels
            value-format="yyyy-MM-dd HH:mm:ss"
            @change="handleQuery">
        </el-date-picker>
        <InputAppend :placeholder="'请输入资产名称或单据号'" :keyword.sync="items.keyword" @handle="handleQuery"/>
      </div>
      <div>
        <el-button class="icon-add-to" type="primary" @click="$refs.CreateReceive.open()"> 新增领用</el-button>
        <el-button class="icon-download1" @click="upload()"> 导出</el-button>
      </div>
    </div>
    <el-table
        :data="receives"
    >
      <el-table-column label="领用资产" prop="receiveName"/>
      <el-table-column label="单据号" prop="documentCode"/>
      <el-table-column label="单据状态" prop="status">
        <template v-slot="scope">
          <el-tag :type="scope.row.status === 1 ? 'success': (scope.row.status === 2 ? 'danger':'')" effect="dark">
            {{ scope.row.status === 1 ? '已同意' : (scope.row.status === 2 ? '已驳回' : '审批中') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="领用日期" prop="receiveDate"/>
      <el-table-column label="领用人" prop="receiveUser"/>
      <el-table-column label="预计退还时间" prop="predictReturnDate"/>
      <el-table-column label="领用后所在区域" prop="receiveArea"/>

      <el-table-column label="创建人" prop="createUser"/>
      <el-table-column label="创建时间" prop="createDate"/>
    </el-table>
    <div class="paging">

    </div>
    <create-receive ref="CreateReceive"/>
  </div>
</template>

<script>
import InputAppend from "@c/InputAppend"
import {compareDate, picker, uploadFunction} from "@/views/assetManagement/components/mixin";
import CreateReceive from "@/views/assetManagement/components/CreateReceive";

const defaultArray = [
  {
    receiveName: "设备标签打印机",
    documentCode: "RE20220506",
    status: 1,
    receiveDate: "2022-05-16",
    receiveUser: "张天问",
    predictReturnDate: "2022-05-18",
    receiveArea: "1号楼/2F/生成车间",
    createUser: "张天问",
    createDate: "2022-05-16 09:06:55"
  },
  {
    receiveName: "移液枪",
    documentCode: "RE20220501",
    status: 2,
    receiveDate: "2022-05-14",
    receiveUser: "刘磊",
    predictReturnDate: "2022-05-15",
    receiveArea: "1号楼/2F/生成车间",
    createUser: "刘磊",
    createDate: "2022-05-14 10:21:46"
  },
  {
    receiveName: "设备标签打印机",
    documentCode: "RE20220466",
    status: 1,
    receiveDate: "2022-05-10",
    receiveUser: "段磊",
    predictReturnDate: "2022-05-15",
    receiveArea: "2号楼/4F/研发室",
    createUser: "段磊",
    createDate: "2022-05-10 18:00:23"
  },
  {
    receiveName: "液氮罐",
    documentCode: "RE20220306",
    status: 3,
    receiveDate: "2022-04-20",
    receiveUser: "曹洁",
    predictReturnDate: "2022-05-15",
    receiveArea: "3号楼/3F/生成车间",
    createUser: "曹洁",
    createDate: "2022-04-20 15:40:36"
  },
  {
    receiveName: "移液枪",
    documentCode: "RE20220252",
    status: 1,
    receiveDate: "2022-03-22",
    receiveUser: "秦明",
    predictReturnDate: "2022-03-23",
    receiveArea: "1号楼/2F/生成车间",
    createUser: "秦明",
    createDate: "2022-03-22 09:53:25"
  },
];

export default {
  name: "Receive",
  components: {
    CreateReceive,
    InputAppend
  },
  data() {
    return {
      receives: defaultArray,
      items: {
        status: 0,
        date: "",
        keyword: ""
      },
      tabPosition: 1,
      pickerOptions: picker
    }
  },
  methods: {
    handleQuery() {
      this.receives = [];
      if (this.items.date && this.items.date.length > 0) {
        defaultArray.map(item => {
          if (compareDate(this.items.date, item.receiveDate)) {
            if (!this.items.status && !this.items.keyword) {
              this.receives.push(item);
            }
            if (item.status == this.items.status && !this.items.keyword) {
              this.receives.push(item)
            }
            if (!this.items.status && this.items.keyword) {
              if (item.receiveName.indexOf(this.items.keyword) !== -1 ||
                  item.documentCode.indexOf(this.items.keyword) !== -1) this.receives.push(item);
            }
            if (item.status == this.items.status && this.items.keyword) {
              if (item.receiveName.indexOf(this.items.keyword) !== -1 ||
                  item.documentCode.indexOf(this.items.keyword) !== -1) this.receives.push(item);
            }
          }
        })
      } else {
        defaultArray.map(item => {
          if (!this.items.status && !this.items.keyword) {
            this.receives.push(item);
          }
          if (item.status == this.items.status && !this.items.keyword) {
            this.receives.push(item)
          }
          if (!this.items.status && this.items.keyword) {
            if (item.receiveName.indexOf(this.items.keyword) !== -1 ||
                item.documentCode.indexOf(this.items.keyword) !== -1) this.receives.push(item);
          }
          if (item.status == this.items.status && this.items.keyword) {
            if (item.receiveName.indexOf(this.items.keyword) !== -1 ||
                item.documentCode.indexOf(this.items.keyword) !== -1) this.receives.push(item);
          }
        })
      }
    },
    upload() {
      let str = '<tr><td>单据状态</td><td>领用资产</td><td>领用日期</td><td>领用人</td><td>预计退还时间</td><td>领用后所在区域</td>' +
          '<td>单据号</td><td>创建人</td><td>创建时间</td></tr>';
      uploadFunction(defaultArray, str)
    }
  }
}
</script>

<style scoped>

</style>
