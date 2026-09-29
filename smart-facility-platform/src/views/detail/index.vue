<template>
  <div class="drawerPage">
    <div class="detail-padding">
      <DrawerNav :icon="false" :name="desc.name" @handle="handleClose"/>
      <div class="detail-handle clearfix">
        <!-- 运行状态 -->
        <div>
      <span v-if="desc.types != 2 && desc.detailType == 1" class="status">
        {{ $t('labDevice.runStatus') }}
        <i
          v-if="desc.status != 4"
          :style="{
            backgroundColor: getStatusColor(desc.status, LABSTATUS),
          }"
          class="icon"
        ></i>
        <em>({{ getStatusName(desc.status, LABSTATUS) }})</em>
      </span>
          <!-- 参数状态 -->
          <span v-if="desc.types != 2 && desc.detailType == 1" class="status">
          {{ $t('labDevice.paramStatus') }}
        <i
          v-if="desc.bingStatus != 4"
          :style="{
            backgroundColor: getStatusColor(desc.bingStatus, MONITORSTATUS),
          }"
          class="icon"
        ></i>
        <em>({{ getStatusName(desc.bingStatus, MONITORSTATUS) }})</em>
      </span>
        </div>
        <div class="handleTool">
          <el-button class="icon-reserve" type="primary" @click="goIsFullcalendar"
          >&nbsp;{{ $t('labDevice.addOrder') }}
          </el-button>
          <el-button :disabled="desc.status === 3" @click="handleMaintenance"
          >{{ $t('labDevice.addMaintenance') }}
          </el-button>
        </div>
      </div>
      <div class="box baseInfo">
        <div class="title">
          {{ $t('common.basicInformation') }}
          <!-- <el-button class="icon-Audible-alarm" @click="$refs.advancedAlarmSet.open()"> 报警设置</el-button> -->
          <!-- <el-button @click="$refs.assetDetail.open()">资产详情信息</el-button>
          <el-button @click="$refs.assetDisposalRecord.open()">资产处理记录</el-button>
          <el-button type="primary" class="icon-edit">&nbsp;编辑</el-button> -->
        </div>
        <el-skeleton :loading="loading" animated>
          <template slot="template">
            <div class="content">
              <div class="pic">
                <el-skeleton-item variant="image"/>
              </div>
              <div class="desc">
                <div v-for="(item, index) in 5" :key="index" class="row">
                  <el-skeleton-item variant="text"/>
                </div>
              </div>
            </div>
          </template>
          <template>
            <div class="content">
              <div class="pic">
                <div
                  :style="{
                    background: `url(${
                      (desc.logoUrl && desc.logoUrl !== '0') ? BASE_URL + desc.logoUrl : defaultImage
                    }) no-repeat`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center center',
                  }"
                  class="equipmentImage"
                ></div>
                <div class="icon badge"></div>
              </div>
              <div class="desc">
                <div class="row">
                  <span class="col col-1">{{ $t('labDevice.labDeviceNo') }}：<span>{{ desc.no || $t('common.notMessage') }}</span></span>
                  <span class="col"
                  >{{ $t('labDevice.paramStatus') }}：
                    <span v-if="desc.bingStatus" :class="{ 'abnormal': desc.bingStatus == -1 || desc.bingStatus == 2 }">
                      {{ getSenorStatus(desc.bingStatus)[0] }}
                    </span>
                    <span v-else>{{$t('common.notMessage')}}</span>
                  </span>
                  <span class="col">{{ $t('labDevice.brand') }}：<span>{{ desc.brand || $t('common.notMessage') }}</span></span>
                </div>
                <div class="row">
                  <span class="col col-1"
                  >{{ $t('common.owningDepartment') }}：<span>{{ desc.departmentName || $t('common.notMessage') }}</span></span
                  >
                  <span class="col">{{ $t('common.principal') }}：<span>{{ desc.price || 0 }}元</span></span>
                  <span class="col">{{ $t('labDevice.price1') }}：<span>{{ desc.model || $t('common.notMessage') }}</span></span>
                </div>
                <div class="row">
                  <span class="col col-1"
                  >{{ $t('labDevice.model') }}：<span>{{ desc.roomName || $t('common.notMessage') }}</span></span
                  >
                  <span class="col"
                  >{{ $t('common.createName') }}：<span>{{ desc.userName || $t('common.notMessage') }}</span></span
                  >
                  <span class="col"
                  >{{ $t('common.creatDate') }}：<span>{{ desc.createDate || $t('common.notMessage') }}</span></span
                  >
                </div>
                <div class="row">
                  <span class="col col-1"
                  >{{ $t('common.companyName') }}：<span>{{ desc.companyName || $t('common.notMessage') }}</span></span
                  >
                  <span class="col"
                  >{{ $t('labDevice.labDeviceBuyDate') }}：<span>{{ desc.buyDate || $t('common.notMessage') }}</span></span
                  >
                  <span class="col"
                  >{{ $t('labDevice.nextMaintenanceDate') }}：<span>{{
                      desc.nextMaintenanceDate || $t('common.notMessage')
                    }}</span></span>
                </div>
                <div class="row">
                  <span class="col col-1">
                    {{ $t('labDevice.labDeviceGrade') }}：<span>{{ desc.labelNo || $t('common.notMessage') }}</span>
                  </span>
                  <span class="col">
                    {{ $t('hardware.labelNo') }}：
                    <span>{{ statusText(desc.monitorStatus, ASSETTAGSTATUS) || $t('common.notMessage') }}</span>&nbsp;
                    <el-button v-if="desc.labelId" type="text" @click="handleUnbindLabel">{{ $t('common.unBind') }}</el-button>
                  </span>
                  <span class="col">
                    {{ $t('labDevice.labQrCode') }}：
                    <span v-if="!desc.qrUrl">{{ $t('common.notMessage') }}</span>
                    <img v-else :src="BASE_URL + desc.qrUrl" width="100" style="vertical-align: text-top;">
                    <div v-if="desc.qrUrl" class="cover-qrcodeNo"></div>
                  </span>
                  <span class="col">
                    {{ $t('common.principal') }}：
                    <span>{{ desc.managerName || $t('common.notMessage') }}</span>
                  </span>
                </div>
              </div>
            </div>
          </template>
        </el-skeleton>
      </div>
      <div v-if="hardwarebindList.length > 0" class="flexBox equipmentBinded">
        <div class="label">{{ $t('labDevice.bindDevice') }}：</div>
        <div v-if="isBindLength > 0">
          <template v-for="item in hardwarebindList">
            <a
              v-if="!item.isBind"
              :key="item.id"
              @click="handleDeviceDrawer(item)"
            >
              <span class="margin-small-right">{{ item.name }}</span>
              <i
                :style="{
                  color: getStatusProto(item.status, 'color', MONITORSTATUS, 'hardwarebind'),
                }"
              >{{ `(${getStatusName(item.status, MONITORSTATUS, 'hardwarebind')})` }}</i
              >
            </a>
          </template>
        </div>
        <span v-else>{{ $t('common.noBindDevice') }}</span>
      </div>
    </div>
    <div v-if="monitorList.length > 0" class="box stateMonitor detail-padding-nocolor">
      <div class="title">
        {{ $t('hardware.newStatus') }} <span v-if="isBindLength > 0">（{{ $t('hardware.reportDate') }}：{{ latestTime }}）</span>
        <el-button class="icon-refresh" @click="handleRefreshList">&nbsp;{{ $t('hardware.reset') }}</el-button>
        <el-button @click="handleProbeNameEdit">{{ $t('labDevice.sensorEdit') }}</el-button>
      </div>
      <div class="new-state">
        <el-row v-if="isBindLength > 0" :gutter="20">
          <el-col v-for="(item, index) in monitorList" :key="index" :sm="8" :xl="6">
            <hardware-state
              v-if="!item.isBind"
              :data="item"/>
          </el-col>
        </el-row>
        <el-row v-else class="no-data">
          <el-col>{{ $t('common.notMessage1') }}</el-col>
        </el-row>
      </div>
    </div>
    <!-- 监控信息 -->
    <device-monitor-message v-if="sensors.length" :sensors="sensors" :things-id="desc.id" :type="2"
                            class="detail-padding"/>
    <div v-if="smartSocketIds.length > 0 && smartSocketIsBind" class="box detail-padding-nocolor echartsBox">
      <div class="echartsBox-header clearfix">
        <div class="title">{{ $t('labDevice.equipmentUserStatusStat') }}</div>
        <el-button
          class="btn-default icon-query-data"
          type="primary"
          @click="handleSeeHistory"
        >&nbsp;{{ $t('hardware.seeHistroy') }}
        </el-button>
      </div>
      <div class="useStatistics-box">
        <el-row :gutter="20" class="box">
          <el-col :span="8">
            <div class="box-item">
              <div class="box-item-header">
                <div class="name">{{ $t('hardware.newStatus1') }}</div>
              </div>
              <div
                :class="
                    getStatusProto(
                      useStatisticsData.currentStatus,
                      'value',
                      SMARTSOCKETSTATUS
                    )
                  "
                class="status">
                {{
                  getStatusProto(
                    useStatisticsData.currentStatus,
                    "label",
                    SMARTSOCKETSTATUS
                  )
                }}
              </div>
              <div class="box-item-content">
                <div class="flexBox status-box">
                  <div class="status-box-item">
                    <div class="item_header">
                      {{
                        useStatisticsData.currentStatus === 0
                          ? $t('labDevice.standbyOff1')
                          : useStatisticsData.currentStatus === 2
                            ? $t('labDevice.standbyPower1')
                            : $t('labDevice.runing1')
                      }}{{ $t('hardware.duration') }}
                    </div>
                    <div class="item_content">
                      <div class="text">
                          <span class="value">{{
                              timeTransform(useStatisticsData.currentRunDuration)
                            }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="status-box-item">
                    <div class="item_header">{{ $t('labDevice.powerConsumption') }}</div>
                    <div class="item_content">
                      <div class="text">
                          <span class="value">{{
                              useStatisticsData.currentElectricityStr
                            }}</span>
                        <span class="unit">kw`h</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="dateTime">
                  {{ $t('common.startTime') }}：{{ useStatisticsData.currentRunStartDate }}
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="box-item history">
              <div class="flexBox status-box">
                <div class="status-box-item">
                  <div class="name">{{ $t('labDevice.historicalCumulativeRunningTime') }}</div>
                  <div class="row">
                    <!-- <div class="icon">

                    </div> -->
                    <div class="text">
                      <i class="icon icon-time"></i>
                      <span class="value">{{
                          timeTransform(useStatisticsData.runDuration)
                        }}</span>
                    </div>
                  </div>
                </div>
                <div class="status-box-item">
                  <div class="name">{{ $t('labDevice.historicalCumulativePowerConsumption') }}</div>
                  <div class="row">
                    <div class="text">
                      <i class="icon icon-powerEnergy"></i>
                      <span class="value">{{
                          useStatisticsData.electricityStr
                        }}</span>
                      <span class="unit">kw`h</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="box-item query">
              <div class="flexBox handleTool">
                <el-button
                  class="btn"
                  type="primary"
                  @click="handleSelectUseStatisticsDate"
                >{{ $t('common.month') }}
                </el-button
                >
                <el-date-picker
                  v-model="useStatisticsDate"
                  :end-placeholder="$t('common.endDate')"
                  range-separator="-"
                  :start-placeholder="$t('common.startDate')"
                  type="daterange"
                  value-format="yyyy-MM-dd"
                  @change="handleUseStatisticsDateChange"
                >
                </el-date-picker>
              </div>
              <div class="box-item-content">
                <div class="">
                  {{ $t('labDevice.runNum') }}：{{ useStatisticsCustomData.customRunNum }}{{ $t('common.next') }}
                </div>
                <div class="">
                  {{ $t('labDevice.runTime') }}：{{
                    timeTransform(useStatisticsCustomData.customRunDuration)
                  }}
                </div>
                <div class="">
                  {{ $t('labDevice.cumulativePowerConsumption') }}：{{ useStatisticsCustomData.customElectricity }}
                  kw`h
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
    <TabsModule :bindDatas="bindDatas" :detailId="detailId" :hardwarebindList="hardwarebindList" :sensors="sensors"
                :status="desc.status"
                class="detail-padding" @goIsFullcalendar="goIsFullcalendar"/>
    <BindModal v-if="bindVisible"/>
    <see-history-data ref="SeeHistoryData" :device="id"/>
    <DeviceDrawer :id.sync="deviceId" :is-drawer.sync="deviceDrawer"/>
    <AlerterDrawer :id.sync="alerterId" :is-drawer.sync="alerterDrawer"/>
    <PowerDrawer :id.sync="outageAlarmId" :is-drawer.sync="outageAlarmDrawer"/>
    <SmartSocketDrawer :id.sync="smartSocketId" :is-drawer.sync="smartSocketDrawer"
                       @handle="handleClose"/>
    <Fullcalendar
      v-if="isFullcalendar"
      :isBanPastTime="true"
      @goIsFullcalendar="goIsFullcalendar"
      @handleSetDate="handleSetDate"/>

    <Modal v-if="modalVisible" :detailId="detailId" @goIsFullcalendar="goIsFullcalendar"/>

    <ProbeNameEdit ref="probeNameEdit" @handle="handleRefreshList"/>

    <!-- <AssetDetail ref="assetDetail" />
    <AssetDisposalRecord ref="assetDisposalRecord" /> -->

    <!-- <AdvancedAlarmSet ref="advancedAlarmSet" /> -->
  </div>
</template>
<script>
import Echarts from "@/components/Echarts";
import TabsModule from "./components/TabModule.vue";
import Modal from "./Modal.vue";
import BindModal from "./BindModal.vue";
import HardwareState from "@/components/HardwareState";
import {mapMutations, mapState} from "vuex";
import AlarmStatisticsChart from "./components/AlarmStatisticsChart.vue";
import AlarmStatisticsPieChart from "./components/AlarmStatisticsPieChart.vue";
// import AssetDetail from "./components/AssetDetail.vue";
// import AssetDisposalRecord from "./components/AssetDisposalRecord.vue";
// import AdvancedAlarmSet from "../AdvancedAlarmSet";
import {bindedStatusSet} from "./config";
import {BASE_URL, DEVICE_ID, ASSETTAGSTATUS} from "@/utils/constant.js";
import {
  getInstrumentDetail,
  getInstrumentThingsList,
  postInstrumentDeviceErrorStatistics,
  postSmartSocketElectricityConsumption,
  postSmartSocketelectricityCustom,
  postSmartSocketElectricityStatistics,
  postSmartSocketUsageDuration,
  postSmartSocketUsageTimes,
  getInstrumentUnbind
} from "@/api/labDevice";
import {ERROR, LABSTATUS, MONITORSTATUS, SMARTSOCKETSTATUS, STATUS_VALUE,} from "@/utils/constant";
import SeeHistoryData from "@/views/labDevice/components/SeeHistoryData";
import Fullcalendar from "@/components/Fullcalendar"
import DeviceMonitorMessage from "@c/DeviceMonitorMessage"
import DrawerNav from "@c/DrawerNav/index";
import ProbeNameEdit from "@/components/ProbeNameEdit";
import {arrayToHeavy, statusText, getSenorStatus} from "@/utils/methods";

export default {
  name: "detail",
  components: {
    DeviceDrawer: () => import("@/views/device/components/DeviceDrawer"),
    SmartSocketDrawer: () => import("@/views/smartSocket/components/SmartSocketDrawer"),
    AlerterDrawer: () => import("@/views/alarmAcousto/components/AlerterDrawer"),
    PowerDrawer: () => import("@/views/powerOutageAlarm/components/PowerDrawer"),
    SeeHistoryData,
    Echarts,
    TabsModule,
    Modal,
    BindModal,
    AlarmStatisticsChart,
    AlarmStatisticsPieChart,
    // AssetDetail,
    // AssetDisposalRecord,
    // AdvancedAlarmSet,
    HardwareState,
    Fullcalendar,
    DeviceMonitorMessage,
    DrawerNav,
    ProbeNameEdit
  },
  props: {
    detailId: {
      type: [Number, String],
      default: "",
    },
    instrumentId: {
      type: [Number, String],
      default: "",
    }
  },

  data() {
    const _this = this;
    return {
      ASSETTAGSTATUS,
      statusText,
      getSenorStatus,
      // 日程
      isFullcalendar: false,
      // 汇报时间
      latestTime: "",

      instrumentListId: "",
      detailType: 1,
      bindedStatusSet,
      smartSocketIds: [],
      smartSocketIsBind: false,
      useStatisticsDate: this.getCurrentMonth(),
      useStatisticsData: "",
      useStatisticsCustomData: {},
      MONITORSTATUS,
      LABSTATUS,
      SMARTSOCKETSTATUS,
      did: "",
      desc: {},
      defaultImage: require("../../../src/assets/systemImages/equipment.png"),
      loading: true,
      alarmDate: "",
      hardwarebindList: [],
      monitorList: [],
      sensors: [],
      deviceErrorStatisticsData: [], //离线报警统计
      deviceErrorStatisticsTotal: [],
      demoOption: {
        color: ["#13ce66", "#666666", "#000000", "#ff4949", "#ffd591"],
        tooltip: {
          trigger: "axis",
        },
        xAxis: {
          type: "category",
          data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          axisTick: {
            show: false,
          },
        },
        yAxis: {
          type: "value",
          axisTick: {
            show: false,
          },
          axisLine: {
            show: false,
          },
        },
        series: [
          {
            name: "Email",
            type: "line",
            stack: "Total",
            data: [120, 132, 101, 134, 90, 230, 210],
          },
          {
            name: "Union Ads",
            type: "line",
            stack: "Total",
            data: [220, 182, 191, 234, 290, 330, 310],
          },
        ],
      },

      endDate: "",
      startDate: "",
      runDuration: "",
      electricity: "",
      BASE_URL,
      bindDatas: [],
      deviceDrawer: false,
      alerterDrawer: false,
      smartSocketDrawer: false,
      outageAlarmDrawer: false,
      deviceId: "",
      alerterId: "",
      smartSocketId: "",
      outageAlarmId: "",
      isBindLength: 0
    };
  },
  computed: {
    ...mapState("detail", {
      modalVisible: "modalVisible",
      bindVisible: "bindVisible",
      bindDataReflesh: "bindDataReflesh",
    }),

    ...mapState("lab", {
      isDrawVisible: "",
    }),
    id() {
      var newId = "";
      if (this.$route.name == "Maintenance") {
        newId = this.instrumentId
      } else {
        newId = this.detailId
      }
      this.instrumentListId = newId;
      return this.$route.params.id ? this.$route.params.id : newId;
    },
    bindParam() {
      let {id, bindDataReflesh} = this;
      return {
        id,
      };
    },

    useStatisticsParam() {
      let {smartSocketIds, useStatisticsDate} = this;
      return {
        ids: smartSocketIds,
        useStatisticsDate,
      };
    },

    deviceErrorStatisticsParam() {
      let {id, alarmDate, hardwarebindList} = this;
      return {
        instrumentId: id,
        alarmDate,
        hardwarebindList,
      };
    },
  },
  watch: {
    id: {
      handler(newVal) {
        this.getBaseInfo(newVal);
      },
      immediate: true,
    },
    smartSocketIds: {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          let id = newVal[0];
          let obj = {
            instrumentId: this.detailId,
            interval: 6,
          };
          this.getElectricityStatistics(obj);
        }
      },
    },
    useStatisticsParam: {
      handler(newVal) {
        let {ids, useStatisticsDate} = newVal;
        if (ids && ids.length > 0) {
          let obj = {
            deviceId: ids[0],
          };
          if (useStatisticsDate) {
            let startTime = useStatisticsDate[0];
            let endTime = useStatisticsDate[1];
            obj = {
              ...obj,
              startTime,
              endTime,
            };
          } else {
            obj = {
              ...obj,
              interval: 6,
            };
          }
          this.getElectricityCustom(obj);
        }
      },
      immediate: true,
    },
    deviceErrorStatisticsParam: {
      handler(newVal) {
        if (this.hardwarebindList.length && this.hardwarebindList.length > 0) {
          let {instrumentId, alarmDate} = newVal;
          let obj = {
            instrumentId,
          };
          if (alarmDate) {
            let startDate = alarmDate[0];
            let endDate = alarmDate[1];
            obj = {
              ...obj,
              startDate,
              endDate,
            };
          }
          this.postInstrumentDeviceErrorStatisticsAsync(obj);
        }
      },
      immediate: true,
    },
    bindParam: {
      handler(newVal) {
        this.getHardwareBinded(newVal.id);
      },
      immediate: true,
    },
  },
  methods: {
    handleClose(val) {
      this.smartSocketDrawer = val;
    },
    ...mapMutations("detail", {
      addModal: "ADDMODAL",
      setDetailData: "SETDETAILDATA",
      setBindData: "SETBINDDATA",
    }),
    timeTransform(sec) {
      let d = Math.floor(sec / (60 * 60 * 24));
      let dh = sec % (60 * 60 * 24);
      let h = Math.floor(dh / (60 * 60));
      let ms = dh % (60 * 60);
      let m = Math.floor(ms / 60);
      let s = ms % 60;
      let timeStr = "";
      if (d) {
        timeStr += `${d}` + this.$t('common.day1');
      }
      if (h) {
        timeStr += `${h}` + this.$t('common.hour');
      }
      if (m) {
        timeStr += `${m}` + this.$t('common.minute1');
      }
      if (s) {
        timeStr += `${s}` + this.$t('common.second');
      }
      if (!timeStr) {
        timeStr = 0;
      }

      return timeStr;
    },

    handleUseStatisticsDateChange() {
      this.interval = 0;
    },

    // 显示/隐藏日程弹窗
    goIsFullcalendar() {
      this.isFullcalendar = !this.isFullcalendar
    },
    // 选择日程之后
    handleSetDate(time) {
      this.addModal({
        title: this.$t('labDevice.orderApply'),
        type: 1,
        userName: this.desc.operatorName,
        time
      });
    },

    // 探头名称编辑
    handleProbeNameEdit() {
      this.$refs.probeNameEdit.open(this.desc.id, 4)
    },
    // 当前被监测状态-刷新
    handleRefreshList() {
      this.getHardwareBinded(this.instrumentListId)
    },

    // 解绑标签
    handleUnbindLabel() {
      this.$confirm(this.$t('labDevice.unBindTagAndLadDevice'), this.$t('common.hint'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        getInstrumentUnbind({instrumentId: this.id}).then(res => {
          if (res.code) {
            if (res.code === 1) {
              this.$message.success(this.$t('common.unBindSuccess'));
              this.getBaseInfo(this.id)
            } else {
              this.$message.error(res.message)
            }
          } else {
            this.$message.error(res.message)
          }
        })
      }).catch(() => {
      });
    },

    handleSeeHistory() {
      this.$refs.SeeHistoryData.open(this.smartSocketIds[0]);
    },
    handleMaintenance() {
      this.addModal({
        title: this.$t('labDevice.addMaintenance'),
        type: 2,
      });
    },
    getCurrentMonth() {
      let year = new Date().getFullYear();
      let month = new Date().getMonth() + 1;
      if (month < 10) {
        month = "0" + month;
      }
      let myDate = new Date(year, month, 0);
      let startDate = year + "-" + month + "-01 00:00:00"; //上个月第一天
      let endDate = year + "-" + month + "-" + myDate.getDate() + " 23:59:00"; //上个月最后一天
      return [startDate, endDate];
    },

    handleSelectUseStatisticsDate() {
      this.useStatisticsDate = this.getCurrentMonth();
    },
    getStatusColor(status, arr) {
      let color = "";
      arr.map((a) => {
        if (a.code === status) {
          color = a.color;
        }
      });
      return color;
    },
    getStatusName(status, arr, type) {
      let str = "";
      arr.map((a) => {
        if (a.code === status) {
          str = a.label;
        }
      });
      // 绑定的智能硬件status小于0不等于-100报警
      if (type == 'hardwarebind' && status < 0 && status != -100) {
        str = this.$t('common.abnormal')
      }
      return str;
    },

    getStatusProto(status, proto, arr, type) {
      let c = "";
      arr.map((a) => {
        if (a.code === status) {
          c = a[proto];
        }
      });
      // 绑定的智能硬件status小于0不等于-100报警
      if (type == 'hardwarebind' && status < 0 && status != -100) {
        c = "#ff4949"
      }
      return c;
    },

    async getBaseInfo(id) {
      try {
        let obj = {};
        this.loading = true;
        const result = await getInstrumentDetail({id});
        if (result.code === STATUS_VALUE.NORMAL) {
          obj = result.items;
        } else {
          this.$message.error(result.message);
        }
        this.setDetailData({detailData: obj});
        this.desc = obj;
        this.detailType = obj.detailType || 1;
        this.loading = false;
      } catch (err) {
        this.loading = false;
        this.desc = {};
        this.setDetailData({detailData: {}});
        this.$message.error(this.$t('labDevice.detailedBasicInfoFailed'));
        throw err;
      }
    },

    async postInstrumentDeviceErrorStatisticsAsync(param) {
      ///instrument/deviceErrorStatistics
      try {
        let temp = [];
        let stemp = [
          {
            value: 0,
            name: this.$t('common.normal'),
          },
          {
            value: 0,
            name: this.$t('common.offLine'),
          },
          {
            value: 0,
            name: this.$t('common.abnormal'),
          },
        ];
        let result = await postInstrumentDeviceErrorStatistics(param);
        if (result.code === STATUS_VALUE.NORMAL) {
          let items = result.items;
          if (items.alarmList && items.alarmList.length > 0) {
            temp = items.alarmList;
            let list = items.alarmList;
            let alarmNum = list.reduce((pre, cur) => pre + cur.alarmNum, 0);
            let normalCount = list.reduce(
              (pre, cur) => pre + cur.normalCount,
              0
            );
            let offLineCount = list.reduce(
              (pre, cur) => pre + cur.offLineCount,
              0
            );
            stemp = [
              {
                value: normalCount,
                name: this.$t('common.normal'),
              },
              {
                value: offLineCount,
                name: this.$t('common.offLine'),
              },
              {
                value: alarmNum,
                name: this.$t('common.abnormal'),
              },
            ];
          }
        } else {
          this.$message.error(result.message);
        }
        this.deviceErrorStatisticsData = temp;
        this.deviceErrorStatisticsTotal = stemp;
      } catch (err) {
        this.deviceErrorStatisticsData = [];
        this.deviceErrorStatisticsTotal = [];
        this.$message.error(this.$t('labDevice.offlineAlarmAtatisticsFailed'));
        throw err;
      }
    },

    async getElectricityCustom(param) {
      try {
        let obj = {};
        let result = await postSmartSocketelectricityCustom(param);
        if (result.code === STATUS_VALUE.NORMAL) {
          obj = result.items;
        } else {
          this.$message.error(result.message);
        }
        this.useStatisticsCustomData = obj;
      } catch (err) {
        this.useStatisticsCustomData = {};
        this.$message.error(this.$t('labDevice.deviceUsageStatusFailed'));
        throw err;
      }
    },

    async getElectricityStatistics(param) {
      try {
        let obj = {};
        let result = await postSmartSocketElectricityStatistics(param);
        if (result.code === STATUS_VALUE.NORMAL) {
          obj = result.items;
          this.useStatisticsData = obj;
        } else {
          this.$message.error(result.message);
        }
        // if (this.desc.status != this.useStatisticsData.currentStatus) {
        //   this.desc.status = this.useStatisticsData.currentStatus
        // }
      } catch (err) {
        this.useStatisticsData = "";
        this.$message.error(this.$t('labDevice.deviceUsageStatusFailed'));
        throw err;
      }
    },

    // postSmartSocketElectricityConsumption,
    // postSmartSocketUsageDuration,
    // postSmartSocketUsageTimes,

    async postSmartSocketElectricityConsumptionAsync(obj) {
      const _ = this;
      try {
        let temp = [];
        let num = 0;
        let result = await postSmartSocketElectricityConsumption(obj);
        if (result.code == 1) {
          let {items} = result;
          num = items.total;
          if (items.list && items.list.length > 0) {
            temp = result.items.list;
          }
        }
        _.total = num;
        _.loading = false;
        _.dataSource = temp;
      } catch (err) {
        this.total = 0;
        _.dataSource = [];
        _.loading = false;
        _.$message.error(ERROR);
        throw err;
      }
    },

    async postSmartSocketUsageDurationAsync(obj) {
      const _ = this;
      try {
        let temp = [];
        let num = 0;
        let result = await postSmartSocketUsageDuration(obj);
        if (result.code == 1) {
          let {items} = result;
          num = items.total;
          if (items.list && items.list.length > 0) {
            temp = result.items.list;
          }
        }
        _.total = num;
        _.loading = false;
        _.dataSource = temp;
      } catch (err) {
        this.total = 0;
        _.dataSource = [];
        _.loading = false;
        _.$message.error(ERROR);
        throw err;
      }
    },
    async postSmartSocketUsageTimesAsync(obj) {
      const _ = this;
      try {
        let temp = [];
        let num = 0;
        let result = await postSmartSocketUsageTimes(obj);
        if (result.code == 1) {
          let {items} = result;
          num = items.total;
          if (items.list && items.list.length > 0) {
            temp = result.items.list;
          }
        }
        _.total = num;
        _.loading = false;
        _.dataSource = temp;
      } catch (err) {
        this.total = 0;
        _.dataSource = [];
        _.loading = false;
        _.$message.error(ERROR);
        throw err;
      }
    },

    async getHardwareBinded(instrumentId) {
      this.sensors = [];
      try {
        let temp = [];
        let result = await getInstrumentThingsList({instrumentId});
        if (result.code === STATUS_VALUE.NORMAL) {
          temp = result.items.list;
          this.sensors = arrayToHeavy(result.items.list, "no");
          // let temp = [
          //   { id: 1, name: "智能插座002", statusName: "正常" },
          //   { id: 2, name: "超低温记录仪", statusName: "断电" },
          // ];
          this.hardwarebindList = temp;
          let list = [];
          let ids = [];
          this.smartSocketIsBind = false;
          for (let i = 0; i < temp.length; i++) {
            if (temp[i].type === 10) {
              ids.push(temp[i].id);
              if (temp[i].isBind === 0) {
                this.smartSocketIsBind = true
              }
            }
            if (temp[i].sensors) {
              for (let j = 0, sensors = temp[i].sensors; j < sensors.length; j++) {
                list.push({
                  ...sensors[j],
                  ...sensors[j].sensorType,
                  hardware: temp[i].name,
                  encodeId: temp[i].encodeId,
                  types: temp[i].type,
                  isLook: temp[i].isLook,
                  isBind: temp[i].isBind
                });
              }
            }
            if (temp[i].type === 8) {
              list.push(temp[i]);
            }
            if (temp[i].isBind === 0) {
              this.isBindLength++
            }
          }
          this.smartSocketIds = ids;
          this.monitorList = list;
          if (temp.length > 0) {
            this.latestTime = temp[0].reportDate
          }
        } else {
          this.$message.error(result.message);
          this.smartSocketIds = [];
        }
        this.setBindData({
          bindDatas: temp,
        });
        this.bindDatas = temp
      } catch (err) {
        this.monitorList = [];
        this.smartSocketIds = [];
        this.setBindData({
          bindDatas: [],
        });
        this.$message.error(this.$t('labDevice.hardwareInfoFailed'));
        throw err;
      }
    },

    ...mapMutations({
      handleDrawerClose: "DRAWERCLOSE",
      handleDrawerOpen: "DRAWEROPEN",
    }),
    ...mapMutations("lab", {
      handleDrawerExpaned: "TOFULLSCREEN",
      handleDrawerFold: "EXITFULLSCREEN",
    }),

    handleExpaned() {
      this.handleDrawerClose();
      this.$router.push({
        name: "Detail",
        params: {
          id: this.detailId,
        },
      });
    },
    handleFolded() {
      this.handleDrawerFold();
      this.handleDrawerOpen();
    },
    handleShowAlarmScope(value) {
      return !DEVICE_ID[value];
    },

    goRecorderDetail(item) {
      this.handleDeviceDrawer({encodeId: item.encodeId, type: item.type === 8 ? 8 : item.types, isLook: item.isLook});
    },

    handleDateSelect() {
    },
    handleDeviceDrawer(item) {
      if (!item.isLook) {
        return this.$message.error(this.$t('system.NoPermission'));
      }
      switch (item.type) {
        case 0:
          this.deviceId = item.encodeId;
          this.deviceDrawer = true;
          break
        case 10:
          this.smartSocketId = item.encodeId;
          this.smartSocketDrawer = true;
          break
        case 8:
          this.outageAlarmId = item.encodeId;
          this.outageAlarmDrawer = true;
          break
        case 7:
          this.alerterId = item.encodeId;
          this.alerterDrawer = true;
          break
      }
    }
  },
};
</script>
<style lang="less" scoped>
@import "./index.less";


</style>
