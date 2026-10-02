<!--使用率高级查询-->
<template>
  <el-dialog
    :title="$t('labDevice.highSearch')"
    append-to-body
    :before-close="handleClose"
    :close-on-click-modal="false"
    width="23%"
    :visible.sync="dialogFormVisible">
    <el-form :model="form">
      <el-form-item :label="$t('labDevice.timeType')">
        <el-select class="w215" v-model="form.periodType">
          <el-option :value="1" :label="$t('common.workday')"></el-option>
          <el-option :value="2" :label="$t('common.naturalDay')"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('labDevice.timePeriod')">
        <div class="flex">
          <el-select class="w100" v-model="form.periodBeginTime">
            <el-option v-for="item in hours24" :key="'b-' + item" :value="item" :label="item"></el-option>
          </el-select>
          <span class="mg">{{ $t('common.most') }}</span>
          <el-select class="w100" v-model="form.periodEndTime">
            <el-option v-for="item in reverseHours" :key="'e-' + item" :value="item" :label="item"></el-option>
          </el-select>
        </div>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogFormVisible = false">{{ $t('common.cancel') }}</el-button>
      <el-button type="primary" @click="onsubmit">{{ $t('common.confirm') }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
import {
  formatStatisticHourOption,
  validateStatisticHourParams
} from '@/utils/statisticRangeValidate';

function buildHourOptions() {
  const hours = [];
  for (let i = 0; i <= 23; i++) {
    hours.push(formatStatisticHourOption(i, '00'));
  }
  return hours;
}

export default {
  name: "index",
  data() {
    return {
      dialogFormVisible: false,
      form: {
        periodType: 1,
        periodBeginTime: "00",
        periodEndTime: "23"
      },
      hours24: [],
      reverseHours: []
    }
  },
  methods: {
    handleClose() {
      this.dialogFormVisible = false;
    },
    open(obj = {}) {
      this.hours24 = buildHourOptions();
      this.reverseHours = this.hours24.slice().reverse();
      const periodType = Number(obj.type);
      this.form = {
        periodType: periodType === 2 ? 2 : 1,
        periodBeginTime: formatStatisticHourOption(obj.start, '00'),
        periodEndTime: formatStatisticHourOption(obj.end, '23')
      };
      this.dialogFormVisible = true;
    },
    onsubmit() {
      const periodBeginTime = formatStatisticHourOption(this.form.periodBeginTime, '00');
      const periodEndTime = formatStatisticHourOption(this.form.periodEndTime, '23');
      const check = validateStatisticHourParams({periodBeginTime, periodEndTime});
      if (!check.ok) {
        this.$message.error(check.message);
        return;
      }
      this.form.periodBeginTime = periodBeginTime;
      this.form.periodEndTime = periodEndTime;
      this.handleClose();
      this.$emit("handle", {
        periodType: this.form.periodType,
        periodBeginTime,
        periodEndTime
      });
    }
  }
}
</script>
<style lang="less" scoped>
.w100 {
  width: 90px !important;
}
.w215 {
  width: 215px;
}
.mg {
  margin: 0 10px;
}
</style>
