<template>
  <el-dialog
      :before-close="handleClose"
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="dialogVisible"
      append-to-body>
    <el-form :model="form" size="small" label-position="left" label-width="auto">
      <el-form-item :label="$t('hardware.alarmPlatform')">
        <el-switch v-model="form.closeSystemAlarm"/>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button :disabled="disabled" @click="handleClose">{{ $t('common.cancel') }}</el-button>
      <el-button :disabled="disabled" :loading="disabled" type="primary" @click="handleSubmit()">{{ $t('common.confirm') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {updateAlarmLights, updateAlarmSystems, updateCloseAlarmSystem} from "@/api/device";
import {ERROR} from "@/utils/constant";

export default {
  name: "UpdateAlarmPlatform",
  data() {
      const _this = this;
    return {
      dialogVisible: false,
      title: _this.$t("hardware.updateAlarmPlatform1"),
      form: {
        closeSystemAlarm: false
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
        this.items = items.id;
        this.form.closeSystemAlarm = !items.closeSystemAlarm;
        this.type = type;
      }
      this.dialogVisible = !this.dialogVisible;
    },
    async handleSubmit() {
      this.disabled = true;
      try {
        let res;
        if (this.type) {
          res = await updateAlarmSystems({
            id: 0,
            ids: this.items,
            closeSystemAlarm: this.form.closeSystemAlarm ? 0 : 1
          })
          this.handleMessageHint(res);
        } else {
          res = await updateCloseAlarmSystem({
            id: this.items,
            closeSystemAlarm: this.form.closeSystemAlarm ? 0 : 1
          })
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
        this.form.closeSystemAlarm ? this.$message.success(this.$t('hardware.openedSystemAlarm')) : this.$message.success(this.$t('hardware.closeSystemAlarm'));
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
