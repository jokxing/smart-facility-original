<template>
  <div>
    <div class="detail-padding">
      <DrawerNav :name="device.name" :deviceName="device.no" @handle="handleClose"/>
      <div class="detail-handle clearfix" v-if="$store.state.level">
        <div>
          <el-switch
              v-if="$store.state.level"
              v-model="device.closeSoundLightAlarm"
              :disabled="device.status === 0"
              class="margin-small-right"
              :inactive-text="$t('hardware.acousticOptic')"
              @change="handleAcoustoOpticAlarm"
          ></el-switch>
          <el-switch
              v-if="$store.state.level"
              v-model="device.closeSystemAlarm"
              :disabled="systemDisabled"
              :inactive-text="$t('hardware.alarmPlatform')"
              @change="handlePlatformAlarm"
          ></el-switch>
        </div>
        <div style="margin-right: -10px">
            <el-button v-if="titleType != 10" @click="handleBatchUpdateUseStatus($refs.changeUseStatus)">{{ $t('hardware.fixUseStatus') }}</el-button>
            <el-button @click="handleDropdownMenu('UpdateExportTime')">{{ $t('hardware.exportTime') }}
          </el-button>
          <el-button @click="handleDropdownMenu('UpdateAlarmTime')">{{ $t('hardware.alarmTime') }}
          </el-button>
          <el-button :disabled="device.status === 0" class="margin-small-right"
                     @click="handleDropdownMenu('UpdateAlarmRules')">{{ $t('hardware.alarmRules') }}
          </el-button>
        </div>
      </div>
      <el-descriptions :title="$t('common.basicInformation')">
        <template v-if="$store.state.level" slot="extra">
          <el-button v-if="device.wifiFlag" :disabled="device.status === 0" @click="handleDropdownMenu('NetworkConfiguration')">
              {{ $t('hardware.networkConfiguration') }}
          </el-button>
          <el-button
              v-if="titleType === 10"
              @click="handleDropdownMenu('StandbyPower')">{{ $t('other.runParam') }}
          </el-button>
          <el-button class="icon-information" @click="handleDropdownMenu('ReturnCommand')">&nbsp;{{ $t('hardware.returnCommand') }}
          </el-button>
          <el-button type="primary" class="icon-edit" @click="handleDropdownMenu('UpdateDepartment')">&nbsp;{{ $t('common.edit') }}
          </el-button>
        </template>
      </el-descriptions>
      <div class="layout-row">
        <div style="margin-right: 24px">
          <device-status-garden
              :status.sync="device.status"
              :status-str.sync="device.statusStr === '未激活' ? $t('hardware.notActivate') : device.statusStr"/>
        </div>
        <div>
          <el-descriptions :column="3">
            <el-descriptions-item :label="$t('hardware.devciceNo')">
              {{ device.no }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('common.creatDate')">
              {{ device.createDate }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('common.owningDepartment')">
              {{ device.departmentName }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('hardware.alarmTime')">
              {{ device.alarmInterval + $t('common.minute') }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('hardware.exportTime')">
              {{ device.reportingInterval + $t('common.minute') }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('hardware.signalStrength1')">
              <div v-html="handleSignalStateFilter(device.signalStrength)"/>
            </el-descriptions-item>
            <el-descriptions-item :label="$t('hardware.networkMode')">
              {{ device.networkMode }}
            </el-descriptions-item>
            <el-descriptions-item v-if="titleType === 10" :label="$t('other.powerStatus')"
            >{{ (device["standPower"] ? device.standPower : 0) + "W" }}
            </el-descriptions-item>
            <el-descriptions-item v-if="device.panId" label="PanId">
              {{ device.panId }}
            </el-descriptions-item>
            <el-descriptions-item v-if="titleType !== 10" :label="$t('hardware.kwh')">
              {{ device.battery + "V" }}
            </el-descriptions-item>
            <el-descriptions-item
                v-for="(item, index) in sensors"
                :key="index"
                :label="item['sensorType'] ? item.sensorType.name : ''">
            <span :class="handleColor(item)" v-text="handleSensor(item)">
            </span>
            </el-descriptions-item>
          </el-descriptions>
          <el-descriptions>
            <el-descriptions-item :label="$t('hardware.users')">
            <span v-for="(item, index) in equipmentUsers" :key="item.id">
              <span>{{ item.userName }}</span>
              <span v-if="handleShowSlash(index)" class="margin-small">/</span>
            </span>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
      <el-row v-if="bingThings.length && bingThings[0].name">
        <el-col :lg="3">
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
      <el-descriptions :title="newTitleTime">
        <template slot="extra">
          <el-button @click="handleCurrent" class="icon-reset">&nbsp;{{ $t('hardware.reset') }}</el-button>
        </template>
      </el-descriptions>
      <div class="new-state">
        <el-row :gutter="20">
          <el-col v-for="(item, index) in sensors" :key="index" :sm="8" :xl="6">
            <hardware-state :data="item"/>
          </el-col>
        </el-row>
      </div>
    </div>
    <slot name="power"></slot>
    <div class="detail-padding">
      <device-monitor-message
          v-if="sensors.length"
          :default-name="device.name"
          :is-tab="false"
          :sensors.sync="sensors"/>
    </div>
    <div class="detail-padding-nocolor">
      <el-descriptions :title="$t('hardware.users')">
        <template v-if="$store.state.level" slot="extra">
          <el-button class="icon-staff-settings" type="primary" @click="handleSetPrincipal">
            &nbsp;{{ $t('common.addPrincipal') }}
          </el-button>
        </template>
      </el-descriptions>
      <principal-table :total="principalTotal" :items="principalItems" :equipment-users="equipmentUsers" :loading.sync="loading"/>
      <div class="paging" v-if="principalTotal > 10">
        <pagination
            v-show="principalTotal > 10"
            :limit.sync="principalItems.pageSize"
            :page.sync="principalItems.pageNum"
            :total="principalTotal"
            @pagination="handleEquipmentUsers"/>
      </div>
    </div>
    <div class="detail-padding">
      <el-descriptions :title="$t('hardware.alarmLog')"></el-descriptions>
      <history-alarm-record :type="1" v-if="sensors.length" :is-tab="false" :sensors.sync="sensors"/>
    </div>
      <div class="detail-padding-nocolor" v-if="titleType != 10">
          <el-descriptions :title="$t('hardware.useStatusLog')"></el-descriptions>
          <self-table
              :columns="columns"
              :loading="useLoading"
              :total="useTotal"
              :page-num="useItems.pageNum"
              :page-size="useItems.pageSize"
              :tabledata="useStatusList"
              @pageNumChange="handlePageNumChange"
              @pageSizeChange="handlePageSizeChange"
          >
              <el-table-column slot="beforeChangeStatus" :label="$t('hardware.afterStatus')" width="100">
                  <template v-slot="{row}">
                                <span :class="deviceUseStatus[row.beforeChangeStatus].className">
                                    {{ deviceUseStatus[row.beforeChangeStatus].str }}
                                </span>
                  </template>
              </el-table-column>
              <el-table-column slot="startDate" :label="$t('labDevice.handleTime')" width="160">
                  <template v-slot="{row}">
                                <span>
                                    {{ row.startDate | localToUtc }}
                                </span>
                  </template>
              </el-table-column>
          </self-table>
      </div>
      <UpdateDepartment
        ref="UpdateDepartment"
        @getList="handleUpdate"/>
    <UpdateAlarmTime ref="UpdateAlarmTime" @handle="handleUpdate"/>
    <UpdateExportTime ref="UpdateExportTime" @handle="handleUpdate"/>
    <UpdateAlarmPlatform ref="UpdateAlarmPlatform"/>
    <UpdateAcousticOptic ref="UpdateAcousticOptic"/>
    <SetPrincipal
        ref="SetPrincipal"
        @handle="handleEquipmentUsers"/>
    <UpdateAlarmRules ref="UpdateAlarmRules" @handle="handleUpdate"/>
    <StandbyPower ref="StandbyPower" @handle="handleUpdate"/>
    <return-command ref="ReturnCommand"/>
    <signal-source-drawer
        v-if="isSignal"
        :id.sync="signalId"
        :is-drawer.sync="isSignal"/>
    <alerter-drawer :id.sync="alerterId" :is-drawer.sync="alerterDrawer"/>
    <network-configuration ref="NetworkConfiguration"/>
    <!-- 开通2.0打开新详情 -->
    <RoomDrawerNew :isDrawer.sync="isRoomDrawerNew" :roomId.sync="roomId" />
    <LabDeviceDrawer :id="instrumentId" :is-drawer.sync="labDeviceDrawer" />
    <!-- 没开通2.0打开旧详情 -->
    <instrument-drawer v-if="instrumentId">
     <drawer-page v-if="instrumentId" :detail-id="instrumentId"/>
    </instrument-drawer>
      <change-use-status ref="changeUseStatus" @handle="handleUpdate"/>
      <RoomDrawer :isDrawer.sync="isRoomDrawer" :roomId.sync="roomId" />
  </div>
</template>

<script>
import DeviceMonitorMessage from "@c/DeviceMonitorMessage/index"
import HardwareState from "@c/HardwareState/index";
import StandbyPower from "@/views/smartSocket/components/StandbyPower";
import {
    getDeviceBinding,
    getDeviceDetail, getUseStatusQuery, updateAlarmLight, updateCloseAlarmSystem,
} from "@/api/device";
import {
  getDetectHistory,
} from "@/api/detect";
import {getEquipmentUserList} from "@/api/user";
import SelfTable from "@c/Table";
import {
    ALERTOR_STATUS, DEVICE_USE_STATUS,
    items, STATUS_VALUE,
} from "@/utils/constant";
import Pagination from "@c/Pagination/index";
import LineMarkChart from "@c/LineMarkChart/index";
import AlarmTable from "@c/AlarmTable/index";
import PrincipalTable from "@c/PrincipalTable/index";
import UpdateDepartment from "@/views/device/components/UpdateDepartment";
import UpdateAlarmTime from "@/views/device/components/UpdateAlarmTime";
import UpdateExportTime from "@/views/device/components/UpdateExportTime";
import UpdateAlarmPlatform from "@/views/device/components/UpdateAlarmPlatform";
import UpdateAcousticOptic from "@/views/device/components/UpdateAcousticOptic";
import SetPrincipal from "@c/SetPrincipal/index";
import UpdateAlarmRules from "@/views/device/components/UpdateAlarmRules";
import {signalStateFilter} from "@/utils/methods";
import ReturnCommand from "@/views/device/components/ReturnCommand";
import HistoryAlarmRecord from "@c/HistoryAlarmRecord";
import {mapMutations} from "vuex";
import DrawerNav from "@c/DrawerNav/index";
import DeviceStatusGarden from "@c/DeviceStatusGarden"
import NetworkConfiguration from "@/views/device/components/NetworkConfiguration";
import RoomDrawerNew from "@/views/room/components/RoomDrawerNew";
import LabDeviceDrawer from "@/views/labDevice/components/LabDeviceDrawer";
import ChangeUseStatus from "@/views/device/components/changeUseStatus";

let time = null;
export default {
  name: "index",
  components: {
    NetworkConfiguration,
    HistoryAlarmRecord,
    ReturnCommand,
    DeviceStatusGarden,
    UpdateAlarmRules,
    SetPrincipal,
    UpdateAcousticOptic,
    UpdateAlarmPlatform,
    UpdateExportTime,
    AlerterDrawer: () => import("@/views/alarmAcousto/components/AlerterDrawer"),
    UpdateAlarmTime,
    UpdateDepartment,
    DeviceMonitorMessage,
    PrincipalTable,
    HardwareState,
    Pagination,
    LineMarkChart,
    AlarmTable,
    StandbyPower,
    SignalSourceDrawer: () => import("@/views/signalSource/components/SignalSourceDrawer"),
    RoomDrawerNew,
    LabDeviceDrawer,
      ChangeUseStatus,
      RoomDrawer: () => import("@/views/room/components/RoomDrawer"),
    instrumentDrawer: () => import("@c/Drawer/index"),
    DrawerPage: () => import("@/views/detail/index"),
    DrawerNav,
    SelfTable,
  },
  props: {
    titleType: {
      type: Number,
      default: 0,
    },
    id: {
      type: [String, Number],
      default: null,
    },
  },
  data() {
      const _this = this;
    return {
      device: {},
      equipmentUsers: [],
      sensors: [],
      loading: false,
      principalItems: {
        pageSize: items.PAGE_SIZE,
        pageNum: items.PAGE_NUM,
      },
      principalTotal: 0,
      alarmMessages: [],
      alarmLoading: false,
      alarmItems: {
        pageSize: items.PAGE_SIZE,
        pageNum: items.PAGE_NUM,
      },
      alarmTotal: 0,
      closeSoundLightAlarm: false,
      closeSystemAlarm: false,
      idx: null,
      detects: [],
      detectLoading: false,
      isColumn: null,
      lightDisabled: false,
      systemDisabled: false,
      bingThings: [],
      isRoomDrawer: false,
      isRoomDrawerNew: false,
      roomId: null,
      instrumentId: false,
      labDeviceDrawer: false,
      alerterDrawer: false,
      alerterId: "",
      isEdit: false,
      isSignal: false,
      signalId: "",
        columns: [
            {
                title: _this.$t('hardware.devciceName'),
                dataIndex: "equipmentName",
            },
            {
                title: _this.$t('hardware.devciceNo'),
                dataIndex: "equipmentNo",
            },
            {
                title: _this.$t('hardware.beforeStatus'),
                dataIndex: "beforeChangeStatus",
                slot: "beforeChangeStatus"
            },
            {
                title: _this.$t('hardware.afterStatus'),
                dataIndex: "afterChangeStatus",
                slot: "afterChangeStatus"
            },
            {
                title: _this.$t('labDevice.handleUser'),
                dataIndex: "createUserName"
            },
            {
                title: _this.$t('labDevice.startTime'),
                dataIndex: "startDate",
                slot: "startDate",
                width: 180
            },
            {
                title: _this.$t('labDevice.endTime'),
                dataIndex: "endDate",
                slot: "endDate",
                width: 180
            },
            {
                title: _this.$t('common.remark'),
                dataIndex: "description",
            },
        ],
        useTotal: 0,
        useLoading: false,
        useItems: {
            id: "",
            pageNum: 1,
            pageSize: 10
        },
        useStatusList: [],
        deviceUseStatus: DEVICE_USE_STATUS
    };
  },
  computed: {
    newTitleTime() {
      if (this.device["reportDate"]) {
        return this.$t('hardware.newStatus') + "（ "+this.$t('hardware.detectionDate')+"：" + this.device.reportDate + " ）";
      } else {
        return this.$t('hardware.newStatus') + "（ "+this.$t('hardware.detectionDate')+"：";
      }
    },
  },
  created() {
    this.init();
  },
  mounted() {
    new Promise((resolve, reject) => {
      time = setInterval(() => {
        if (!this.lightDisabled) {
          this.handleUpdate();
          resolve();
        }
      }, 10000)
    }).catch(err => {
      return reject(err);
    })
  },
  watch: {
    device: function (obj) {
      this.device.closeSoundLightAlarm = !this.device.closeSoundLightAlarm;
      this.device.closeSystemAlarm = !this.device.closeSystemAlarm;
    },
    lightDisabled: function (newValue) {
      this.setLoading(newValue);
    }
  },
  methods: {
      handleBatchUpdateUseStatus(val) {
          const useObj = {
              name: this.device.name,
              no: this.device.no,
              id: this.device.id,
              useStatus: this.useStatusList[0]?.beforeChangeStatus || "",
              useStatusRemark: this.useStatusList[0]?.description || "",
          }
          val.open([useObj]);
      },
    handleColor(item) {
      if (item.hasOwnProperty("switchStatus") && item.switchStatus === ALERTOR_STATUS.NEW) {
        return "offline";
      }
      if (item.status === STATUS_VALUE.NORMAL || item.status == 0) {
        return "normal";
      }
      return "abnormal";
    },
    ...mapMutations(['setLoading']),
    handleGetDetectHistory() {
      this.detectLoading = true;
      getDetectHistory({
        equipmentId: this.device.id,
      }).then((res) => {
        if (res.code) {
          this.detects = res.items;
        }
        this.detectLoading = false;
      });
    },
    async init() {
      await this.handleUpdate();
      getDeviceBinding({equipmentIdStr: this.id}).then(res => {
        if (res.code) {
          this.bingThings = res.items;
        }
      })
      this.handleEquipmentUsers();
      this.handleGetDetectHistory();
      if (this.titleType != 10) {
          this.useItems.id = this.device.id;
          this.handleGetUseStatusList();
      }
    },
    async handleUpdate() {
      await getDeviceDetail({deviceId: this.id}).then((res) => {
        if (res.code) {
          this.device = res.items;
          this.$emit("update:device", res.items);
          let lastName = "";
          this.sensors = [];
          res.items.sensors.map((item) => {
            if (item["sensorType"]) {
              if (lastName === item.sensorType.name) {
                item.sensorType.name = lastName + "2";
              }
              lastName = item.sensorType.name;
              this.sensors.push(item);
            }
          });
        } else {
          this.$message.error(res.message);
        }
      });
    },
    handleEquipmentUsers() {
      this.loading = !this.loading;
      getEquipmentUserList({
        pageNum: this.principalItems.pageNum,
        pageSize: this.principalItems.pageSize,
        equipmentId: this.device.id,
        equipmentType: "DEVICE",
      }).then((res) => {
        this.loading = !this.loading;
        this.equipmentUsers = res.items.list;
        if (res.items.pageNum === items.PAGE_NUM) {
          this.principalTotal = res.items.total;
        }
      });
    },
    handleClose() {
      this.$emit("handleCloseDrawer", false);
    },
    handleShowSlash(index) {
      return index !== this.equipmentUsers.length - 1;
    },
    handleDropdownMenu(e) {
        if (e == "StandbyPower") {
            this.$refs[e].open(0, this.device.id);
        } else {
            this.$refs[e].open(0, this.device);
        }
    },
    handleCurrent() {
      this.active = 0;
      this.handleUpdate();
      this.$message.success(this.$t('common.refreshSuccee'));
    },
    handleSetPrincipal() {
      this.$refs.SetPrincipal.open(0, this.device.id);
    },
    handleSignalStateFilter(data) {
      return signalStateFilter(data, "dBm", -82, -72, 0);
    },
    ...mapMutations({
      handleDrawerOpen: "DRAWEROPEN",
    }),
    handleDeviceDrawer(item) {
      switch (item.type) {
        case 4:
          this.instrumentId = item.id;
          if(item.openTwoSystem){
            this.labDeviceDrawer = true;
          }else{
            this.handleDrawerOpen();
          }
          break
        case 7:
          this.alerterDrawer = true;
          this.alerterId = item.strId;
          break
        case 11:
          this.roomId = item.id;
          if(item.openTwoSystem){
            this.isRoomDrawerNew = true;
          }else{
            this.isRoomDrawer = true;
          }
          break
        case 14:
          this.signalId = item.strId;
          this.isSignal = true;
          break
      }
    },
    handleAcoustoOpticAlarm() {
      this.lightDisabled = true;
      updateAlarmLight({
        id: this.device.id,
        closeSoundLightAlarm: this.device.closeSoundLightAlarm ? 0 : 1,
      }).then((res) => {
        this.lightDisabled = false;
        if (res.code) {
          this.$message({
            type: "success",
            message: this.$t('common.operateSuccess'),
            duration: 2000
          });
        } else {
          this.$message.error(res.message);
          this.device.closeSoundLightAlarm = !this.device.closeSoundLightAlarm;
        }
      });
    },
    handlePlatformAlarm() {
      this.systemDisabled = true;
      updateCloseAlarmSystem({
        id: this.device.id,
        closeSystemAlarm: this.device.closeSystemAlarm ? 0 : 1,
      }).then((res) => {
        this.systemDisabled = false;
        if (res.code) {
          this.$message({
            type: "success",
            message: this.$t('common.operateSuccess'),
            duration: 2000
          });
        } else {
          this.$message.error(res.message);
          this.device.closeSystemAlarm = !this.device.closeSystemAlarm;
        }
      });
    },
      handlePageNumChange(num) {
          this.useItems.pageNum = num;
          this.handleGetUseStatusList();
      },
      handlePageSizeChange(size) {
          this.useItems.pageSize = size;
          this.useItems.pageNum = 1;
          this.handleGetUseStatusList();
      },
      // 获取使用状态操作日志
      handleGetUseStatusList() {
          this.useLoading = true;
          this.useStatusList = [];
          getUseStatusQuery(this.useItems).then(res => {
              if (res.code) {
                  this.useStatusList = res.items?.list || [];
                  this.useTotal = res.items.total;
              } else {
                  this.$message.error(res.message)
              }
          }).finally(() => {
              this.useLoading = false;
          }).catch(e => {
              this.$message.error(e)
          })
      }
  },
  beforeDestroy() {
    clearInterval(time);
    time = null;
  },

};
</script>
<style lang="less" scoped>
.el-dropdown {
  margin-left: 8px !important;
}
</style>
