<template>
  <el-dialog
      :before-close="handleClose"
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="dialogVisible"
      append-to-body
      custom-class="dialog">
    <el-form v-model="form" label-position="left" label-width="auto">
      <el-form-item :rules="[{required: true}]" :label="$t('hardware.alarmType')">
        <el-select
            v-model="form.errorType"
            allow-create
            class="select-change-p"
            default-first-option
            :placeholder="$t('common.placeholder')">
          <el-option
              v-for="item in alarmTypes"
              :key="item.id"
              :label="item.name"
              :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('hardware.disposeTime')">
        <el-date-picker
            v-model="form.processDate"
            class="select-change-p"
            default-time="12:00:00"
            :placeholder="$t('common.selectTime')"
            type="datetime">
        </el-date-picker>
      </el-form-item>
      <el-form-item :label="$t('hardware.processUsername')">
        {{ this.form.processUsername }}
      </el-form-item>
      <el-form-item :label="$t('hardware.processMethod')">
        <el-input
            v-model.trim="form.processMethod"
            autocomplete="off"
            class="select-change-p"
            maxlength="30"
            show-word-limit
            type="textarea"/>
      </el-form-item>
      <el-form-item :label="$t('hardware.alarmCause')">
        <el-input
            v-model.trim="form.remark"
            autocomplete="off"
            class="select-change-p"
            maxlength="30"
            show-word-limit
            type="textarea"/>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button :disabled="disabled" @click="handleClose">{{ $t("common.cancel") }}</el-button>
      <el-button :disabled="disabled" :loading="disabled" type="primary" @click="handleSubmit()">{{ $t("common.confirm") }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {
  addAlarmProcess,
  getAlarmErrorList,
  getAlarmProcessInfo,
  updateAlarmLight,
  updateAlarmProcess
} from "@/api/device";
import {ERROR, TIME_FORMAT} from "@/utils/constant";
import moment from "moment"

let date = new Date();
export default {
  name: "AlarmProcessing",
  data() {
      const _this = this;
    return {
      title: _this.$t('hardware.disposeAlarm'),
      dialogVisible: false,
      form: {
        alarmId: 0,
        companyId: null,
        equipmentId: null,
        errorType: 0,
        processDate: null,
        processMethod: null,
        processUsername: "",
        remark: ""
      },
      alarmTypes: [],
      process: null,
      disabled: false
    }
  },
  methods: {
    open(row, type) {
      const {equipmentId, id, companyId, process} = row;
      this.process = process;
      if (!process) {
        this.title = this.$t("hardware.addDisposeAlarm");
        this.form.processDate = moment(date).format(TIME_FORMAT);
        this.form.processUsername = localStorage.getItem("username");
      } else {
        this.title = this.$t("hardware.editDisposeAlarm");
        getAlarmProcessInfo({alarmId: id}).then(res => {
          const {errorType, processMethod, remark, processDate, processUserName} = res;
          this.form.errorType = errorType;
          this.form.processMethod = processMethod;
          this.form.processDate = processDate;
          this.form.processUsername = processUserName;
          this.form.remark = remark;
        })
      }
      this.form.equipmentId = equipmentId;
      this.form.alarmId = id;
      this.form.companyId = companyId;
      this.dialogVisible = true;
      if(type){
        var data = {
          type: type
        }
      }
      getAlarmErrorList(data).then(res => {
        this.alarmTypes = res.items.list;
      })
    },
    handleClose() {
      this.dialogVisible = false;
      this.form = {
        alarmId: null,
        companyId: null,
        equipmentId: null,
        errorType: 0,
        processDate: null,
        processMethod: null,
        processUsername: "",
        remark: ""
      }
    },
    async handleSubmit() {
      this.form.processDate = moment(this.form.processDate).format(TIME_FORMAT);
      this.disabled = true;
      try {
        let res;
        if (this.process) {
          res = await updateAlarmProcess(this.form);
          this.handleMessage(res);
        } else {
          res = await addAlarmProcess(this.form);
          this.handleMessage(res);
        }
      } catch (e) {
        this.disabled = false;
        this.$message.error(ERROR);
      }
    },
    handleMessage(res) {
      this.disabled = false;
      if (res.code) {
        this.$message.success(this.title + this.$t("common.success"));
        this.$emit("handle");
        this.handleClose();
      } else {
        this.$message.error(res.message);
      }
      this.disabled = false;
    }
  }
}
</script>
