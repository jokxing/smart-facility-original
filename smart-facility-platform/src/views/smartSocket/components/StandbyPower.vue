<template>
  <el-dialog
      :before-close="handleClose"
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="dialogVisible"
      append-to-body>
    <el-form v-model="form" label-width="auto" label-position="left">
      <el-form-item :label="$t('other.powerStatus')">
        <el-input
            v-model.trim="form.standbyPower"
            class="select-change-p"
            oninput="value=value.replace(/[^\d.]/g,'')"
            :placeholder="$t('common.inputNum')">
          <template slot="append">W</template>
        </el-input>
      </el-form-item>
      <el-form-item :label="$t('other.powerDuration')">
        <el-input
          v-model.trim.number="form.duration"
          class="select-change-p"
          oninput="value=value.replace(/[^\d]/g,'')"
          :placeholder="$t('common.inputNum')">
          <template slot="append">{{ $t('common.second') }}</template>
        </el-input>
      </el-form-item>
<!--      <el-alert-->
<!--        :title="$t('hardware.durationPs')"-->
<!--        type="info"-->
<!--        :closable="false"-->
<!--        center-->
<!--        show-icon>-->
<!--      </el-alert>-->
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button :disabled="disabled" @click="handleClose">{{ $t('common.cancel') }}</el-button>
      <el-button :disabled="disabled" :loading="disabled" type="primary" @click="handleSubmit()">{{ $t('common.confirm') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {updateStandbyPowerSmartSocket} from "@/api/smartSocket";
import {ERROR} from "@/utils/constant";
import {getSmartSocketGetStandbyParams} from "@/api/labDevice";
export default {
  name: "standbyPower",
  data() {
      const _this = this;
    return {
      title: _this.$t('other.setRunParam'),
      dialogVisible: false,
      form: {
        equipmentId: null,
        standbyPower: null,
        duration: null
      },
      disabled: false
    }
  },
  methods: {
    handleClose() {
      this.dialogVisible = !this.dialogVisible;
      this.form = {
        equipmentId: null,
        duration: null,
        standbyPower: null
      }
    },
    open(type, row) {
      this.form.equipmentId = row;
      // this.form.standbyPower = row.standPower;
      getSmartSocketGetStandbyParams({id: row}).then(res => {
        if (res.code) {
          this.form = {
            equipmentId: row,
            duration: res.items?.duration || '',
            standbyPower: res.items?.standbyPower || ''
          };
        }
      })
      this.dialogVisible = !this.dialogVisible;
    },
    async handleSubmit() {
        let count = 0;
        const strNum = this.form.standbyPower.toString();
        let index = strNum.indexOf('.');
        for (; index !== -1; index = strNum.indexOf('.', index + 1)) {
            count++;
        }
        if (count > 1) {
            this.$message.error(this.$t('common.inputNum'));
            return;
        }
      try {
        const res = await updateStandbyPowerSmartSocket(this.form);
        if (res.code) {
          this.$message.success(this.$t('hardware.standbyPower'));
          this.handleClose();
          this.$emit("handle")
        } else {
          this.$message.error(res.message);
        }
      } catch (e) {
        this.disabled = false;
        this.$message.error(ERROR);
      }

    }
  }
}
</script>
