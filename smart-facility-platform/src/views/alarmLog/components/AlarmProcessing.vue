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
            class="select-change-p"
            :placeholder="$t('common.placeholder')">
          <el-option
              v-for="item in alarmTypes"
              :key="item.id"
              :label="item.name"
              :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('hardware.disposeTime')" required>
        <el-date-picker
            v-model="form.processDate"
            class="select-change-p"
            default-time="12:00:00"
            :placeholder="$t('common.selectTime')"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss">
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
import {DEMO_NOW_MS, formatDemoDateTime} from "@/mock/clock";

const isDemo = process.env.VUE_APP_DEMO === "true";

function defaultProcessDate() {
  return isDemo ? formatDemoDateTime(DEMO_NOW_MS) : moment().format('YYYY-MM-DD HH:mm:ss');
}

function emptyForm() {
  return {
    ids: [],
    errorType: null,
    processDate: '',
    errorCauseMethod: '',
    errorCauseMsg: '',
    errorCauseUserName: '',
  };
}

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
      form: emptyForm(),
      ids: [],
      alarmTypes: [],
      process: null,
      disabled: false
    }
  },
  methods: {
    open(row) {
        const rows = Array.isArray(row) ? row : [];
        if (!rows.length) {
            this.$message.error(this.$t('common.placeholder'));
            return;
        }
        this.dialogVisible = true;
        this.form = emptyForm();
        this.form.ids = rows.map(item => item.id);
        this.form.errorCauseUserName = localStorage.getItem('username') || '';
        this.form.processDate = defaultProcessDate();
        this.form.errorType = null;
        this.form.errorCauseMethod = '';
        this.form.errorCauseMsg = '';
        getAlarmErrorList().then(res => {
            if (res.code) {
                this.alarmTypes = res.items.list;
                if (this.form.errorType == null && this.alarmTypes.length) {
                    this.form.errorType = this.alarmTypes[0].id;
                }
            }
        });
        if (rows.length === 1) {
            const item = rows[0];
            const typed = item.errorCauseType == null ? null : Number(item.errorCauseType);
            if (typed && typed > 0) this.form.errorType = typed;
            if (item.processDate) this.form.processDate = item.processDate;
            this.form.errorCauseMethod = item.errorCauseMethod || '';
            this.form.errorCauseMsg = item.errorCauseMsg || '';
            this.form.errorCauseUserName = item.errorCauseUserName || localStorage.getItem('username') || '';
        }
    },
    handleClose() {
      this.dialogVisible = false;
      this.form = emptyForm();
    },
    handleSubmit() {
        if (!this.form.ids.length) {
            this.$message.error(this.$t('common.placeholder'));
            return;
        }
        if (this.form.errorType == null || this.form.errorType === '') {
            this.$message.error(this.$t('common.placeholder'));
            return;
        }
        if (!this.form.processDate) {
            this.$message.error(this.$t('common.selectTime'));
            return;
        }
        const processDate = moment(this.form.processDate, 'YYYY-MM-DD HH:mm:ss', true);
        if (!processDate.isValid()) {
            this.$message.error(this.$t('common.selectTime'));
            return;
        }
        const payload = {
            ...this.form,
            errorType: Number(this.form.errorType),
            processDate: processDate.format('YYYY-MM-DD HH:mm:ss')
        };
        this.disabled = true;
        batchHandleException(payload).then(res => {
            if (res.code) {
                this.$message.success(this.$t('common.success'));
                this.dialogVisible = false;
                this.form = emptyForm();
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
