<template>
  <el-dialog
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="dialogVisible"
      append-to-body>
    <el-form v-model="form" label-width="auto" label-position="left">
      <el-form-item :rules="[{required: true}]" :label="$t('common.name')">
        <el-input
            v-model.trim="form.templateName"
            autocomplete="off"
            class="select-change-p"
            :placeholoder="$t('common.pleaseInput')"/>
      </el-form-item>
      <el-form-item :label="$t('common.remark')">
        <el-input
            :rows="4"
            autocomplete="off"
            maxlength="30"
            class="select-change-p"
            v-model="form.remark"
            show-word-limit
            type="textarea"/>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">{{ $t('common.cancel') }}</el-button>
      <el-button type="primary" @click="handleSubmit()">{{ $t('common.confirm') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {addReportTemplate} from "@/api/room";

export default {
  name: "Create",
  data() {
      const _this = this;
    return {
      title: _this.$t('room.addTemplate1'),
      form: {
        templateName: "",
        remark: "",
      },
      dialogVisible: false
    }
  },
  methods: {
    handleClose() {
      this.dialogVisible = false;
      this.form = {
        templateName: "",
        remark: ""
      }
    },
    open() {
      this.dialogVisible = true;
    },
    handleSubmit() {
      if (!this.form.templateName) {
        return this.$message.error(this.$t('common.isNotName'));
      }
      addReportTemplate(this.form).then(res => {
        if (res.code) {
          this.$emit("handle", {id: res.items.templateId, name: res.items.templateName, remark: res.items.remark});
          this.handleClose();
        } else {
          this.$message.error(res.message);
        }
      })
    }
  }
}
</script>
