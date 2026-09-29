<template>
  <div>
    <el-descriptions :title="$t('hardware.monitorMessage')">
      <template v-if="$store.state.level" slot="extra">
        <el-select
            v-model="historyTimeInterval"
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
        <el-button
            v-if="sensors.length > 0"
            type="primary"
            class="icon-query-data"
            @click="handleHistoryData"> {{ $t('hardware.seeHistroy') }}
        </el-button>
      </template>
    </el-descriptions>
    <el-tabs v-if="isTab" v-model="sensorType">
      <el-tab-pane
          v-for="item in sensors"
          :key="item.id"
          :disabled="dataCharts.loading"
          :label="item.name"
          :name="item.id + ''"/>
    </el-tabs>
    <div class="charts-type">
      <div>
        <template v-for="item in idxType">
          <el-button
              v-if="item['sensorType']"
              :key="item.idx"
              :class="item.idx === active && 'is-active'"
              :disabled="dataCharts.loading"
              @click="handleCutSensor(item.idx, item)">
            {{ item.sensorType.sensorAlias }}
          </el-button>
        </template>
      </div>
      <div>
        <el-button
            v-for="item in dimensions"
            :key="item.INTERVAL"
            :class="interval === item.INTERVAL && 'is-active'"
            :disabled="dataCharts.loading"
            @click="handleCutTime(item.INTERVAL)">
          {{ item.LABEL }}
        </el-button>
        <el-button :disabled="dataCharts.loading" @click="handleCustomTime">{{ $t('common.custom') }}</el-button>
        <el-button :disabled="dataCharts.loading" class="el-icon-refresh" @click="handleUpdate"/>
      </div>
    </div>
    <LineMarkChart :dataCharts="dataCharts"/>
    <CustomTime ref="CustomTime" @handle="handleGetTime"/>
    <SeeHistoryData :type="type" ref="SeeHistoryData"/>
  </div>
</template>

<script>
import LineMarkChart from "@/components/LineMarkChart";
import CustomTime from "@/components/CustomTime";
import {historyTimeInterval, TIME_DIMENSION, TIME_FORMAT} from "@/utils/constant";
import {getHistoryDeviceChart} from "@/api/device";
import moment from "moment";
import SeeHistoryData from "@/views/device/components/SeeHistoryData";

export default {
  name: "index",
  props: {
    sensors: {
      type: Array,
      default: () => [],
      required: true
    },
    isTab: {
      type: Boolean,
      default: true
    },
    defaultName: {
      type: String,
      default: ""
    },
    /**
     * 1：智能硬件
     * 2：设备
     * 3：房间
     */
    type: {
      type: Number,
      default: 1
    },
    thingsId: {
      type: [Number, String],
      default: null
    },
  },
  components: {
    LineMarkChart,
    SeeHistoryData,
    CustomTime
  },
  data() {
    return {
      sensorType: "",
      idxType: [],
      interval: 4,
      active: 0,
      dimensions: TIME_DIMENSION,
      productId: null,
      historyTimeInterval: 1,
      timeInterval: historyTimeInterval,
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
      beginTime: "",
      createDate: "",
      endTime: "",
      deviceName: "",
    }
  },
  mounted() {
    this.handleSensorType(this.sensors);
  },
  watch: {
    sensorType: function (newValue, old) {
      var type = null;
      this.sensors.map(item => {
        if (newValue == item.id) {
          this.deviceName = item.name;
          this.idxType = item.sensors;
          this.sensorType = item.id + "";
          this.productId = item.productId;
          type = item.type
        }
      });
      if (this.idxType.length) {
        this.dataCharts.type = this.idxType[0].type;
        this.active = this.idxType[0].idx;
        this.initSensors(
            this.idxType[0].sensorType.name,
            this.idxType[0].sensorType.unit,
            this.idxType[0].max,
            this.idxType[0].min)
      } else {
        type === 8 && (this.active = 14);
        this.productId === 8 && (this.dataCharts.type = 17);
      }
      this.handleHistoryCharts();
    },
    sensors: {
      handler: function (newValue) {
        this.handleSensorType(newValue);
      },
      deep: true
    }
  },
  updated() {},
  methods: {
    handleSensorType(array) {
      if (array.length) {
        const obj = array[0];
        if (obj["id"]) {
          this.sensorType = obj.id + "";
        } else {
          this.sensorType = obj.deviceId;
          this.productId = obj.productId;
          this.idxType = array;
          this.deviceName = this.defaultName;
        }
      }
    },
    handleHistoryData() {
      if (this.productId === 15) {
        this.idxType = [{idx: 14, sensorType: {name: "断电检测", unit: ""}}]
      }
      this.$refs.SeeHistoryData.open(
          this.sensorType,
          this.idxType,
          this.deviceName,
          this.type,
          this.thingsId
      );
    },
    handleCutTime(index) {
      this.interval = index;
      this.endTime = this.beginTime = "";
      if (this.sensors.length === 0) {
        return this.$message.error(this.$t('hardware.notSensors'));
      }
      this.dataCharts.rows = [];
      this.handleHistoryCharts();
    },
    handleCustomTime() {
      this.$refs.CustomTime.open();
    },
    handleNewChartsData() {
      this.dataCharts.rows = [];
      this.handleHistoryCharts();
    },
    handleHistoryCharts() {
      this.dataCharts.loading = true;
      this.dataCharts.rows = [];
      getHistoryDeviceChart({
        deviceId: this.sensorType,
        idx: this.active,
        beginTime: this.beginTime,
        createDate: this.createDate,
        endTime: this.endTime,
        interval: this.interval,
        productId: this.productId,
        historyTimeInterval: this.historyTimeInterval,
        type: this.type,
        thingsType: this.type === 2 ? 4 : (this.type === 3) ? 11: null,
        thingsId: this.thingsId
      }).then(res => {
        this.dataCharts.loading = false;
        if (res.code) {
          this.dataCharts.rows = res.items.list;
        } else {
          this.$message.error(res.message);
        }
      })
    },
    handleCutSensor(index, item) {
      const {type, max, min, sensorType} = item;
      this.active = index;
      this.dataCharts.type = type;
      this.initSensors(sensorType.name, sensorType.unit, max, min);
      this.handleHistoryCharts();
    },
    initSensors(name, unit, max, min) {
      this.dataCharts.name = name;
      this.dataCharts.unit = unit;
      this.dataCharts.max = max;
      this.dataCharts.min = min;
    },
    handleGetTime(val) {
      this.interval = null;
      this.dataCharts.rows = [];
      this.beginTime = moment(val[0]).format(TIME_FORMAT);
      this.endTime = moment(val[1]).format(TIME_FORMAT);
      this.handleHistoryCharts();
    },
    handleUpdate() {
      this.interval = 4;
      this.active = 0;
      this.handleHistoryCharts();
    },
  },
  beforeDestroy() {
    this.sensorType = "";
    this.idxType = [];
  }
}
</script>
<style lang="less" scoped>
/deep/.select-change1 {
  width: 150px !important;
}
</style>
