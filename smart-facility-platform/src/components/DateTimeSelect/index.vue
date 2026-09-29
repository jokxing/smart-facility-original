<template>
  <div class="dateTime-select">
    <el-date-picker
        v-model="startDate"
        :clearable="false"
        :disabled="startDisabled"
        :picker-options=" isDateOptions ? dateOptions : ''"
        :placeholder="$t('labDevice.selectDate')"
        type="date"
        @change="handleChange">
    </el-date-picker>
    <el-time-select
        v-model="starTime"
        :clearable="false"
        :disabled="startDisabled"
        :picker-options="pickerOptions"
        :placeholder="$t('common.selectTime1')"
        @change="handleChange">
    </el-time-select>
    <span v-if="isShow">—</span>
    <el-date-picker
        v-model="endDate"
        v-if="isShow"
        :class="{ red: isRed }"
        :clearable="false"
        :picker-options="isDateOptions ? dateOptions : ''"
        :placeholder="$t('labDevice.selectDate')"
        type="date"
        @change="handleChange">
    </el-date-picker>
    <el-time-select
        v-if="isShow"
        v-model="endTime"
        :clearable="false"
        :picker-options="pickerOptions"
        :placeholder="$t('common.selectTime1')"
        @change="handleChange">
    </el-time-select>
  </div>
</template>

<script>
import moment from "moment";

export default {
  props: {
    dateTime: {
      type: Object,
      default: {}
    },
    startDisabled: {
      type: Boolean,
      default: false
    },
    // 是否禁用今天之前的时间
    isDateOptions: {
      type: Boolean,
      default: true
    },
    // false：单个时间日期选择 ；true: 开始至结束后
    isShow: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      startDate: "",
      starTime: "",
      endDate: "",
      endTime: "",
      dateOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7;
        },
      },
      pickerOptions: {
        start: '00:00',
        step: '00:15',
        end: '23:30'
      },
      isRed: false
    }
  },
  mounted() {
    var myGetTime = new Date().getTime();
    this.startDate = moment(this.dateTime.start).format('YYYY-MM-DD');
    this.endDate = moment(this.dateTime.end).format('YYYY-MM-DD');
    // 判断是否有时分秒，是的话把它格式化然后显示，否的话默认赋值
    if(this.dateTime.start){
      if (this.dateTime.start.indexOf(":") === -1) {

          if (!this.isToday(this.dateTime.start)) {
              this.starTime = "00:00";
              this.endTime = "23:59"
              return;
          }
          const minutes = moment(myGetTime).format('mm');
          let difference = 0;
          if (minutes >0 && minutes <= 15) {
              difference = 15 - minutes;
          } else if (minutes > 15 && minutes <= 30) {
              difference = 30 - minutes;
          } else if (minutes > 30 && minutes <= 45) {
              difference = 45 - minutes;
          } else if (minutes > 45 && minutes <= 60) {
              difference = 60 - minutes;
          }
        this.starTime = moment(myGetTime + difference * 60 * 1000).format('HH:mm');
        this.endTime = "23:59"
      } else {
        this.starTime = moment(this.dateTime.start).format('HH:mm');
        this.endTime = moment(this.dateTime.end).format('HH:mm');
      }
    }
  },
  methods: {
      // 判断选择的时间是否为今天
      isToday(date) {
          const today = new Date();
          const year = today.getFullYear().toString();
          const month = (today.getMonth() + 1).toString();
          const day = today.getDate().toString();
          const arr = date.split("-");
          return arr[0] * 1 === year * 1 && arr[1] * 1 === month * 1 && arr[2] * 1 === day * 1;
      },
    handleChange() {
      // 判断开始日期是否大于结束日期
      var startDate = moment(this.startDate).format('YYYY-MM-DD');
      var endDate = moment(this.endDate).format('YYYY-MM-DD');
      if (startDate > endDate) {
        this.isRed = true;
      } else {
        this.isRed = false
      }
      // 如果开始时间大于结束时间，自动把开始时间+1小时给结束时间赋值
      var starTime = new Date(startDate + " " + this.starTime).getTime();
      var endTime = new Date(endDate + " " + this.endTime).getTime();
      if (startDate == endDate) {
        if (starTime >= endTime) {
          var updataEndTime = starTime + 60 * 60 * 1000;
          this.endTime = moment(updataEndTime).format("HH:mm")
        }
      }
      var data = [startDate + " " + this.starTime, endDate + " " + this.endTime];
      this.$emit("getDateTime", data)
    }
  },
}
</script>

<style lang="less" scoped>
.dateTime-select {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  /deep/ .el-date-editor--date {
    width: 124px !important;

    .el-input__inner {
      text-align: center;

      &::-webkit-input-placeholder {
        font-size: 12px;
      }
    }
  }

  /deep/ .el-date-editor--time-select {
    width: 92px !important;

    .el-input__inner {
      text-align: center;

      &::-webkit-input-placeholder {
        font-size: 12px;
      }
    }
  }

  /deep/ .el-input--prefix .el-input__inner {
    padding-left: 10px;
  }

  /deep/ .el-input--suffix .el-input__inner {
    padding-right: 10px;
  }

  /deep/ .el-input--medium .el-input__icon {
    display: none;
  }

  .red {
    /deep/ .el-input__inner {
      border-color: red;
      color: red;
    }
  }
}
</style>
