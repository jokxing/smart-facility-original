<template>
  <el-dialog
      :before-close="handleClose"
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="dialogVisible"
      append-to-body>
    <el-form :model="form">
      <el-form-item :label="$t('hardware.alarmInterDate')" label-position="left" label-width="auto">
        <el-input
            v-model.trim="form.alarmInterval"
            autocomplete="off"
            class="select-change-p"
            type="number"
            oninput="value=value.replace(/[^\d]/g,'')"
            :placeholder="$t('hardware.alarmInterDateMessage')"
            @input="handleAlarmInterval(form.alarmInterval)">
          <template slot="append">
            <span>{{ $t('common.minute') }}</span>
          </template>
        </el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button :disabled="disabled" @click="handleClose">{{ $t("common.cancel") }}</el-button>
      <el-button :disabled="disabled" :loading="disabled" type="primary" @click="handleSubmit()">{{ $t("common.confirm") }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {updateAlarmIntervalAlarm, updateAlarmIntervals} from "@/api/device";
import {postGunPipetteEdit} from "@/api/gun";
import {ERROR} from "@/utils/constant";

export default {
  name: "UpdateAlarmTime",
  data() {
      const _this = this;
    return {
      dialogVisible: false,
      title: _this.$t('hardware.updateAlarmInterDate'),
      form: {
        alarmInterval: null
      },
      items: null,
      type: 0,
      thingsType: null,
      disabled: false
    }
  },
  methods: {
    handleClose() {
      this.dialogVisible = !this.dialogVisible;
      this.type = 0;
      this.items = null;
      this.form.alarmInterval = null;
    },
    /**
     *
     * @param type 1:批量；0:单个操作
     * @param items
     */
    open(type, items, thingsType) {
      if (type !== this.type) {
        this.items = items;
        this.type = type;
      } else {
        if(thingsType === "GUN"){
          this.items = items.pipetteGunId;
        }else{
          this.items = items.id;
        }
        this.type = type;
        this.thingsType = thingsType;
        this.form.alarmInterval = items.alarmInterval;
      }
      this.dialogVisible = !this.dialogVisible;
    },
    handleAlarmInterval(value) {
      this.$set(this.form, "alarmInterval", value);
    },
    async handleSubmit() {
      if (Number(this.form.alarmInterval) < 1) {
        return this.$message.error(this.$t('common.isNotGreaterZero'));
      }
      this.disabled = true;
      try {
        let res;
        if (this.type) {
          res = await updateAlarmIntervals({
            id: 0,
            ids: this.items,
            alarmInterval: this.form.alarmInterval,
          });
          this.handleMessageHint(res);
        } else {
          if(this.thingsType === "GUN"){
            postGunPipetteEdit({gunId: this.items,alarmInterval: this.form.alarmInterval}).then(res => {
              if(res.code === 1){
                this.handleMessageHint(res);
              }
            })
          }else{
            res = await updateAlarmIntervalAlarm({
              id: this.items,
              alarmInterval: this.form.alarmInterval
            });
            this.handleMessageHint(res);
          }
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
        this.$message.success(this.$t('hardware.updateAlarmInterSuccess'));
        this.handleClose();
      } else {
        this.$message.error(res.message);
      }
    }
  }
}
</script>
