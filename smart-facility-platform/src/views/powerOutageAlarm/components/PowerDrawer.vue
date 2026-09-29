<template>
  <div class="drawer">
    <el-drawer
        v-loading="$store.state.loading"
        :before-close="handleClose"
        :modal="false"
        :visible.sync="isDrawer"
        :with-header="false"
        element-loading-background="rgba(0, 0, 0, 0.8)"
        element-loading-spinner="el-icon-loading"
        :element-loading-text="$t('common.hintDefault')"
        size="70%">
      <div v-if="isDrawer" class="detail-container">
        <div class="detail-padding">
          <drawer-nav :deviceName="powerOutage.no" :name="powerOutage.name" :type="1" @handle="handleClose"/>
          <div class="detail-handle clearfix" v-if="$store.state.level">
            <div>
<!--              <el-button-->
<!--                  :disabled="powerOutage.powerFailure === 1 && powerOutage.status !== 0"-->
<!--                  class="margin-small-right" type="danger"-->
<!--                  @click="handleInvalidateAlarm">-->
<!--                  {{ removeAlarm ? $t('hardware.removedAlarm') : $t('hardware.removeAlarm') }}-->
<!--              </el-button>-->
              <el-switch
                  v-if="$store.state.level"
                  v-model="closeAlarmFlag"
                  :disabled="powerOutage.status === 0"
                  class="margin-small-right"
                  :inactive-text="$t('hardware.acousticOptic')"
                  @change="handleAlarmPowerOutage"
              ></el-switch>
              <el-switch
                  v-if="$store.state.level"
                  v-model="closeSystemAlarm"
                  :inactive-text="$t('hardware.alarmPlatform')"
                  @change="handleCloseSystemAlarm"
              ></el-switch>
            </div>
            <div>
              <el-button @click="handleDropdownMenu('UpdateExportTime')">{{ $t('hardware.exportTime') }}
              </el-button>
              <el-button @click="handleDropdownMenu('UpdateAlarmTime')">{{ $t('hardware.alarmTime') }}
              </el-button>
            </div>
          </div>
          <el-descriptions :title="$t('common.basicInformation')">
            <template v-if="$store.state.level" #extra>
              <el-button @click="handleDropdownMenu('ReturnCommand')" class="icon-information">&nbsp;{{ $t('hardware.returnCommand') }}
              </el-button>
              <el-button type="primary" class="icon-edit" @click="handleDropdownMenu('UpdateDepartment')">&nbsp;{{ $t('common.edit') }}
              </el-button>
            </template>
          </el-descriptions>
          <div class="layout-row">
            <div style="margin-right: 24px">
              <device-status-garden
                  :type="1"
                  :status="powerOutage.powerFailure === 1 ? 1 : -1"
                  :status-str="powerOutage.powerFailure === 1 ? $t('hardware.aboutage') : $t('hardware.outage')"/>
            </div>
            <div>
              <el-descriptions :column="2">
                <el-descriptions-item :label="$t('common.no')">{{ powerOutage.no }}</el-descriptions-item>
                <el-descriptions-item :label="$t('common.companyName')">{{ companyName }}</el-descriptions-item>
                  <el-descriptions-item :label="$t('common.owningDepartment')">{{ powerOutage.departmentName }}</el-descriptions-item>
                  <el-descriptions-item :label="$t('hardware.reportDate')">{{ powerOutage.reportDate | localToUtc }}</el-descriptions-item>
                  <el-descriptions-item :label="$t('hardware.exportTime')">{{ powerOutage.reportingInterval }}{{ $t('common.minute') }}</el-descriptions-item>
                  <el-descriptions-item :label="$t('hardware.alarmTime')">{{ powerOutage.alarmInterval }}{{ $t('common.minute') }}</el-descriptions-item>
                  <el-descriptions-item :label="$t('hardware.signalStrength1')">
                      <div v-html="handleSignalStateFilter(powerOutage.signalStrength)"/>
                  </el-descriptions-item>
                  <el-descriptions-item :label="$t('common.creatDate')">{{ powerOutage.createDate | localToUtc }}</el-descriptions-item>
                  <el-descriptions-item :label="$t('hardware.lineStatus')">
                <span :class="[0, 1].includes(powerOutage.status)? '' : 'abnormal'">
                  {{ powerOutage.status === $STATUS.NORMAL ? $t('common.isLine') : $t('common.offLine') }}
                </span>
                  </el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
          <el-row v-if="bingThings.length">
            <el-col :lg="4">
              <el-descriptions :title="$t('hardware.bindThings')"></el-descriptions>
            </el-col>
            <a v-for="item in bingThings"
               :key="item.id"
               class="margin-small-right"
               @click="handleDeviceDrawer(item)">
              <span>{{ item.name }}</span>
            </a>
          </el-row>
        </div>
        <div class="detail-padding-nocolor">
          <el-descriptions
              :title="$t('hardware.newStatus') + ' （'+$t('hardware.detectionDate')+'：'+ (powerOutage.reportDate ? $options.filters['localToUtc'](powerOutage.reportDate) : '') +'）'"
              class="margin-center">
          </el-descriptions>
          <div class="new-state">
            <div
                :class="handleBgColor(powerOutage)"
                class="state">
              <div class="name">{{ $t('hardware.powerFailure') }}</div>
              <div :class="handleStatusColor(powerOutage).color" class="clearfix">
                <span>{{ powerOutage.powerFailure === 1 ? $t('hardware.aboutage') : $t('hardware.outage') }}</span>
                <span class="icon" :class="handleStatusColor(powerOutage).icon"></span>
              </div>
            </div>
          </div>
        </div>
        <div class="detail-padding">
          <el-descriptions class="margin-center" :title="$t('hardware.monitorMessage')">
            <template v-if="$store.state.level" slot="extra">
              <el-select
                  v-model="historyTimeInterval"
                  class="select-change1 margin-small-right"
                  filterable
                  @change="handleHistoryDeviceCharts"
                  :placeholder="$t('common.placeholder')">
                <el-option
                    v-for="(item) in timeInterval"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id">
                </el-option>
              </el-select>
              <el-button type="primary" @click="handleHistoryData" class="icon-query-data">&nbsp;{{ $t('hardware.seeHistroy') }}</el-button>
            </template>
          </el-descriptions>
          <el-divider/>
          <div class="charts-type">
            <div>
              <el-button class="is-active">
                  {{ $t('other.powerDetection') }}
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
              <el-button @click="handleCustomTime">{{ $t('common.custom') }}</el-button>
              <el-button class="el-icon-refresh" @click="handleNewChartsData"></el-button>
            </div>
          </div>
          <line-mark-chart :data-charts="dataCharts"/>
        </div>
        <div class="detail-padding-nocolor">
          <el-descriptions class="margin-center" :title="$t('hardware.users')">
            <template v-if="$store.state.level" slot="extra">
              <el-button type="primary" @click="handleSetPrincipal" class="icon-staff-settings">&nbsp;{{ $t('common.addPrincipal') }}</el-button>
            </template>
          </el-descriptions>
          <principal-table :equipment-users="equipmentUsers" :items="principalItems" :loading="loading"
                           :total="principalTotal" @change="handleEquipmentUsers"/>
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
          <el-descriptions :title="$t('hardware.alarmLog')"/>
          <el-tabs v-model="sensorsType">
            <el-tab-pane v-for="item in tabs" :key="item.name" :label="item.label" :name="item.name">
              <AlarmTable
                  :is-column="1000"
                  :items="items"
                  :loading="item.loading"
                  :table-data="item.data"
                  :total="total"
                  @handle="handleAlarmProcess"/>
            </el-tab-pane>
            <el-tab-pane :label="$t('labDevice.myAlarm')" name="thirdly">
              <el-table
                  v-loading="alarmLoading"
                  :data="alarmMessages"
                  :row-height="40"
                  border
                  class="mt8">
                <el-table-column label="#" width="70px" type="index">
                  <template v-slot="scope">
            <span v-if="`${total !== 0}`">{{
                (items.pageNum - 1) * items.pageSize + scope.$index + 1
              }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                    :show-overflow-tooltip="true"
                    :label="$t('hardware.alarmType')">
                  <template v-slot="scope">
                    {{ handleSensorType(scope.row.sensorType) }}
                  </template>
                </el-table-column>
                <el-table-column :label="$t('labDevice.alarmStartTime')" min-width="150" prop="createDate" sortable>
                    <template v-slot="{row}">
                        {{ row.createDate | localToUtc }}
                    </template>
                </el-table-column>
                <el-table-column
                    :show-overflow-tooltip="true"
                    :label="$t('common.receptionUse')"
                    prop="userName"/>
                <el-table-column
                    :show-overflow-tooltip="true"
                    :label="$t('common.receptionType')"
                    prop="value">
                  <template v-slot="scope">
                    <div v-for="(item, index) in scope.row.receptionList" :key="index">
                      {{ item }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('common.receptionTime')" min-width="150" prop="messageDate" sortable>
                    <template v-slot="{row}">
                        {{ row.messageDate | localToUtc }}
                    </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
          <div class="paging">
            <pagination
                v-show="total > 10"
                :limit.sync="items.pageSize"
                :page.sync="items.pageNum"
                :total="total"
                @pagination="handleHistoryAlarm"/>
          </div>
        </div>
      </div>
    </el-drawer>
    <SetPrincipal ref="SetPrincipal" @handle="handleEquipmentUsers"/>
    <UpdateAlarmTime ref="UpdateAlarmTime" @handle="handleUpdate"/>
    <UpdateExportTime ref="UpdateExportTime" @handle="handleUpdate"/>
    <AlarmProcessing ref="AlarmProcessing" @handle="handleHistoryAlarm"/>
    <return-command ref="ReturnCommand"/>
    <CustomTime ref="CustomTime" @handle="handleGetTime"/>
    <SeeHistoryData :type="1" ref="SeeHistoryData"/>
    <UpdateDepartment
        ref="UpdateDepartment"
        @handle="handleUpdate"/>
<!--    <instrument-drawer v-if="instrumentId">-->
<!--      <drawer-page v-if="instrumentId" :detail-id="instrumentId"/>-->
<!--    </instrument-drawer>-->
      <LabDeviceDrawer :id="instrumentId" :is-drawer.sync="labDeviceDrawer" />

      <alerter-drawer :id.sync="alerterId" :is-drawer.sync="alerterDrawer"/>
    <room-drawer :is-drawer.sync="roomDrawer" :roomId.sync="roomId"/>

  </div>
</template>

<script>
import AlarmTable from "@/components/AlarmTable";
import SetPrincipal from "@/components/SetPrincipal"
import {getPowerInvalidateAlarm} from "@/api/powerOutage";
import {getEquipmentUserList, removeEquipmentUser} from "@/api/user";
import moment from "moment";
import {historyTimeInterval, items, TIME_DIMENSION, TIME_FORMAT} from "@/utils/constant";
import {
  getAlarmHistoryDevice,
  getDeviceBinding,
  getDeviceDetail,
  getHistoryDeviceAlarm,
  getHistoryDeviceChart,
  updateAlarmLight,
  updateCloseAlarmSystem
} from "@/api/device";
import Pagination from "@/components/Pagination";
import AlarmProcessing from "@/views/device/components/AlarmProcessing";
import UpdateAlarmTime from "@/views/device/components/UpdateAlarmTime";
import UpdateExportTime from "@/views/device/components/UpdateExportTime";
import PrincipalTable from "@/components/PrincipalTable";
import ReturnCommand from "@/views/device/components/ReturnCommand";
import UpdateDepartment from "@/views/device/components/UpdateDepartment";
import SeeHistoryData from "@/views/device/components/SeeHistoryData";
import CustomTime from "@c/CustomTime/index";
import LineMarkChart from "@c/LineMarkChart/index";
import DrawerNav from "@c/DrawerNav/index";
import {mapMutations} from "vuex";
import {sensorType, signalStateFilter} from "@/utils/methods";
import DeviceStatusGarden from "@c/DeviceStatusGarden/index";
import LabDeviceDrawer from "@/views/labDevice/components/LabDeviceDrawer";
import {ALERTOR_STATUS} from "../../../utils/constant";

export default {
  name: "PowerDrawer",
  components: {
    UpdateExportTime,
    UpdateAlarmTime,
    AlarmProcessing,
    AlarmTable,
    Pagination,
    SetPrincipal,
    PrincipalTable,
    UpdateDepartment,
    ReturnCommand,
    SeeHistoryData,
    DeviceStatusGarden,
    LineMarkChart,
    CustomTime,
    RoomDrawer: () => import("@/views/room/components/RoomDrawerNew"),
    instrumentDrawer: () => import("@c/Drawer/index"),
    AlerterDrawer: () => import("@/views/alarmAcousto/components/AlerterDrawer"),
    DrawerPage: () => import("@/views/detail/index"),
    DrawerNav,
      LabDeviceDrawer,

  },
  props: {
    id: {
      type: [String, Number],
      default: null,
    },
    isDrawer: {
      type: Boolean,
      default: false
    }
  },
  data() {
      const _this = this;
    return {
      router: {
        name: "1",
        id: "",
        title: ""
      },
      removeAlarm: false,
      equipmentUsers: [],
      loading: false,
      sensorsType: "first",
      dimensions: TIME_DIMENSION,
      tabs: [
        {label: _this.$t('other.alarm1'), loading: false, name: "first", data: []},
        {label: _this.$t('common.offLineAlarm'), loading: false, name: "second", data: []},
      ],
      items: {
        pageSize: items.PAGE_SIZE,
        pageNum: items.PAGE_NUM
      },
        labDeviceDrawer: false,
      total: 0,
      principalTotal: 0,
      historyTimeInterval: 1,
      timeInterval: historyTimeInterval,
      principalItems: {
        pageNum: items.PAGE_NUM,
        pageSize: items.PAGE_SIZE,
        equipmentId: "",
        equipmentType: "DEVICE",
      },
      closeAlarmFlag: false,
      closeSystemAlarm: false,
      companyName: "",
      alarmLoading: false,
      alarmMessages: [],
      dataCharts: {
        columns: ["createDate", "data"],
        rows: [],
        loading: false,
        name: _this.$t('other.powerDetection'),
        unit: "",
        type: 17,
        max: 1,
        min: 0,
      },
      interval: 4,
      beginTime: "",
      createDate: "",
      endTime: "",
      deviceName: "",
      powerOutage: {},
      bingThings: [],
      roomDrawer: false,
      roomId: null,
      instrumentId: false,
      alerterDrawer: false,
      alerterId: "",
      lightDisabled: false,
    }
  },
  watch: {
    sensorsType() {
      this.handleHistoryAlarm();
    },
    isDrawer: {
      handler: function (newValue) {
        if (newValue) {
          this.sensorsType = "first";
          getDeviceDetail({deviceId: this.id}).then(res => {
            if (res.code) {
              this.powerOutage = res.items;
              this.router.title = this.powerOutage.name;
              this.principalItems.equipmentId = this.powerOutage.id;
              this.handleInit();
            }
          })
        }
      },
      deep: true
    },
    lightDisabled: function (newValue) {
      this.setLoading(newValue);
    }
  },
  created() {
    // 异步加载组件时执行
    this.sensorsType = "first";
    // getDeviceDetail({deviceId: this.id}).then(res => {
    //   if (res.code) {
    //     this.powerOutage = res.items;
    //     this.router.title = this.powerOutage.name;
    //     this.principalItems.equipmentId = this.powerOutage.id;
    //     this.handleInit();
    //   }
    // })
  },
  methods: {
    ...mapMutations(['setLoading']),
    async handleInit() {
      await this.handleEquipmentUsers();
      this.handleHistoryAlarm();
      getDeviceBinding({equipmentIdStr: this.id}).then(res => {
        if (res.code) {
          this.bingThings = res.items;
        }
      })
      this.closeAlarmFlag = !this.powerOutage.closeSoundLightAlarm;
      this.closeSystemAlarm = !this.powerOutage.closeSystemAlarm;
      this.companyName = JSON.parse(localStorage.getItem("USERINFO")).companyName;
      this.handleHistoryDeviceCharts();
    },
    handleSignalStateFilter(data) {
      return signalStateFilter(data, "dBm", -82, -72, 0);
    },
    handleHistoryData() {
      const array = [{idx: 14, sensorType: {name: this.$t('other.powerDetection'), unit: ""}}]
      this.$refs.SeeHistoryData.open(
          this.powerOutage.id,
          array,
          this.powerOutage.name,
          1
      );
    },
    handleGetTime(val) {
      this.interval = null;
      this.dataCharts.rows = [];
      this.beginTime = moment(val[0]).format(TIME_FORMAT);
      this.endTime = moment(val[1]).format(TIME_FORMAT);
      this.handleHistoryDeviceCharts();
    },
    handleCutTime(value) {
      this.interval = value;
      this.endTime = this.beginTime = "";
      this.dataCharts.rows = [];
      this.handleHistoryDeviceCharts();
    },
    handleCustomTime() {
      this.$refs.CustomTime.open();
    },
    handleNewChartsData() {
      this.dataCharts.rows = [];
      this.handleHistoryDeviceCharts();
    },
    handleSensorType(value) {
      return sensorType(value);
    },
    handleHistoryDeviceCharts() {
      this.dataCharts.loading = true;
      getHistoryDeviceChart({
        deviceId: this.powerOutage.id,
        idx: 14,
        beginTime: this.beginTime,
        endTime: this.endTime,
        interval: this.interval,
        productId: this.productId,
        historyTimeInterval: this.historyTimeInterval,
        createDate: this.createDate,
        type: 1,
        thingsType: 1
      }).then(res => {
        this.dataCharts.loading = false;
        if (res.code) {
          this.dataCharts.rows = res.items.list;
        } else {
          this.$message.error(res.message);
        }
      })
    },
    handleDropdownMenu(e) {
      this.$refs[e].open(0, this.powerOutage);
    },
    handleUpdateAlarmTime() {
      this.$refs.UpdateAlarmTime.open(0, this.powerOutage);
    },
    handleUpdate() {
      this.$parent.getList();
    },
    handleCloseSystemAlarm() {
      updateCloseAlarmSystem({
        id: this.powerOutage.id,
        closeSystemAlarm: this.closeSystemAlarm ? 0 : 1
      }).then(res => {
        if (res.code) {
          this.$parent.getList();
          this.$message({
            type: "success",
            message: this.$t('common.operateSuccess'),
            duration: 2000
          });
        } else {
          this.$message.error(res.message);
          this.closeSystemAlarm = !this.powerOutage.closeSystemAlarm;
        }
      })
    },
    handleAlarmPowerOutage() {
      this.lightDisabled = true;
      updateAlarmLight({
        id: this.powerOutage.id,
        closeSoundLightAlarm: this.closeAlarmFlag ? 0 : 1
      }).then(res => {
        this.lightDisabled = false;
        if (res.code) {
          this.$parent.getList();
          this.$message({
            type: "success",
            message: this.$t('common.operateSuccess'),
            duration: 2000
          });
        } else {
          this.$message.error(res.message);
          this.closeAlarmFlag = !this.closeAlarmFlag;
        }
      })
    },
    handleEquipmentUsers() {
      getEquipmentUserList(this.principalItems).then(res => {
        const {pageNum, total, list} = res.items;
        this.equipmentUsers = list;
        if (pageNum === items.PAGE_NUM) {
          this.principalTotal = total;
        }
      });
    },
    handleHistoryAlarm() {
      if (this.sensorsType === "thirdly") {
        this.alarmLoading = true;
        this.alarmMessages = [];
        getHistoryDeviceAlarm({
          deviceId: this.powerOutage.id,
          pageNum: this.items.pageNum,
          pageSize: this.items.pageSize,
          thingsType: 1
        }).then(res => {
          if (res.code) {
            this.alarmLoading = false;
            this.alarmMessages = res.items.list;
            if (res.items.pageNum === items.PAGE_NUM) {
              this.total = res.items.total;
            }
          }
        })
      } else {
        let type = this.sensorsType === "first" ? 2000 : 1000;
        this.sensorsType === "first" ? this.tabs[0].loading = true : this.tabs[1].loading = true;
        getAlarmHistoryDevice({
          deviceId: this.powerOutage.id,
          pageNum: this.items.pageNum,
          pageSize: this.items.pageSize,
          type,
          thingsType: 1
        }).then(res => {
          if (res.code) {
            const {list, total} = res.items;
            this.sensorsType === "first" ? (this.tabs[0].data = list) : (this.tabs[1].data = list);
            if (res.items.pageNum === items.PAGE_NUM) {
              this.total = total;
            }
          } else {
            this.$message.error(res.message);
          }
          this.sensorsType === "first" ? this.tabs[0].loading = false : this.tabs[1].loading = false;
        })
      }

    },
    handleClose() {
      this.$emit("update:isDrawer", false);
    },
    handleInvalidateAlarm() {
      this.$message({
        type: "warning",
        duration: 500,
        message: this.$t('hardware.sendRpc')
      })
      getPowerInvalidateAlarm({no: this.powerOutage.no}).then(res => {
        if (res.code) {
          this.$message.success(this.$t('common.operateSuccess'));
          this.removeAlarm = true;
        } else {
          this.$message.error(res.message);
        }
      })
    },
    handleSetPrincipal() {
      this.$refs.SetPrincipal.open(0, this.powerOutage.id);
    },
    handleAlarmSystem(row) {
      this.$refs.AlarmSystem.open(row);
    },
    handleTimeQuantum(from, to, timeFlag) {
      return (
          moment(from).format("HH:mm:ss") +
          "~" +
          moment(to).format("HH:mm:ss") +
          (timeFlag ? "（"+ this.$t('common.abnormal') +"）" : "（"+ this.$t('hardware.alarmArray00') +"）")
      );
    },
    handleDeleteEquipmentUsers(row) {
        this.$confirm(this.$t('common.deletePrincipalMessage1') + row.userName + this.$t('common.deletePrincipalMessage2'), this.$t('common.deletePrincipal'), {
            type: "warning",
            confirmButtonText: this.$t('common.confirm'),
            cancelButtonText: this.$t('common.cancel')
      }).then(() => {
        removeEquipmentUser({
          equipmentId: row.equipmentId,
          userId: row.userId,
          type: row.type
        }).then(res => {
          if (res.code) {
            this.$message.success(this.$t('common.deleteSuccess'));
            this.handleGetEquipmentUser();
          } else {
            this.$message.error(res.message);
          }
        })
      }).catch(() => {
        this.$message.info(this.$t('common.deleteCanceled'));
      })
    }
    ,
    alarmType(index) {
      if (index === -1) {
        return this.$t('hardware.alarmArray00');
      }
      if (index === 0) {
        return this.$t('hardware.alarmArray1');
      }
      if (index > 0) {
        return this.$t('hardware.alarm2') + index + this.$t('hardware.alarm3');
      }
    },
    handleAlarmProcess(row) {
      this.$refs.AlarmProcessing.open(row);
    },
    ...mapMutations({
      handleDrawerOpen: "DRAWEROPEN",
    }),
    handleDeviceDrawer(item) {
      switch (item.type) {
        case 4:
          this.instrumentId = item.id;
          this.labDeviceDrawer = true;
          this.handleDrawerOpen();
          break
        case 7:
          this.alerterDrawer = true;
          this.alerterId = item.strId;
          break
        case 11:
          this.roomId = item.id;
          this.roomDrawer = true;
          break
      }
    },
      handleStatusColor(item) {
          if (item.status == 0) {
              return {color: "normal", icon: "icon-normal"};
          } else if (item.status == -100) {
              return {color: "abnormal", icon: "icon-warning-line"};
          } else if (item.status == 1) {
              if (item.powerFailure === ALERTOR_STATUS.NORMAL) {
                  return {color: "normal", icon: "icon-normal"};
              } else {
                  return {color: "abnormal", icon: "icon-warning-line"};
              }
          } else {
              return {color: "normal", icon: "icon-normal"};
          }
      },
      handleBgColor(item) {
          if (item.status == 0) {
              return "normal-background";
          } else if (item.status == -100) {
              return "abnormal-background";
          } else if (item.status == 1) {
              if (item.powerFailure === ALERTOR_STATUS.NORMAL) {
                  return "normal-background";
              } else {
                  return "abnormal-background";
              }
          }
      }
  },
  beforeDestroy() {
    this.$emit("id:update", "")
  }
}
</script>

<style lang="less" scoped>
.power-outage {
  font-size: 26px;
}

.state {
  width: 320px;
  height: 100px;
  padding: 20px 20px 0 30px;
  font-weight: 600;
  font-size: 36px;
  line-height: 36px;
  border-radius: 8px;
  margin-left: 20px;
  margin-bottom: 20px;

  .name {
    font-size: 14px;
    line-height: 14px;
    margin-bottom: 10px;
  }
}
.icon {
  font-size: 36px;
}
</style>
