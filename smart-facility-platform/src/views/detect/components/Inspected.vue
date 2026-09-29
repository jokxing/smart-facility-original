<template>
  <el-dialog
      :before-close="handleClose"
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="dialogVisible"
      append-to-body>
    <el-form label-position="left" label-width="auto">
      <el-form-item :label="$t('hardware.reportFileName')"/>
      <el-form-item>
        <el-upload
            v-if="dialogVisible"
            :accept="'.pdf'"
            :action="httpRequest"
            :before-upload="beforeAvatarUpload"
            :data="ossData"
            :limit="1"
            :on-exceed="handleExceed"
            :on-success="handleSuccess"
            class="upload-demo"
            drag>
          <i class="el-icon-upload"/>
          <div class="el-upload__text">{{ $t("hardware.uploadText") }}<em>{{ $t("common.chilckUp") }}</em></div>
          <div slot="tip" class="el-upload__tip">{{ $t("hardware.uploadTip") }}</div>
        </el-upload>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">{{ $t("common.cancel") }}</el-button>
      <el-button :loading="loading" type="primary" @click="handleSubmit">{{ $t("common.confirm") }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
const UPLOAD_UNAVAILABLE_HINT = "文件上传未接入本副本，当前不可用。";

export default {
  name: "Inspected",
  data() {
      const _this = this;
    return {
      title: _this.$t('hardware.detectedFinish'),
      dialogVisible: false,
      // No hardcoded external upload host; action stays empty until a local demo upload is wired.
      httpRequest: "",
      ossData: {
        policy: "",
        signature: "",
        OSSAccessKeyId: "",
        dir: "",
        host: "",
        callback: "",
        key: ""
      },
      form: {
        detectId: "",
        reportFileName: ""
      },
        loading: false
    }
  },
  methods: {
    open(row) {
      this.dialogVisible = true;
      this.form.detectId = row.detectId;
      this.form.reportFileName = "";
    },
    handleClose() {
      this.dialogVisible = false;
    },
    handleSubmit() {
      // Upload is unavailable in this copy; confirmation must not complete a report.
      this.$message.warning(UPLOAD_UNAVAILABLE_HINT);
      return false;
    },
    handleExceed(file, fileList) {
      this.$message.warning(this.$t('hardware.uploadMaxFile'));
    },
    handleSuccess(res, file) {
      this.$message.warning(UPLOAD_UNAVAILABLE_HINT);
    },
    beforeAvatarUpload(file) {
      this.$message.warning(UPLOAD_UNAVAILABLE_HINT);
      return false;
    }
  }
}
</script>
