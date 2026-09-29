<template>
  <el-dialog
      :before-close="handleClose"
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="dialogVisible"
      append-to-body>
    <el-form v-model="form" label-width="auto" label-position="left">
      <el-form-item :rules="[{required: true}]" :label="$t('room.reportName')">
        <el-input class="select-change-p" maxlength="15" v-model.trim="form.reportName" :placeholder="$t('common.pleaseInput')"/>
      </el-form-item>
      <el-form-item :rules="[{required: true}]" :label="$t('room.templateId')">
        <el-select v-model="form.templateId" class="select-change-p" :placeholder="$t('common.placeholder')">
          <el-option
              v-for="item in reports"
              :key="item.id"
              :label="item.name"
              :value="item.id"/>
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">{{ $t('common.cancel') }}</el-button>
      <el-button type="primary" @click="handleSubmit()">{{ $t('common.confirm') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {getReportTemplateListNoPage} from "@/api/room";

export default {
  name: "ReportCreate",
  data() {
      const _this = this;
    return {
      title: _this.$t('room.addTemplate'),
      dialogVisible: false,
      form: {
        templateId: null,
        name: null,
        reportName: "",
        id: null
      },
      reports: []
    }
  },
  methods: {
    handleClose() {
      this.form = {
        templateId: null,
        name: null,
        reportName: "",
        id: null
      }
      this.dialogVisible = false;
    },
    open(obj) {
      this.dialogVisible = true;
      this.form.id = obj.id;
      this.form.name = obj.name;
      getReportTemplateListNoPage().then(res => {
        if (res.code) {
          this.reports = res.items;
        } else {
          this.$message.error(res.massage);
        }
      })
    },
    handleSubmit() {
      if (!this.form.reportName) {
        return this.$message.error(this.$t('room.templateName'));
      }
      if (!this.form.templateId) {
        return this.$message.error(this.$t('room.changeTemplate'));
      }
      localStorage.setItem("form", JSON.stringify(this.form));
      this.$emit("update:reportDrawer", true);
      this.handleClose();
    }
  }
}
</script>

<style scoped>

</style>
