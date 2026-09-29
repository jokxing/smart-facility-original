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
import {getFilePolicy} from "@/api/upload";
import {getDetectComplete} from "@/api/detect";

export default {
  name: "Inspected",
  data() {
      const _this = this;
    return {
      title: _this.$t('hardware.detectedFinish'),
      dialogVisible: false,
      httpRequest: "https://chuxou.oss-cn-shenzhen.aliyuncs.com",
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
        this.loading = true;
      getDetectComplete(this.form).then(res => {
        if (res.code) {
          this.$message.success(res.message);
          this.$emit("handle");
          this.handleClose();
        } else {
          this.$message.error(res.message);
        }
      }).finally(() => {
          this.loading = false;
      })
    },
    handleExceed(file, fileList) {
      this.$message.warning(this.$t('hardware.uploadMaxFile'));
    },
    handleSuccess(res, file) {
      const url = res.items.fileUrl || res.items.fileName || null;
      if (!url) {
        return this.$message.error(this.$t('hardware.uploadNotFile'));
      } else {
        this.form.reportFileName = res.items.fileName;
      }
    },
    beforeAvatarUpload(file) {
      const _this = this;
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        return this.$message.error(this.$t('hardware.uploadTip'));
      }
      return new Promise((resolve, reject) => {
        getFilePolicy({dir: "pdf"}).then(res => {
          if (res.code) {
            const {host, accessKey, dir, callback, policy, signature} = res.items;
            _this.ossData = {
              policy,
              signature,
              OSSAccessKeyId: accessKey,
              dir,
              host,
              callback,
              key: dir + file.name
            };
            resolve(true);
          }
        }).catch(err => {
          reject(false);
        })
      })
    }
  }
}
</script>
