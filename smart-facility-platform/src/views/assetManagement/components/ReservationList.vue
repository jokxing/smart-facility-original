<template>
  <div class="reservation">
    <!--   TODO:此部分后续需组件化   -->
    <el-radio-group v-model="tabPosition" style="margin-bottom: 30px;">
      <el-radio-button label="1">使用</el-radio-button>
      <el-radio-button label="2">预约</el-radio-button>
    </el-radio-group>
    <div class="search-bar-container">
      <!--   TODO:此部分后续需组件化   -->
      <div>
        <el-select
            v-model="items.status"
            class="margin-small-right"
            @change="handleQuery">
          <el-option :value="0" label="全部状态"></el-option>
          <el-option :value="1" label="使用完成"></el-option>
          <el-option :value="2" label="使用中"></el-option>
          <el-option :value="3" label="预约中"></el-option>
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
        <el-button class="icon-add-to" type="primary"> 新增预约</el-button>
        <el-button class="icon-download1" @click="upload()"> 导出</el-button>
      </div>
    </div>
    <el-table
        :data="reservationList"
    >
      <el-table-column label="资产名称" prop="receiveName"/>
      <el-table-column label="资产编号" prop="receiveNo"/>
      <el-table-column label="单据状态" prop="status">
        <template v-slot="scope">
          <el-tag :type="scope.row.status === 1 ? 'success': (scope.row.status === 2 ? 'danger':'warning')"
                  effect="dark">
            {{ scope.row.status === 1 ? '使用完成' : (scope.row.status === 2 ? '使用中' : '预约中') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="单据号" prop="documentCode"/>
      <el-table-column label="预约人" prop="receiveUser"/>
      <el-table-column label="预约日期" prop="receiveDate"/>
      <el-table-column label="预计归还时间" prop="predictReturnDate"/>
      <el-table-column label="创建人" prop="createUser"/>
      <el-table-column label="创建时间" prop="createDate"/>
    </el-table>
    <div class="paging">

    </div>
  </div>
</template>

<script>
import InputAppend from "@c/InputAppend/index";
import {compareDate, picker, uploadFunction} from "@/views/assetManagement/components/mixin";
const array = [
  {
    receiveName: "移液枪",
    receiveNo: 2205160925,
    status: 1,
    documentCode: "RE202203554",
    receiveUser: "段磊",
    receiveDate: "2022-05-16",
    predictReturnDate: "2022-05-18",
    createUser: "段磊",
    createDate: "2022-05-16 09:06:55"
  },
  {
    receiveName: "投影仪",
    receiveNo: 2205160906,
    status: 2,
    documentCode: "RE202203563",
    receiveUser: "孟彦成",
    receiveDate: "2022-05-14",
    predictReturnDate: "2022-05-15",
    createUser: "孟彦成",
    createDate: "2022-05-14 10:21:46"
  },
  {
    receiveName: "小米音响",
    receiveNo: 2205160935,
    status: 1,
    documentCode: "RE202203520",
    receiveUser: "许佳佳",
    receiveDate: "2022-05-10",
    predictReturnDate: "2022-05-15",
    createUser: "段磊",
    createDate: "2022-05-10 18:00:23"
  },
  {

    receiveName: "移液枪",
    receiveNo: 2205160975,
    status: 3,
    documentCode: "RE202203502",
    receiveUser: "曹慧",
    receiveDate: "2022-04-20",
    predictReturnDate: "2022-05-15",
    createUser: "曹洁",
    createDate: "2022-04-20 15:40:36"
  },
  {
    receiveName: "HP电脑20544",
    receiveNo: 2205160985,
    status: 1,
    documentCode: "RE202203501",
    receiveUser: "马勇智",
    receiveDate: "2022-03-22",
    predictReturnDate: "2022-03-23",
    createUser: "秦明",
    createDate: "2022-03-22 09:53:25"
  },
];
export default {
  name: "ReservationList",
  components: {
    InputAppend
  },
  data() {
    return {
      tabPosition: "1",
      items: {
        status: 0,
        keyword: ""
      },
      reservationList: array,
      pickerOptions: picker
    }
  },
  methods: {
    handleQuery() {
      this.reservationList = [];
      if (this.items.date && this.items.date.length > 0) {
        array.map(item => {
          if (compareDate(this.items.date, item.receiveDate)) {
            if (!this.items.status && !this.items.keyword) {
              this.reservationList.push(item);
            }
            if (item.status == this.items.status && !this.items.keyword) {
              this.reservationList.push(item)
            }
            if (!this.items.status && this.items.keyword) {
              if (item.receiveName.indexOf(this.items.keyword) !== -1 ||
                  item.documentCode.indexOf(this.items.keyword) !== -1) this.reservationList.push(item);
            }
            if (item.status == this.items.status && this.items.keyword) {
              if (item.receiveName.indexOf(this.items.keyword) !== -1 ||
                  item.documentCode.indexOf(this.items.keyword) !== -1) this.reservationList.push(item);
            }
          }
        })
      } else {
        array.map(item => {
          if (!this.items.status && !this.items.keyword) {
            this.reservationList.push(item);
          }
          if (item.status == this.items.status && !this.items.keyword) {
            this.reservationList.push(item)
          }
          if (!this.items.status && this.items.keyword) {
            if (item.receiveName.indexOf(this.items.keyword) !== -1 ||
                item.documentCode.indexOf(this.items.keyword) !== -1) this.reservationList.push(item);
          }
          if (item.status == this.items.status && this.items.keyword) {
            if (item.receiveName.indexOf(this.items.keyword) !== -1 ||
                item.documentCode.indexOf(this.items.keyword) !== -1) this.reservationList.push(item);
          }
        })
      }
    },
    upload() {
      let str = '<tr><td>资产名称</td><td>资产编号</td><td>单据状态</td><td>单据号</td><td>预约人</td><td>预约日期</td><td>预计归还时间</td>' +
          '<td>创建人</td><td>创建时间</td></tr>';
      uploadFunction(array, str);
    }
  }
}
</script>

<style scoped>

</style>
