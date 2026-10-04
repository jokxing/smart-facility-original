<template>
  <div :class="{ 'adaptationScreen': isAdaptationScreen }" style="height: 100%;position: relative;" v-loading="abnormalLoading" element-loading-background="rgba(122, 122, 122, 0.2)">
    <div class="btn type-btn">
      <el-select popper-class="alarm-select" v-model="sensorType" :placeholder="$t('common.placeholder')" @change="abnormalTab">
        <el-option
          v-for="item in abnormalBtn"
          :key="item.sensorId"
          :label="item.sensorName"
          :value="item.sensorId">
        </el-option>
      </el-select>
      <!-- <el-button
          v-for="item in abnormalBtn"
          :class="{ 'active': sensorType == item.sensorId }"
          :key="item.sensorId"
          @click="abnormalTab(item.sensorId)">{{ item.sensorName }}
      </el-button> -->
    </div>
    <div class="btn date-btn">
      <el-tooltip v-if="isDemo" content="演示统计基准：2026-09-24（UTC+8）；自定义按所选日期查询" placement="top"><span style="font-size:14px;margin-right:8px;color:#8daed0;cursor:help" aria-label="演示统计日期说明">ⓘ</span></el-tooltip>
      <el-button
          v-for="item in dateBtn"
          :class="{ 'active': dateActive == item.value }"
          :key="item.value"
          @click="handleAbnormalDate(item.value)">{{ item.text }}
      </el-button>
      <el-button
          class="custom"
          :class="{ 'active': dateActive == -1 }">
          {{ $t('common.custom') }}
        <el-date-picker
            @change="dateChenge"
            v-model="dateDay"
            :picker-options="pickerOptions"
            align="right"
            type="datetimerange"
            :range-separator="$t('common.most')"
            :start-placeholder="$t('common.startDate')"
            :end-placeholder="$t('common.endDate')"
            :value-format="isDemo ? 'yyyy-MM-dd HH:mm:ss' : 'yyyy-MM-dd hh:mm:ss'">
        </el-date-picker>
      </el-button>
    </div>
    <ve-histogram class="alarm-histogram" :data="chartData" :extend="extend" :height="height"></ve-histogram>
  </div>
</template>

<script>
import VeHistogram from 'v-charts/lib/histogram.common'
import moment from "moment";
import {demoAlarmRange} from '@/mock/clock';
const isDemo = process.env.VUE_APP_DEMO === 'true';
import echarts from 'echarts'
import {postAlarmThingSensorsStatistics, postAlarmThingStatistics} from "@/api/dataV";

export default {
  props: ['type'],
  components: {
    VeHistogram,
  },
  data() {
    var _this = this;
    return {
      isAdaptationScreen: false,
      // 报警统计排行
      dateActive: 3,
      isDemo,
      dateBtn: [
        {
          text: _this.$t('common.day3'),
          value: 1
        },
        {
          text: _this.$t('common.week1'),
          value: 2
        },
        {
          text: _this.$t('common.month1'),
          value: 3
        },
      ],
      beginDate: isDemo ? demoAlarmRange(30).beginDate : moment(new Date().getTime() - 2592000000).format("YYYY-MM-DD") + " 00:00:00",
      endDate: isDemo ? demoAlarmRange(30).endDate : moment(new Date()).format("YYYY-MM-DD hh:mm:ss"),
      abnormalLoading: true,
      sensorType: 0,
      height: "103%",
      extend: {
        xAxis: {
          data: [],
          // axisLabel: {
          //   show: true,
          //   textStyle: {
          //     color: "#7993D3",
          //     fontSize: screen.width > 1550 ? 12 : screen.width < 1300 ? 8 : 10
          //   },
          //   interval: 0
          // },
          // axisLabel: {
          //   show: true,
          //   interval: 0,
          //   rotate: 15,
          //   textStyle: {
          //     color: "#7993D3",
          //     fontSize: 10
          //   }
          // }
          axisLabel: {
            show: true,
            color: '#7993D3',
            interval: 0,
            formatter: function(params) {
              var newParamsName = ""; // 最终拼接成的字符串
              var paramsNameNumber = params.length; // 实际标签的个数
              var provideNumber = 5; // 每行能显示的字的个数
              if(screen.width < 1550){
                provideNumber = 4
              };
              var rowNumber = Math.ceil(paramsNameNumber / provideNumber); // 换行的话，需要显示几行，向上取整
              /**
               * 判断标签的个数是否大于规定的个数， 如果大于，则进行换行处理 如果不大于，即等于或小于，就返回原标签
               */
              if (paramsNameNumber > provideNumber) {
                for (var p = 0; p < rowNumber; p++) {
                  var tempStr = ""; // 表示每一次截取的字符串
                  var start = p * provideNumber; // 开始截取的位置
                  var end = start + provideNumber; // 结束截取的位置
                  // 此处特殊处理最后一行的索引值
                  if (p == rowNumber - 1) {
                    // 最后一次不换行
                    tempStr = params.substring(start, paramsNameNumber);
                  } else {
                    // 每一次拼接字符串并换行
                    tempStr = params.substring(start, end) + "\n";
                  }
                  newParamsName += tempStr; // 最终拼成的字符串
                }
              } else {
                // 将旧标签的值赋给新标签
                newParamsName = params;
              }
              //将最终的字符串返回
              return newParamsName;
            }
          },
        },
        tooltip: {
					trigger: 'item', //item数据项图形触发，主要在散点图，饼图等无类目轴的图表中使用。
					axisPointer: {
						// 坐标轴指示器，坐标轴触发有效
						type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
					},
					formatter: '{b}<br/>'+ _this.$t('dataV.alarmSum') +'： {c}'
        },
        yAxis: {
          axisLabel: {
            show: true,
            textStyle: {
              color: "#7993D3",
              fontSize: screen.width < 1300 ? 10 : 14
            }
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: ['#1A367D'],
              width: 1,
              type: 'solid'
            }
          }
        },
        series: [
          {
            barWidth: screen.width < 1300 ? 14 : 20,
            data: [],
            type: 'bar',
            itemStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(
                    0, 0, 0, 1,
                    [
                      {offset: 0, color: '#00C0FA'},
                      {offset: 1, color: '#015EEA'}
                    ]
                )
              }
            },
          }
        ],
      },
      chartData: {},
      abnormalBtn: [],
      dateDay: "",
      duration: [],
      pickerOptions: {
        disabledDate(time) {
          let currentTime = _this.duration[0]
          let threeMonths = 60 * 60 * 1000 * 24 * 90
          if (currentTime) {
            var endTime = currentTime.getTime() + threeMonths
            if (endTime > new Date().getTime()) {
              endTime = new Date().getTime()
            }
            return time.getTime() > endTime || time.getTime() < currentTime.getTime() - threeMonths
          }
          return time.getTime() > Date.now();
        },
        onPick({minDate, maxDate}) {
          // 当第一时间选中才设置禁用
          if (minDate && !maxDate) {
            _this.duration[0] = minDate
          }
          if (maxDate) {
            _this.duration[1] = maxDate
          }
        }
      },
    }
  },
  mounted() {
    if(screen.width < 1300){
      this.height = "115%"
    };

    this.sensorsStatistics();
    this.alarmThingStatistics()
  },
  methods: {
    // 探头
    sensorsStatistics() {
      this.sensorType = 0;
      var data = {
        thingsType: this.type,
        beginDate: this.beginDate,
        endDate: this.endDate
      }
      postAlarmThingSensorsStatistics(data).then(res => {
        if (res.code === 1) {
          this.abnormalBtn = [
            {
              sensorId: 0,
              sensorName: this.$t('common.all')
            }
          ]
          for (var i = 0; i < res.items.sensors.length; i++) {
            if (res.items.sensors[i].sensorName) {
              this.abnormalBtn.push(res.items.sensors[i])
            }
          }
        }
      })
    },
    // 列表
    alarmThingStatistics() {
      var data = {
        thingsType: this.type,
        sensorType: this.sensorType,
        beginDate: this.beginDate,
        endDate: this.endDate
      }
      this.extend.xAxis.data = [];
      this.extend.series[0].data = [];
      postAlarmThingStatistics(data).then(res => {
        this.abnormalLoading = false;
        if (res.code === 1) {
          if (res.items.alarmStatistics) {
            for (var i = 0; i < res.items.alarmStatistics.length; i++) {
              this.extend.xAxis.data.push(res.items.alarmStatistics[i].thingsName);
              this.extend.series[0].data.push(res.items.alarmStatistics[i].alarmCount)
            }
          }
        }
      })
    },
    // 选择日期
    handleAbnormalDate(val) {
      this.dateActive = val;
      this.dateDay = [];
      if (val === 1) {
        this.beginDate = moment(new Date().getTime() - 86400000).format("YYYY-MM-DD") + " 00:00:00"
      }
      if (val === 2) {
        this.beginDate = moment(new Date().getTime() - 86400000 * 7).format("YYYY-MM-DD") + " 00:00:00"
      }
      if (val === 3) {
        this.beginDate = moment(new Date().getTime() - 2592000000).format("YYYY-MM-DD") + " 00:00:00"
      }
      this.endDate = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");
      if (isDemo) Object.assign(this, demoAlarmRange({1: 1, 2: 7, 3: 30}[val] || 30));
      this.sensorsStatistics();
      this.alarmThingStatistics()
    },
    // 自定义
    dateChenge(e) {
      if (e) {
        this.dateActive = -1;
        this.beginDate = e[0];
        this.endDate = e[1];
        this.sensorsStatistics();
        this.alarmThingStatistics()
      }
    },
    // 选择硬件类型
    abnormalTab(index) {
      this.sensorType = index;
      this.extend.xAxis.data = [];
      this.extend.series[0].data = [];
      this.abnormalLoading = true;
      this.alarmThingStatistics()
    }
  },
}
</script>

<style lang="less" scoped>
  .adaptationScreen{
    .alarm-histogram{
      top: -14px;
    }
  }
</style>

