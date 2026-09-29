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
        {{ form.errorCauseUserName }}
      </el-form-item>
      <el-form-item :label="$t('hardware.processMethod')">
        <el-input
            v-model.trim="form.errorCauseMethod"
            autocomplete="off"
            class="select-change-p"
            maxlength="30"
            show-word-limit
            type="textarea"/>
      </el-form-item>
      <el-form-item :label="$t('hardware.alarmCause')">
        <el-input
            v-model.trim="form.errorCauseMsg"
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
import {getAlarmErrorList,} from "@/api/device";
import {batchHandleException} from "../../../api/alarmLog";
import moment from "moment";

let date = new Date();
export default {
  name: "AlarmProcessing",
    props: {
        items: {
            type: Array,
            default: () => []
        }
    },
  data() {
      const _this = this;
    return {
      title: _this.$t('hardware.disposeAlarm'),
      dialogVisible: false,
      form: {
          ids: [],
          errorType: 0,
          processDate: '',
          errorCauseMethod: '',
          errorCauseMsg: '',
          errorCauseUserName: '',
      },
      ids: [],
      alarmTypes: [],
      process: null,
      disabled: false
    }
  },
  methods: {
    open(row) {
        this.dialogVisible = true;
        console.log(row)
        this.form.ids = row.map(item => item.id);
        this.form.errorCauseUserName = localStorage.getItem('username');
        getAlarmErrorList().then(res => {
            if (res.code) {
                this.alarmTypes = res.items.list;
            }
        });
        if (row.length === 1) {
            const item = row[0];
            this.form.errorType = item.errorCauseType * 1 === 0 ? 0 : (item.errorCauseType * 1 || 0);
            this.form.processDate = item.processDate || moment(date).format('YYYY-MM-DD HH:mm:ss');
            this.form.errorCauseMethod = item.errorCauseMethod;
            this.form.errorCauseMsg = item.errorCauseMsg;
            this.form.errorCauseUserName = item.errorCauseUserName || localStorage.getItem('username');
        }
    },
    handleClose() {
      this.dialogVisible = false;
      this.form = {
          ids: [],
          errorType: 0,
          processDate: '',
          errorCauseMethod: '',
          errorCauseMsg: '',
          errorCauseUserName: '',
      }
    },
    handleSubmit() {
        this.form.processDate = moment(this.form.processDate).format('YYYY-MM-DD HH:mm:ss');
        this.disabled = true;
        batchHandleException(this.form).then(res => {
            if (res.code) {
                this.$message.success(this.$t('common.success'));
                this.dialogVisible = false;
                this.$emit('refresh');
            } else {
                this.$message.error(res.message);
            }
        }).finally(() => {
            this.disabled = false;
        });
    }
  }
}
</script>
