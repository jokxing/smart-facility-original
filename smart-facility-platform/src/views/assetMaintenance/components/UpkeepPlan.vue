<template>
  <div class="upkeep-plan">
    <el-radio-group v-model="tabPosition" style="margin-bottom: 30px;">
      <el-radio-button label="1">保养历史记录</el-radio-button>
      <el-radio-button label="2">模板管理</el-radio-button>
    </el-radio-group>
    <div class="search-bar-container">
      <div>
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
        <InputAppend :placeholder="'请输入名称或单号'" :keyword.sync="items.keyword" @handle="handleQuery"/>
      </div>
      <div>
        <el-button class="icon-add-to" type="primary"> 新增保养单</el-button>
        <el-button class="icon-download1" @click="upload()"> 导出</el-button>
      </div>
    </div>
    <el-table
        :data="upkeepPlan"
    >
      <el-table-column label="保养报告名称" prop="name"/>
      <el-table-column label="单号" prop="no"/>
      <el-table-column label="负责人" prop="userName"/>
      <el-table-column label="本次保养时间" prop="thenDate"/>
      <el-table-column label="下次保养时间" prop="nextDate"/>
      <el-table-column label="保养资产" prop="assetName"/>
    </el-table>
    <div class="paging">

    </div>
  </div>
</template>

<script>
import {picker} from "@/views/assetManagement/components/mixin";
import InputAppend from "@c/InputAppend/index";

export default {
  name: "UpkeepPlan",
  components: {
    InputAppend
  },
  data() {
    return {
      tabPosition: "1",
      items: {
        date: "",
        keyword: ""
      },
      upkeepPlan: [
        {name: "空调系统定期保养20220601", no: "9000010120", userName: "段三石",thenDate: "2022-06-01", nextDate: "2022-07-01", assetName: "冷冻机组"},
        {name: "冷冻机系统定期保养20220523", no: "9000010121", userName: "段三石",thenDate: "2022-05-23", nextDate: "2022-06-22", assetName: "冷冻机组"},
        {name: "除臭系统定期保养20220528", no: "9000010122", userName: "许佳佳",thenDate: "2022-05-28", nextDate: "2022-06-27", assetName: "冷冻机组"},
        {name: "水循环系统定期保养20220510", no: "9000010123", userName: "莫小熙",thenDate: "2022-05-10", nextDate: "2022-07-10", assetName: "冷冻机组"},
      ],
      pickerOptions: picker
    }
  },
  methods: {
    handleQuery() {},
    upload() {}
  }
}
</script>

<style scoped>

</style>
