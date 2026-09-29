<template>
  <el-dialog
      :before-close="handleClose"
      :close-on-click-modal="false"
      :visible.sync="dialogVisible"
      append-to-body
      :title="$t('hardware.updateBeepAlarmTime')">
    <el-form v-model="form">
      <el-form-item :label="$t('hardware.beepAlarmTime')">
        <el-input
            v-model.trim="form.beepAlarmTime"
            autocomplete="off"
            maxlength="10"
            oninput="value=value.replace(/[^\d]/g, '')"
            :placeholder="$t('common.inputNum')"
        >
          <template #append>
            <span>{{ $t('common.second') }}</span>
          </template>
        </el-input>
      </el-form-item>
      <el-alert :closable="false" center show-icon :title="$t('hardware.beepAlarmPs')" type="warning"/>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button :disabled="disabled" @click="handleClose">{{ $t('common.cancel') }}</el-button>
      <el-button :disabled="disabled" :loading="disabled" type="primary" @click="handleSubmit()">{{ $t('common.confirm') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {getAlarmAlarmorMonitorInfoSaveEdit, getAlertorBeepAlarmTimeBatch, getAlertorDeepAlarmTime} from "@/api/alertor";
import {ERROR} from "@/utils/constant";

export default {
  name: "BeepAlarmTime",
  data() {
    return {
      dialogVisible: false,
      form: {
        beepAlarmTime: 5,
        equipmentNo: ""
      },
      type: 0,
      disabled: false
    }
  },
  methods: {
    open(type, row) {
      this.dialogVisible = true;
      this.type = type;
      if (!type) {
        this.form.beepAlarmTime = row.beepAlarmTime;
        this.form.equipmentNo = row.equipmentNo;
      } else {
        this.form.equipmentIdList = row;
      }
    },
    handleClose() {
      this.dialogVisible = false;
      this.form.beepAlarmTime = 5;
      this.form.equipmentNo = "";
    },
    async handleSubmit() {
      if (!this.form.beepAlarmTime && this.form.beepAlarmTime !== 0) {
        return this.$message.error(this.$t('common.isNotInput'));
      }
      this.disabled = true;
      try {
        let res;
        if (!this.type) {
          res = await getAlertorDeepAlarmTime(this.form)
          this.message(res);
        } else {
          res = await getAlertorBeepAlarmTimeBatch(this.form)
          this.message(res);
        }
      } catch (e) {
        this.disabled = false;
        this.$message.error(ERROR);
      }
    },
    message(res) {
      this.disabled = false;
      if (res.code) {
        this.$message.success(this.$t('hardware.beepAlarmTimeSuccess'));
        this.$emit("handle");
        this.handleClose();
      } else {
        this.$message.error(res.message);
      }
    }
  }
}
</script>

<style scoped>

</style>
