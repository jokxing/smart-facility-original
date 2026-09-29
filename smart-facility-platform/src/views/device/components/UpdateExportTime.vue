<template>
  <el-dialog
      :before-close="handleClose"
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="dialogVisible"
      append-to-body>
    <el-form :model="form" label-position="left" label-width="auto">
      <el-form-item :label="$t('hardware.reportingInterval')">
        <el-input
            v-model.trim="form.reportingInterval"
            autocomplete="off"
            class="select-change-p"
            type="number"
            oninput="value=value.replace(/[^\d]/g,'')"
            :placeholder="$t('common.placeholder')">
          <template slot="append">
            <span>{{ $t('common.minute') }}</span>
          </template>
        </el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button :disabled="disabled" @click="handleClose">{{ $t('common.cancel') }}</el-button>
      <el-button :disabled="disabled" :loading="disabled" type="primary" @click="handleSubmit()">{{ $t("common.confirm") }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {updateAlarmIntervalReport, updateAlarmIntervalReports} from "@/api/device";
import {updateThingsUser} from "@/api/user";
import {ERROR} from "@/utils/constant";

export default {
  name: "UpdateExportTime",
  data() {
      const _this = this;
    return {
      dialogVisible: false,
      title: _this.$t('hardware.fixReportingInterval'),
      form: {
        reportingInterval: null
      },
      items: null,
      type: 0,
      disabled: false
    }
  },
  methods: {
    handleClose() {
      this.dialogVisible = !this.dialogVisible;
      this.type = 0;
      this.items = null;
      this.form.reportingInterval = null;
    },
    /**
     *
     * @param type 1:批量；0:单个操作
     * @param items
     */
    open(type, items) {
      if (type !== this.type) {
        this.items = items;
        this.type = type;
      } else {
        this.type = type;
        this.items = items.id;
        this.form.reportingInterval = items.reportingInterval;
      }
      this.dialogVisible = !this.dialogVisible;
    },
    async handleSubmit() {
      if (!this.form.reportingInterval) {
        return this.$message.error(this.$t('common.isNotGreaterZero'))
      }
      this.disabled = true;
      try {
        let res;
        if (this.type) {
          res = await updateAlarmIntervalReports({
            id: 0,
            ids: this.items,
            reportingInterval: this.form.reportingInterval,
          });
          this.handleMessageHint(res);
        } else {
          res = await updateAlarmIntervalReport({
            id: this.items,
            reportingInterval: this.form.reportingInterval
          });
          this.handleMessageHint(res);
        }
      } catch (e) {
        this.disabled = false;
        this.$message.error(ERROR);
      }
    },
    handleMessageHint(res) {
      this.disabled = false;
      if (res.code) {
        this.$emit("handle");
        res.code && this.$message.success(this.$t('hardware.fixReportingIntervalSuccess'));
        this.handleClose();
      } else {
        this.$message.error(res.message);
      }
    }
  }
}
</script>

