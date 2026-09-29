<template>
  <div>
    <div class="detail-padding-nocolor">
      <el-descriptions :title="'关联信号源一览 ( 最新检测时间：' + (reportDate ? reportDate : '') +' )'">
        <template slot="extra">
          <el-button @click="handleUpdateDefense" class="icon-refresh">&nbsp;刷新</el-button>
          <el-button type="primary" @click="handleDefense" class="icon-edit">&nbsp;编辑防区</el-button>
        </template>
      </el-descriptions>
      <el-row v-if="signalSource.length" :gutter="20">
        <el-col v-for="item in signalSource" :key="item.id" :sm="8">
          <div
              :class="handleSignalClass(item)"
              class="card">
            <div class="card-title">
              <div>
                <span>{{ labelName(item.idx) }}</span>
                <span>{{ item.name }}</span>
              </div>
              <div v-if="item.idx > 4" :class="handleStatusColor(item.status).color">
                <span>报警范围：</span>
                <span>{{ item.min + " ~ " + item.max }}</span>
                <span>{{ item.sensorUnit }}</span>
              </div>
            </div>
            <div :class="handleStatusColor(item.status).color" class="card-name">
              <span v-html="handleValue(item)"></span>
              <span class="icon" :class="handleStatusColor(item.status).icon"></span>
            </div>
          </div>
        </el-col>
        <el-col :sm="8">
          <div
              :class="(signalSource[0].powerState === 0 ? 'abnormal-background' : 'normal-background')"
              class="card">
            <div class="card-title">
              <span>断电检测</span>
            </div>
            <div class="card-name" :class="handleStatusColor(signalSource[0].powerState).color">
              <span>{{ signalSource[0].powerState ? "未断电" : "断电" }}</span>
              <span class="icon" :class="handleStatusColor(signalSource[0].powerState).icon"></span>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
    <div class="detail-padding">
      <el-descriptions class="margin-center" title="监控信息">
        <template slot="extra">
          <el-button type="primary" @click="handleHistoryData" class="icon-query-data">&nbsp;查看历史数据</el-button>
        </template>
      </el-descriptions>
      <div class="charts-type">
        <div>
          <el-button
              v-for="(item, index) in signalSource"
              :key="item.idx"
              :class="item.idx === active && 'is-active'"
              :disabled="dataCharts.loading"
              style="margin-bottom: 8px"
              @click="handleSignalSource(index, item)">
            {{ labelName(item.idx) }}
          </el-button>
          <el-button
              :class="active === 14 && 'is-active'"
              :disabled="dataCharts.loading"
              @click="handleSignalSource(7)">
            断电检测
          </el-button>
        </div>
        <div>
          <el-button
              v-for="item in dimensions"
              :key="item.INTERVAL"
              :class="interval === item.INTERVAL && 'is-active'"
              style="margin-bottom: 8px"
              @click="handleCutTime(item.INTERVAL)">
            {{ item.LABEL }}
          </el-button>
          <el-button @click="handleCustomTime">自定义</el-button>
          <el-button class="el-icon-refresh" @click="handleNewChartsData"></el-button>
        </div>
      </div>
      <line-mark-chart :data-charts="dataCharts"/>
    </div>
    <div class="detail-padding-nocolor">
      <el-descriptions title="负责人">
        <template slot="extra">
          <el-button type="primary" @click="handleSetPrincipal" class="icon-staff-settings">&nbsp;添加负责人</el-button>
        </template>
      </el-descriptions>
      <principal-table :total="principalTotal" :items="principalItems" :equipment-users="equipmentUsers" :loading="equipmentLoading"/>
      <div class="paging">
        <pagination
            v-show="principalTotal > principalItems.pageSize"
            :limit.sync="principalItems.pageSize"
            :page.sync="principalItems.pageNum"
            :total="principalTotal"
            @pagination="handleEquipmentUsers"/>
      </div>
    </div>
    <div class="detail-padding">
      <el-descriptions class="margin-center" title="历史报警记录"/>
      <el-tabs v-model="alarmRecordType">
        <el-tab-pane v-for="item in defenseType" :key="item.name" :label="item.label" :name="item.name"></el-tab-pane>
      </el-tabs>
      <el-table
          v-if="(Number(alarmRecordType) <= 2103 && Number(alarmRecordType) >= 2100)"
          v-loading="alarmLoading"
          border
          :data="alarmRecord">
        <el-table-column fixed label="序号" width="70px" type="index">
          <template v-slot="scope">
            <span v-if="`${alarmTotal !== 0}`">{{
                (alarmItems.pageNum - 1) * alarmItems.pageSize + scope.$index + 1
              }}</span>
          </template>
        </el-table-column>
        <el-table-column
            :show-overflow-tooltip="true"
            label="报警时间"
            min-width="200">
          <template v-slot="scope">
            <div>
              开始时间：{{ scope.row.createDate }}
            </div>
            <div>
              结束时间：{{ scope.row.updateDate }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="持续时间" prop="duration"/>
        <el-table-column label="操作">
          <template v-slot="scope">
            <el-button v-if="scope.row['updateDate']" :class="scope.row.process ? '' : 'abnormal'" type="text"
                       @click="handleAlarmProcess(scope.row)">{{ scope.row.process ? "修改处理" : "添加处理" }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-table
          v-else-if="Number(alarmRecordType) === 200"
          v-loading="alarmLoading"
          :data="alarmRecord"
          border
          :default-sort="{order: 'descending'}"
          :row-height="40"
          class="mt8">
        <el-table-column fixed label="序号" width="70px" type="index">
          <template v-slot="scope">
            <span v-if="`${alarmTotal !== 0}`">{{
                (alarmItems.pageNum - 1) * alarmItems.pageSize + scope.$index + 1
              }}</span>
          </template>
        </el-table-column>
        <el-table-column
            key="0"
            :show-overflow-tooltip="true"
            label="报警数值"
            prop="value">
          <template v-slot="scope">
            <span>{{ handleAlarmScope(scope.row).scope }}</span>
          </template>
        </el-table-column>
        <el-table-column
            key="1"
            :show-overflow-tooltip="true"
            label="报警范围">
          <template v-slot="scope">
            <span>{{ handleAlarmScope(scope.row).scope }}</span>
          </template>
        </el-table-column>
        <el-table-column
            :show-overflow-tooltip="true"
            label="报警类型">
          <template v-slot="scope">
            {{ handleSensorType(scope.row.sensorType) }}
          </template>
        </el-table-column>
        <el-table-column label="报警开始时间" min-width="150" prop="createDate" sortable/>
        <el-table-column
            :show-overflow-tooltip="true"
            label="接收人"
            prop="userName"/>
        <el-table-column
            :show-overflow-tooltip="true"
            prop="receptionList"
            label="接收方式">
          <template v-slot="scope">
            <div v-for="item in scope.row.receptionList">
              {{ item }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="接收时间" min-width="150" prop="messageDate" sortable/>
      </el-table>
      <alarm-table
          v-else
          :is-column="alarmRecordType == 2104 ? null : 1000"
          :loading="alarmLoading"
          :total="alarmTotal"
          :items="alarmItems"
          @handle="handleAlarmProcess"
          :table-data.sync="alarmRecord"/>
      <div class="paging">
        <pagination
            v-show="alarmTotal > alarmItems.pageSize"
            :limit.sync="alarmItems.pageSize"
            :page.sync="alarmItems.pageNum"
            :total="alarmTotal"
            @pagination="handleGetAlarmHistoryDevice"/>
      </div>
    </div>
    <defense ref="Defense"/>
    <SetPrincipal ref="SetPrincipal" @handle="handleEquipmentUsers"/>
    <CustomTime ref="CustomTime" @handle="handleGetTime"/>
    <SeeHistoryData ref="SeeHistoryData"/>
    <AlarmProcessing ref="AlarmProcessing" @handle="handleGetAlarmHistoryDevice"/>
  </div>
</template>

<script>
import LineMarkChart from "@c/LineMarkChart";
import PrincipalTable from "@c/PrincipalTable";
import {TIME_DIMENSION, items, TIME_FORMAT} from "@/utils/constant";
import Defense from "@/views/alarmAcousto/components/Defense";
import {getSignalSourceList} from "@/api/alertor";
import {getEquipmentUserList} from "@/api/user";
import SetPrincipal from "@c/SetPrincipal/index";
import AlarmTable from "@c/AlarmTable/index";
import {getAlarmHistoryDevice, getHistoryDeviceAlarm, getHistoryDeviceChart} from "@/api/device";
import AlarmProcessing from "@/views/device/components/AlarmProcessing";
import Pagination from "@c/Pagination/index";
import CustomTime from "@c/CustomTime/index";
import moment from "moment";
import SeeHistoryData from "@/views/device/components/SeeHistoryData";
import {sensorType} from "@/utils/methods";

let initNum = 1, time;
const defense = {
  1: "防区一",
  2: "防区二",
  3: "防区三",
  4: "防区四",
  5: "防区五",
}

const defenseCharts = {
  1: 9,
  2: 10,
  3: 11,
  4: 12,
  5: 13,
}

export default {
  name: "Multifunction",
  components: {
    Defense,
    LineMarkChart,
    PrincipalTable,
    SetPrincipal,
    AlarmTable,
    Pagination,
    AlarmProcessing,
    SeeHistoryData,
    CustomTime
  },
  props: {
    alerterId: {
      type: Number,
      default: null,
      required: true
    },
    no: {
      type: String,
    },
    reportDate: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      dataCharts: {
        columns: ["createDate", "data"],
        rows: [],
        loading: false,
        name: "",
        unit: "",
        type: 17,
        max: null,
        min: null,
      },
      dimensions: TIME_DIMENSION,
      interval: 4,
      signalSource: [],
      active: 1,
      equipmentUsers: [],
      equipmentLoading: false,
      equipmentItems: {
        pageNum: items.PAGE_NUM,
        pageSize: items.PAGE_SIZE,
        equipmentId: null,
        equipmentType: "DEVICE"
      },
      alarmRecord: [],
      alarmLoading: false,
      alarmRecordType: "2100",
      defenseType: [
        {name: "2100", label: "防区一"},
        {name: "2101", label: "防区二"},
        {name: "2102", label: "防区三"},
        {name: "2103", label: "防区四"},
        {name: "2104", label: "防区五"},
        {name: "2000", label: "断电报警"},
        {name: "1000", label: "离线"},
        {name: "200", label: "我的报警信息"},
      ],
      alarmItems: {
        pageNum: items.PAGE_NUM,
        pageSize: items.PAGE_SIZE
      },
      alarmTotal: 0,
      beginTime: "",
      createDate: "",
      endTime: "",
      deviceName: "",
      idx: 9,
      principalTotal: 0,
      principalItems: {
        pageNum: items.PAGE_NUM,
        pageSize: items.PAGE_SIZE
      }
    }
  },
  computed: {
    labelName() {
      return (val) => {
        return defense[val];
      }
    }
  },
  created() {
    this.signalSource = [];
    this.init();
    initNum = 1;
  },
  inject: ["name"],
  watch: {
    alarmRecordType: function (value) {
      this.alarmItems = {
        pageNum: items.PAGE_NUM,
        pageSize: items.PAGE_SIZE
      }
      this.alarmTotal = 0;
      this.handleGetAlarmHistoryDevice();
    },
    no: {
      handler: function (value) {
        this.handleGetSignalSourceList();
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      new Promise((resolve, reject) => {
        time = setInterval(() => {
          this.handleGetSignalSourceList();
          resolve()
        }, 10000)
      }).catch(err => {
        return reject(err);
      })
    })
  },
  methods: {
    handleSensorType(value) {
      return sensorType(value);
    },
    handleUpdateDefense() {
      this.$message.warning("刷新中……")
      this.handleGetSignalSourceList();
    },
    handleSignalClass(item) {
      return item.status === 0 ? "abnormal-background" : 'normal-background';
    },
    handleHistoryData() {
      let array = [];
      this.signalSource.map(item => {
        const sensorType = {name: defense[item.idx], unit: item.sensorUnit}
        array.push({idx: defenseCharts[item.idx], sensorType});
      })
      this.$refs.SeeHistoryData.open(
          this.alerterId,
          array,
          this.name
      );
    },
    handleGetTime(val) {
      this.interval = null;
      this.dataCharts.rows = [];
      this.beginTime = moment(val[0]).format(TIME_FORMAT);
      this.endTime = moment(val[1]).format(TIME_FORMAT);
      this.handleHistoryDeviceCharts();
    },
    async init() {
      await this.handleGetSignalSourceList();
      this.equipmentItems.equipmentId = this.alerterId;
      await this.handleEquipmentUsers();
      await this.handleGetAlarmHistoryDevice();
    },
    handleAlarmProcess(row) {
      this.$refs.AlarmProcessing.open(row);
    },
    handleGetAlarmHistoryDevice() {
      this.alarmLoading = true;
      let type;
      this.alarmRecord = [];
      if (this.alarmRecordType == 2000) {
        type = 17;
      } else if (this.alarmRecordType == 200) {
        getHistoryDeviceAlarm({
          deviceId: this.alerterId,
          pageNum: this.alarmItems.pageNum,
          pageSize: this.pageSize
        }).then(res => {
          this.alarmLoading = false;
          this.alarmRecord = res.items.list;
          if (this.alarmItems.pageNum === items.PAGE_NUM) {
            this.alarmTotal = res.items["total"] && res.items.total;
          }
        })
        return;
      } else {
        type = this.alarmRecordType;
      }
      getAlarmHistoryDevice({
        deviceId: this.alerterId,
        pageNum: this.alarmItems.pageNum,
        pageSize: this.alarmItems.pageSize,
        type
      }).then(res => {
        this.alarmLoading = false;
        this.alarmRecord = res.items.list;
        if (this.alarmItems.pageNum === items.PAGE_NUM) {
          this.alarmTotal = res.items["total"] && res.items.total;
        }
      })
    },
    handleCutTime(value) {
      this.interval = value;
      this.endTime = this.beginTime = "";
      if (this.signalSource.length === 0) {
        return this.$message.error("当前设备没有传感器");
      }
      this.dataCharts.rows = [];
      this.handleHistoryDeviceCharts();
    },
    handleNewChartsData() {
      this.dataCharts.rows = [];
      this.handleHistoryDeviceCharts();
    },
    handleHistoryDeviceCharts() {
      this.dataCharts.loading = true;
      getHistoryDeviceChart({
        deviceId: this.alerterId,
        idx: this.idx,
        beginTime: this.beginTime,
        endTime: this.endTime,
        interval: this.interval,
        productId: 8,
        createDate: this.createDate,
        type: 1
      }).then(res => {
        this.dataCharts.loading = false;
        this.dataCharts.type = this.idx !== 13  ? (this.idx ===14 ? 17 : 0) : this.idx;
        if (res.code) {
          this.dataCharts.rows = res.items.list;
        } else {
          this.$message.error(res.message);
        }
      })
    },
    handleSignalSource(index, item) {
      if (index === 7) {
        this.active = 14;
        this.idx = 14;
        this.initSensors("断电检测", 17, "", 1, 0);
      } else {
        let {max, min, name, idx, sensorUnit} = item;
        this.active = idx;
        this.idx = defenseCharts[idx];
        idx <= 4 && (name = defense[idx]);
        this.initSensors(name, defenseCharts[idx], sensorUnit, max, min);
      }
      this.handleHistoryDeviceCharts();
    },
    initSensors(name, type, unit, max, min) {
      this.dataCharts.name = name;
      this.dataCharts.type = type;
      this.dataCharts.unit = unit;
      this.dataCharts.max = max;
      this.dataCharts.min = min;
    },
    handleValue(item) {
      if (item.idx <= 4) {
        return item["status"] && item.status === 1 ? "正常" : (item.status === 0 ? "报警" :"未激活");
      } else {
        return item.value;
      }
    },
    handleGetSignalSourceList() {
      getSignalSourceList({equipmentNo: this.no}).then(res => {
        if (res.code) {
          this.signalSource = res.items.list;
          if (initNum) {
            initNum = 0;
            this.initSensors(
                "防区一",
                defenseCharts[this.active],
                "",
                this.signalSource[0].max,
                this.signalSource[0].min);
            this.handleHistoryDeviceCharts();
          }
        } else {
          this.$message.error(res.message);
        }
      })
    },
    handleCustomTime() {
      this.$refs.CustomTime.open();
    },
    handleDefense() {
      this.$refs.Defense.open(this.no, this.signalSource);
    },
    handleEquipmentUsers() {
      this.equipmentLoading = true;
      getEquipmentUserList(this.equipmentItems).then(res => {
        this.equipmentLoading = false;
        if (res.code) {
          this.equipmentUsers = res.items.list;
          if (res.items.pageNum === items.PAGE_NUM) {
            this.principalTotal = res.items.total;
          }
        } else {
          this.$message.error(res.message);
        }
      })
    },
    handleSetPrincipal() {
      this.$refs.SetPrincipal.open(0, this.alerterId);
    },
    handleStatusColor(value) {
      if (value !== 1) {
        return {color: "abnormal", icon: "icon-warning-line"};
      } else if (value){
        return {color: "normal", icon: "icon-normal"};
      } else {
        return {color: "abnormal", icon: "icon-warning-line"};
      }
    }
  },
  beforeDestroy() {
    clearInterval(time);
    time = null;
  }
}
</script>

<style lang="less" scoped>
.card {
  height: 100px;
  border-radius: 8px;
  padding: 20px 20px 0 30px;
  color: #444444;
  font-size: 14px;
  line-height: 14px;
  margin-bottom: 20px;

  .card-title {
    display: flex;
    justify-content: space-between;
  }

  .card-name {
    font-size: 36px;
    line-height: 36px;
    font-weight: 500;
    margin-top: 10px;
    display: flex;
    justify-content: space-between;

    .icon {
      font-size: 36px;
    }
  }

  .card-unit {
    display: flex;
    justify-content: space-between;
  }
}
</style>
