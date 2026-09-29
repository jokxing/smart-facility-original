<template>
  <el-dialog
      :before-close="handleClose"
      :close-on-click-modal="false"
      :title="title"
      :visible.sync="dialogVisible"
      append-to-body
      >
    <el-form v-model="time" label-position="left" label-width="auto">
      <el-form-item :label="$t('common.timeFrom')">
        <el-date-picker
            v-model="dataArray"
            :clearable="false"
            :picker-options="pickerOptions"
            unlink-panels
            :end-placeholder="$t('common.endDate')"
            :range-separator="$t('common.most')"
            :start-placeholder="$t('common.startDate')"
            type="datetimerange"
            @change="pickerChangeFn">
        </el-date-picker>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">{{ $t('common.cancel') }}</el-button>
      <el-button type="primary" @click="handleSubmit()">{{ $t('common.confirm') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import DateTimeSelect from "@c/DateTimeSelect"

export default {
  name: "index",
  components: {
    DateTimeSelect
  },
  data() {
    const _this = this;
    return {
      title: _this.$t('common.selectTime'),
      dialogVisible: false,
      time: {},
      dataArray: [],
      pickerOptions: {
        disabledDate(time) {
            if (time &&  _this.dataArray.length) {
                const currentTime = _this.dataArray[0];
                const threeMonths = 60 * 60 * 1000 * 24 * 90;
                if (currentTime) {
                    return time.getTime() > currentTime.getTime() + threeMonths || time.getTime() < currentTime.getTime() - threeMonths;
                }
            }
        },
        onPick({minDate, maxDate}) {
          // 当第一时间选中才设置禁用
          if (minDate && !maxDate && _this.dataArray) {
            _this.$set(_this.dataArray, 0, minDate);
          }
          if (maxDate &&  _this.dataArray) {
            _this.$set(_this.dataArray, 1, maxDate);
          }
        },
      },

    }
  },
  methods: {
    pickerChangeFn(value) {
      if (!value) {
        this.dataArray = [];
      }
    },
    handleClose() {
      this.dialogVisible = !this.dialogVisible;
      this.dataArray = [];
      this.time = {
        start: "",
        end: ""
      };
    },
    handleSubmit() {
      this.$emit("handle", this.dataArray);
      this.handleClose();
    },
    open() {
      this.dataArray = [];
      this.dialogVisible = !this.dialogVisible;
    },
    handleTime(data) {
      this.dataArray = data;
    }
  }
}
</script>
