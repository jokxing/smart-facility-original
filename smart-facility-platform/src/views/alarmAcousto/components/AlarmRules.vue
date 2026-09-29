<template>
  <el-dialog
      :before-close="handleClose"
      :close-on-click-modal="false"
      :visible.sync="dialogVisible"
      append-to-body
      title="修改报警规则">
    <el-form>
      <el-form-item label="预警开关" label-width="130px">
        <el-switch v-model="form.openWarn"/>
      </el-form-item>
      <el-form-item v-if="form.openWarn" label="预警范围" label-width="130px">
        <el-col :span="8">
          <el-form-item>
            <el-input v-model="form.warningMin" oninput="value=value.replace(/[^\d-]/g, '')" placeholder="选择输入最小值"
                      @blur="handleWarningMin(form)"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="4" class="line">~</el-col>
        <el-col :span="8">
          <el-form-item>
            <el-input v-model="form.warningMax" oninput="value=value.replace(/[^\d-]/g, '')" placeholder="选择输入最大值"
                      @blur="handleWarningMax(form)"></el-input>
          </el-form-item>
        </el-col>
      </el-form-item>
      <el-form-item label="报警范围" label-width="130px">
        <el-col :span="8">
          <el-form-item>
            <el-input v-model="form.min" oninput="value=value.replace(/[^\d-]/g, '')" placeholder="选择输入最小值"
                      @blur="handleWarningMin(form)"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="4" class="line">~</el-col>
        <el-col :span="8">
          <el-form-item>
            <el-input v-model="form.max" oninput="value=value.replace(/[^\d-]/g, '')" placeholder="选择输入最大值"
                      @blur="handleWarningMax(form)"></el-input>
          </el-form-item>
        </el-col>
      </el-form-item>
    </el-form>
    <el-alert
        :closable="false"
        description="说明：当设备超过设定范围时，将启动报警"
        type="warning">
    </el-alert>
    <span slot="footer" class="dialog-footer">
      <el-button :disabled="disabled" @click="handleClose">取 消</el-button>
      <el-button :disabled="disabled" :loading="disabled" type="primary" @click="handleSubmit">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {getAlarmAlarmorMonitorInfoObtain, getAlarmAlarmorMonitorInfoSaveEdit} from "@/api/alertor";
import {ERROR} from "@/utils/constant";

export default {
  name: "AlarmRules",
  data() {
    return {
      dialogVisible: false,
      form: {
        openWarn: false,
        min: 0,
        max: 0,
        warningMax: 0,
        warningMin: 0
      },
      isScope: false,
      disabled: false
    }
  },
  inject: ["reload"],
  methods: {
    handleClose() {
      this.dialogVisible = false;
      this.form = {
        openWarn: false,
        min: 0,
        max: 0,
        warningMax: 0,
        warningMin: 0
      };
    },
    open(index, no) {
      this.dialogVisible = true;
      this.form.equipmentNo = no;
      getAlarmAlarmorMonitorInfoObtain({equipmentNo: no}).then(res => {
        if (res.code) {
          if (res["items"]) {
            this.form.max = res.items.max;
            this.form.min = res.items.min;
            this.form.warningMax = res.items.warningMax;
            this.form.warningMin = res.items.warningMin;
            this.form.openWarn = !!res.items.openWarn;
          }
        } else {
          this.$message.error(res.message);
        }
      })
    },
    handleWarningMin(item) {
      if (Number(this.form.warningMin) - Number(this.form.warningMax) > 0 || Number(this.form.min) - Number(this.form.max) >= 0) {
        this.isScope = true;
        return this.$message.error("左侧起始值要小于右侧最终值");
      }
      this.isScope = false;
    },
    handleWarningMax(item) {
      if (Number(this.form.warningMax) - Number(this.form.warningMin) < 0 || Number(this.form.max) - Number(this.form.min) <= 0) {
        this.isScope = true;
        return this.$message.error("右侧起始值要大于左侧最终值");
      }
      this.isScope = false;
    },
    async handleSubmit() {
      if (this.isScope) {
        return false;
      }
      if (!this.form.openWarn) {
        this.form.warningMax = this.form.warningMin = 0;
      }
      this.form.warningMax = Number(this.form.warningMax);
      this.form.warningMin = Number(this.form.warningMin);
      delete this.form.id;
      this.form.openWarn = this.form.openWarn ? 1 : 0;
      this.disabled = true;
      try {
        let res = await getAlarmAlarmorMonitorInfoSaveEdit(this.form);
        this.disabled = false;
        if (res.code) {
          this.$message.success('修改成功！');
          this.$emit("handle");
          this.handleClose();
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

<style scoped>
.line {
  text-align: center;
}
</style>
