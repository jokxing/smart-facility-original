<template>
  <el-dialog
      :before-close="handleClose"
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="dialogVisible"
      append-to-body>
    <el-form v-model="form" label-position="left" label-width="auto">
      <el-form-item :label="$t('hardware.thisDetectDate')">
        <el-date-picker
            v-model="form.detectDate"
            class="select-change-p"
            :placeholder="$t('common.selectTime')"
            type="datetime">
        </el-date-picker>
      </el-form-item>
      <el-form-item :label="$t('hardware.nextDetectDate')">
        <el-date-picker
            v-model="form.nextDetectDate"
            class="select-change-p"
            :placeholder="$t('common.selectTime')"
            :picker-options="pickerOptions"
            type="datetime">
        </el-date-picker>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">{{ $t('common.cancel') }}</el-button>
      <el-button type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import {updateDetect} from "@/api/detect"
import {TIME_FORMAT} from "@/utils/constant";
import moment from "moment";
import DateTimeSelect from "@c/DateTimeSelect/index";

export default {
  name: "Edit",
  components:{
    DateTimeSelect
  },
  data() {
      const _this = this;
    return {
      form: {
        detectDate: "",
        nextDetectDate: "",
        detectId: ""
      },
      dialogVisible: false,
      title: _this.$t('hardware.fixNextDetectDate'),
      type: 0,
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7;
        }
      }
    }
  },
  methods: {
    handleSubmit() {
      this.form.detectDate = moment(this.form.detectDate).format(TIME_FORMAT);
      this.form.nextDetectDate = moment(this.form.nextDetectDate).format(TIME_FORMAT);
      updateDetect(this.form).then(res => {
        this.handleMessage(res);
      })
    },
    handleMessage(res) {
      if (res.code) {
        this.handleClose();
        this.$emit("handle");
        this.$message.success(this.$t('common.editSuccess'));
      } else {
        this.$message.error(res.message);
      }
    },
    handleClose() {
      this.form = {
        detectDate: "",
        nextDetectDate: "",
        detectId: ""
      };
      this.dialogVisible = false;
    },
    open(row, type) {
      this.dialogVisible = true;
      this.type = type;
      if (!type) {
        this.form.detectDate = row.detectDate;
        this.form.nextDetectDate = row.nextDetectDate || "";
        this.form.detectId = row.detectId;
      } else {

      }
    }
  }
};
</script>
