<template>
  <div class="device-chart">
    <div class="session">
      <div class="search-bar-container">
        <div>
          <el-button type="text" @click="handleAddDevice">{{ $t('statistics.addMDevice') }} <i>></i></el-button>
          <el-button @click="handleBatchDelete">{{ $t('statistics.moveDevice') }}</el-button>
        </div>
      </div>
      <el-radio-group v-model="tabPosition" style="margin-bottom: 30px;" @change="handleChangeList">
        <el-radio-button :disabled="dataCharts.loading || tableLoading" :label="item.id" :key="item.id" v-for="item in repertoireList">
          <div class="top-right" @click.stop.prevent="handleDelete(item.id, item.name)">+</div>
          {{ item.name }}
        </el-radio-button>
      </el-radio-group>
      <el-table
          :data="list"
          :row-key="getRowKey"
          v-loading="tableLoading"
          max-height="400px"
          border
          @selection-change="handleSelectionChange">
        <el-table-column
            type="selection"
            width="55">
        </el-table-column>
        <el-table-column fixed label="#" type="index" width="70px"/>
        <el-table-column fixed :label="$t('common.name')" min-width="130" prop="name">
          <template v-slot="scope">
            <a @click="handleShowDrawer(scope.row)">
              {{ scope.row.equipmentName }}
            </a>
          </template>
        </el-table-column>
        <el-table-column fixed :label="$t('labDevice.labDeviceNo')" min-width="120" prop="no">
          <template v-slot="scope">
            <a @click="handleShowDrawer(scope.row)">
              {{ scope.row.equipmentNo }}
            </a>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.owningDepartment')" min-width="120" prop="departmentName"/>
        <el-table-column :label="$t('common.creatDate')" min-width="130" prop="createDate">
            <template v-slot="{row}">
                {{ row.createDate | localToUtc }}
            </template>
        </el-table-column>
        <el-table-column :label="$t('common.handle')" width="100px">
          <template v-slot="scope">
            <el-button type="text" @click="handleDeleteEquipment(scope.row.id)">{{ $t('statistics.move') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="session">
      <div class="clearfix">
        <div>{{ $t('hardware.monitorMessage') }}</div>
        <el-form>
          <el-form-item :label="$t('statistics.dataInt')" label-width="100px">
            <el-select
                v-model="historyTimeInterval"
                :disabled="dataCharts.loading || sensors.length == 0"
                class="select-change1 margin-small-right"
                filterable
                @change="handleHistoryCharts"
                :placeholder="$t('common.placeholder')">
              <el-option
                  v-for="(item) in timeInterval"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div class="charts-type margin-center">
        <div>
          <template v-for="(item, index) in sensors">
            <el-button
                :key="index"
                :class="index === active && 'is-active'"
                :disabled="dataCharts.loading || sensors.length == 0"
                @click="handleCutSensor(index, item)">
              {{ item.name }}
            </el-button>
          </template>
        </div>
        <div>
          <el-button
              v-for="item in dimensions"
              :key="item.INTERVAL"
              :class="interval === item.INTERVAL && 'is-active'"
              :disabled="dataCharts.loading || sensors.length == 0"
              @click="handleCutTime(item.INTERVAL)">
            {{ item.LABEL }}
          </el-button>
          <el-button :disabled="dataCharts.loading || sensors.length == 0" @click="handleCustomTime">{{ $t('common.custom') }}</el-button>
          <el-button :disabled="dataCharts.loading || sensors.length == 0" class="el-icon-refresh" @click="handleUpdate"/>
        </div>
      </div>
      <div v-loading="dataCharts.loading" :element-loading-text="$t('statistics.loading')">
        <div ref="main" v-loading="dataCharts.loading" v-if="option.series.length" class="main"></div>
        <el-empty v-else :description="$t('statistics.notData')"></el-empty>
      </div>

    </div>

    <CustomTime ref="CustomTime" @handle="handleGetTime"/>
    <SeeHistoryData :type="1" ref="SeeHistoryData"/>
    <Drawer :id.sync="deviceId" :hideSensorsTypes="[17,1001]" :isDrawer.sync="isDrawer"/>
    <device-list ref="DeviceList" @handle="handleRepertoireList"/>
  </div>
</template>

<script>
import * as echarts from "echarts";
import DeviceList from "@/views/deviceChart/components/DeviceList";
import {
  getListEquipment,
  getRepertoireBatchEquipment,
  getRepertoireDelete,
  getRepertoireEquipment,
  getRepertoireList
} from "@/api/statistic";
import {arrayToHeavy} from "@/utils/methods";
import LineMarkChart from "@c/LineMarkChart/index";
import SeeHistoryData from "@/views/device/components/SeeHistoryData";
import CustomTime from "@c/CustomTime/index";
import {getHistoryDeviceChart} from "@/api/device";
import {DEVICE_ID, historyTimeInterval, TIME_FORMAT} from "@/utils/constant";
import moment from "moment";

export default {
  name: "DeviceChart",
  components: {
    DeviceList,
    Drawer: () => import("@/views/device/components/DeviceDrawerNew"),
    LineMarkChart,
    SeeHistoryData,
    CustomTime
  },
  data() {
      const _this = this;
    return {
      chart: null,
      tabPosition: "top",
      list: [],
      repertoireList: [],
      items: {},
      total: 0,
      multipleSelection: [],
      isDrawer: false,
      deviceId: "",
      sensors: [],
      tableLoading: false,
      productId: null,
      historyTimeInterval: 1,
      timeInterval: historyTimeInterval,
      option: {},
      dataCharts: {
        columns: ["createDate", "data"],
        rows: [],
        loading: false,
        name: "",
        unit: "",
        type: null,
        max: null,
        min: null,
      },
      interval: 4,
      active: 0,
      dimensions: [
        {INTERVAL: 4, LABEL: _this.$t('common.day2')},
        {INTERVAL: 5, LABEL: _this.$t('common.week')},
        {INTERVAL: 6, LABEL: _this.$t('common.month')},
      ]
    }
  },
  created() {
    const _this = this;
    this.option = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        show: true,
        top: "6%"
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '5%',
        top: '25%',
        containLabel: true
      },
      toolbox: {
        feature: {
            dataZoom: {yAxisIndex: "none",title: {zoom: _this.$t('other.zoom'), back: _this.$t('other.back')}},
            dataView: {readOnly: true,title: _this.$t('other.dataView'),lang: [_this.$t('other.dataView'),_this.$t('common.close')]},
            magicType: {type: ["line", "bar"],title:{line: _this.$t('other.line'),bar:_this.$t('other.bar')}},
            restore: {title: _this.$t('other.restore')},
            saveAsImage: {title: _this.$t('other.saveAsImage')}
        }
      },
      dataZoom: [
        {
          type: 'slider',
          startValue: '',
          xAxisIndex: [0],
          realtime: true,
          start: 0,
          end: 100,
        }, {
          type: 'inside',
          xAxisIndex: [0],
          start: 0,
          zoomOnMouseWheel: 'ctrl',
          moveOnMouseMove: 'ctrl',
          moveOnMouseWheel: 'alt', //滚动平移
          end: 100,
        }
      ],
      xAxis: {
        type: 'category',
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: function (value) {
            return value + _this.dataCharts.unit;
          }
        },
        max:function (value) {
          if (value.max > 0) {
            return (value.max *(1 + 0.2)).toFixed(2);
          }
          return 0;
        }
      },
      series: []
    };
  },
  watch: {
    option: {
      handler(newVal, oldVal) {
        if (this.chart) {
          if (newVal) {
            this.chart.setOption(newVal);
          } else {
            this.chart.setOption(oldVal);
          }
        } else {
          this.initEcharts();
        }
      },
      deep: true,
    },
  },
  mounted() {
    this.handleRepertoireList();
  },
  updated() {
    this.initEcharts();
  },
  beforeDestroy() {
    if (!this.chart) {
      return;
    }
    window.removeEventListener("resize", this.resize);
    this.chart.dispose();
    this.chart = null;
  },
  methods: {
    resize() {
      this.chart.resize();
    },
    initEcharts() {
      if (!this.$refs.main) {
        return;
      }
      this.$nextTick(() => {
        this.chart = echarts.init(this.$refs.main);
        this.chart.setOption(this.option);
        window.addEventListener("resize", this.resize);
      })
    },
    handleGetTime(val) {
      this.interval = null;
      this.dataCharts.rows = [];
      this.beginTime = moment(val[0]).format(TIME_FORMAT);
      this.endTime = moment(val[1]).format(TIME_FORMAT);
      if (this.sensors.length === 0) {
        return this.$message.error(this.$t('statistics.notSensor'));
      }
      this.handleHistoryCharts();
    },
    handleCutTime(index) {
      this.interval = index;
      this.endTime = this.beginTime = "";
      if (this.sensors.length === 0) {
        return this.$message.error(this.$t('statistics.notSensor'));
      }
      this.dataCharts.rows = [];
      this.handleHistoryCharts();
    },
    handleCustomTime() {
      this.$refs.CustomTime.open();
    },
    handleUpdate() {
      this.interval = 4;
      this.active = 0;
      this.handleHistoryCharts();
    },
    handleCutSensor(index, item) {
      const {type} = item;
      this.active = index;
      this.dataCharts.type = type;
      this.dataCharts.unit = this.sensors[index].unit;
      this.handleHistoryCharts();
    },
    handleHistoryCharts() {
      this.dataCharts.loading = true;
      this.option.xAxis.data = [];
      this.option.series = [];
      let time = []; // 时间集合
      const idx = this.sensors[this.active].idx; // 下标索引
      let countor = 0; // 请求成功的数量
      let seriesArr = []; // 请求后的图表数据
      const requestArr = this.handleRequestList();
      requestArr.map(item => {
        getHistoryDeviceChart({
          deviceId: item.deviceId,
          idx: item.idx,
          beginTime: this.beginTime,
          createDate: this.createDate,
          endTime: this.endTime,
          interval: this.interval,
          historyTimeInterval: this.historyTimeInterval,
          type: 1,
          thingsType: null,
          thingsId: ""
        }).then(res => {
          countor ++;
          if (res.code) {
            let data = [];
            res.items.list.map(resItem => {
              const time1 = resItem.createDate.split(":")[0]+ ":" + resItem.createDate.split(":")[1];
              const second = ":00";
              const createDate = time1 + second;
              time.push(createDate);
              data.push([createDate,resItem.data]);
            })
            if (data.length > 0) {
                const _this = this;
              const markLine = {
                data: [
                    {
                    yAxis: item.min,
                    name: _this.$t('hardware.lowerLimit'),
                    // name: item.deviceName + '下限值',
                    label: {
                      show: true,
                      position: "middle",
                      formatter: "{b}:{c}"
                    },
                  },
                  {
                    yAxis: item.max,
                    name: _this.$t('hardware.UpperLimit'),
                    // name: item.deviceName + '上限值',
                    label: {
                      show: true,
                      position: "middle",
                      formatter: "{b}:{c}"
                    },
                  },
                ]
              };
              const obj = {name: item.deviceName, type: 'line', data, markLine}
              seriesArr.push(obj);
            }
          } else {
            this.$message.error(res.message);
          }
          if (countor == requestArr.length) {
            // 合并时间，并做排序
            const setArr = [...new Set(time)];
            this.option.xAxis.data = setArr.sort((a, b) => (a > b ? 1 : -1));
            this.option.series = seriesArr;
            this.dataCharts.loading = false;
          }
        }).catch(e => {
          this.dataCharts.loading = false;
          this.$message.error(e);
        });
      })
    },
    handleRequestList() {
      let array = [];
      for (let i = 0; i < this.list.length; i++) {
        const device = this.list[i];
        let index = 0;
        let deviceName = device.equipmentName;
        for (let j = 0; j < device.sensors.length; j++) {
          const sensorObj = device.sensors[j];
          if (this.dataCharts.type == sensorObj.type) {
            index ++;
            if (index === 2) {
              deviceName = device.equipmentName + sensorObj.sensorType.name + index;
            }
            array.push({deviceName, deviceId: device.equipmentId, idx: sensorObj.idx, min: sensorObj.min, max: sensorObj.max})
          }
        }
      }
      return array;
    },
    handleBatchDelete() {
      if (!this.multipleSelection.length) {
        return this.$message.error(this.$t('statistics.notDevice'));
      }
      this.$confirm(this.$t('statistics.moveDevice1'), this.$t('common.hint'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: "warning"
      }).then(() => {
        getRepertoireBatchEquipment({ids: this.multipleSelection}).then(res => {
          if (res.code) {
            this.$message.success(res.message);
            this.handleRepertoireList();
          } else {
            this.$message.error(res.message);
          }
        })
      })
    },
    handleChangeList(e) {
      this.active = 0;
      this.option.series = [];
      this.sensors = [];
      this.list = [];
      this.handleListEquipment(e);
    },
    // 请求清单列表
    handleRepertoireList() {
      getRepertoireList().then(res => {
        if (res.code) {
          this.repertoireList = res.items;
          if (!this.repertoireList.length) {
            this.list = [];
            this.sensors = [];
            this.option.series = [];
            return;
          }
          if (this.tabPosition == "top") {
            this.tabPosition = this.repertoireList[0].id;
          }
          this.handleListEquipment(this.tabPosition);
        } else {
          this.$message.error(res.message);
        }
      })
    },
    handleDeleteEquipment(id) {
      this.$confirm(this.$t('statistics.moveDevice1'), this.$t('common.hint'), {
          confirmButtonText: this.$t('common.confirm'),
          cancelButtonText: this.$t('common.cancel'),
        type: "warning"
      }).then(() => {
        getRepertoireEquipment({id}).then(res => {
          if (res.code) {
            this.$message.success(res.message);
            this.handleRepertoireList();
          } else {
            this.$message.error(res.message);
          }
        })
      })
    },
    handleListEquipment(listId) {
      this.tableLoading = true;
      this.list = [];
      this.sensors = [];
      this.option.series = [];
      getListEquipment({listId}).then(res => {
        this.tableLoading = false;
        if (res.code) {
          this.list = res.items;
          let arr = [];
          this.list.map(item => {
            if (item['sensors']) {
              item.sensors.map(sensor => {
                if (sensor['sensorType'] && !DEVICE_ID[sensor.type]) {
                  arr.push({
                    idx: sensor.idx,
                    name: sensor.sensorType.name,
                    type: sensor.type,
                    max: sensor.max,
                    min: sensor.min,
                    unit: sensor.sensorType.unit
                  })
                }
              })
            }
          })
          this.sensors = arrayToHeavy(arr, "name");
          this.dataCharts.type = this.sensors[0].type;
          this.dataCharts.unit = this.sensors[0].unit;
          this.handleHistoryCharts();
        } else {
          this.$message.error(res.message);
        }
      }).catch(e => {
        this.tableLoading = false;
      })
    },
    handleAddDevice() {
      this.$refs.DeviceList.open(this.repertoireList);
    },
    handleShowDrawer(row) {
      this.deviceId = row.strId;
      this.isDrawer = true;
    },
    handleSelectionChange(val) {
      this.multipleSelection = [];
      val.map(item => {
        this.multipleSelection.push(item.id);
      })
    },
    getRowKey(row) {
      return row.id;
    },
    handleDelete(listId, name) {
      this.$confirm(this.$t('labDevice.classifyDeleteMessage') + name + ">", this.$t('common.hint'), {
          confirmButtonText: this.$t('common.confirm'),
          cancelButtonText: this.$t('common.cancel'),
        type: "warning"
      }).then(() => {
        getRepertoireDelete({listId}).then(res => {
          if (res.code) {
            this.$message.success(res.message);
            this.handleRepertoireList();
          } else {
            this.$message.error(res.message);
          }
        })
      }).catch((err) => {
        console.log(err)
      })
    }
  }
}
</script>

<style lang="less" scoped>
.el-radio-button__inner {
  position: relative;
}

.top-right {
  position: absolute;
  right: 0;
  top: -5px;
  font-size: 24px;
  transform: rotate(45deg);
}

.main {
  height: 500px;
}
</style>