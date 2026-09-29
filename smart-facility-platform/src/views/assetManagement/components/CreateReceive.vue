<template>
  <el-dialog
      :before-close="handleClose"
      :close-on-click-modal="false"
      :title="type ? '资产借用': '资产领用'"
      :visible.sync="dialogVisible"
      width="30%"
      append-to-body>
    <el-form v-model="form">
      <el-form-item :label="(type ? '借用': '领用') +'日期'" required>
        <el-date-picker
            v-model="form.date"
            align="right"
            type="date"
            unlink-panels
            @change="handleQuery"
            class="select-change-p"
            value-format="yyyy-MM-dd HH:mm:ss"/>
      </el-form-item>
      <el-form-item :label="(type ? '借用': '领用') +'组织'" required>
        <select-department
            :department-id.sync="form.departmentId"
            :select-tree-value.sync="form.departmentId"
            class="select-change-p"/>
      </el-form-item>
      <el-form-item :label="(type ? '借用': '领用') +'人'" required>
        <el-input v-model="form.userName" class="select-change-p" placeholder="请输入姓名"></el-input>
      </el-form-item>
      <el-form-item :label="'预计'+(type ? '归还': '退还') +'日期'">
        <el-date-picker
            v-model="form.date1"
            align="right"
            class="select-change-p"
            type="date"
            unlink-panels
            @change="handleQuery"
            value-format="yyyy-MM-dd HH:mm:ss"/>
      </el-form-item>
      <el-form-item :label="(type ? '借用': '领用') +'后所在区域'">
        <el-input class="select-change-p" v-model="form.address" placeholder="请输入"></el-input>
      </el-form-item>
      <el-form-item :label="(type ? '借用': '领用') +'后存放位置'">
        <el-input class="select-change-p" v-model="form.address2" placeholder="请输入"></el-input>
      </el-form-item>
      <el-form-item label="备注">
        <el-input
            v-model.trim="form.remark"
            :rows="4"
            autocomplete="off"
            class="select-change"
            maxlength="30"
            show-word-limit
            type="textarea"/>
      </el-form-item>
      <el-form-item label="图片">
        <chuxou-upload
            :accept="'.png,.jpg,.jpeg'"
            :dir="'img'"
            :limit="1"
            @handleUploadSuccess="handleUploadSuccess"
            :value="fileList"/>
      </el-form-item>

    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button :disabled="disabled" @click="handleClose">取 消</el-button>
      <el-button :disabled="disabled" :loading="disabled" type="primary" @click="handleSubmit">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {picker} from "@/views/assetManagement/components/mixin";
import SelectDepartment from "@/views/labDevice/components/SelectDepartment";
import ChuxouUpload from "@/views/room/components/chuxouUpload";

export default {
  name: "CreateReceive",
  props: {

    type: {
      type: Number,
      default: 0
    }
  },
  components: {ChuxouUpload, SelectDepartment},
  data() {
    return {
      dialogVisible: false,
      form: {
        date: "",
        departmentId: localStorage.getItem("departmentId"),
        userName: "",
        date1: ""
      },
      pickerOptions: picker,
      fileList: [],
      disabled: false
    }
  },
  methods: {
    handleClose() {
      this.dialogVisible = false
    },
    handleUploadSuccess(e) {
      this.fileList = e;
    },
    open() {
      this.dialogVisible = true;
    },
    handleSubmit() {},
    handleQuery() {}
  }
}
</script>

<style lang="less" scoped>
/deep/.el-form-item__label {
  width: 120px !important;
}
</style>
