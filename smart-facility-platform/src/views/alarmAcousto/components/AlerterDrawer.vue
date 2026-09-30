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
      <div v-if="isDrawer" ref="alerterDetail" class="detail-container">
        <div class="detail-padding">
          <drawer-nav :deviceName="alertor.no" :name="alertor.name" :type="1" @handle="handleClose"/>
          <div v-if="$store.state.level && !isDemo" class="detail-handle clearfix">
            <div>
              <el-button
                  :disabled="!removeAlarm || alertor.status === 0"
                  class="margin-small-right"
                  type="danger"
                  @click="handleinvalidateAlarm">
                  {{ $t('hardware.removeAlarm') }}
              </el-button>
              <el-switch
                  v-model="closeSoundLightAlarm"
                  :disabled="alertor.status === 0"
                  class="margin-small-right"
                  :inactive-text="$t('hardware.acousticOptic')"
                  @change="handleAlarmAlertor"/>
              <el-switch
                  v-if="!alerterType(alertor.no)"
                  v-model="closeSystemAlarm"
                  :inactive-text="$t('hardware.alarmPlatform')"
                  @change="handleCloseSystemAlarm"/>
            </div>
            <div>
              <el-button v-if="!alerterType(alertor.no)" @click="handleDropdownMenu('UpdateExportTime')">{{ $t('hardware.exportTime') }}
              </el-button>
              <el-button v-if="!alerterType(alertor.no)" @click="handleDropdownMenu('UpdateAlarmTime')">{{ $t('hardware.alarmTime') }}
              </el-button>
              <el-button v-if="!alerterType(alertor.no)" :disabled="alertor.status === 0" @click="handleAlarmRules">
                修改报警规则
              </el-button>
            </div>
          </div>
          <el-descriptions :title="$t('common.basicInformation')">
            <template v-if="$store.state.level && !isDemo" #extra>
              <el-button @click="handleAlerterDeepAlarmTime">{{ $t('hardware.updateBeepAlarmTime') }}</el-button>
              <el-button class="icon-information" @click="handleDropdownMenu('ReturnCommand')">&nbsp;{{ $t('hardware.returnCommand') }}
              </el-button>
              <el-button class="icon-edit" type="primary" @click="handleDropdownMenu('UpdateDepartment')">&nbsp;{{ $t('common.edit') }}
              </el-button>
            </template>
          </el-descriptions>
          <div class="layout-row">
            <div style="margin-right: 24px">
              <device-status-garden
                  :status-str.sync="alarmType(alertor).str"
                  :status.sync="alarmType(alertor).status"/>
            </div>
            <div>
              <el-descriptions :column="2">
                <el-descriptions-item :label="$t('common.no')">{{ alertor.no }}</el-descriptions-item>
                <el-descriptions-item :label="$t('hardware.lineStatus')">
                <span :class="alertor.status === $STATUS.OFFLINE ? 'abnormal' : 'normal'">
                  {{ handleStatus(alertor.status) }}
                </span>
                </el-descriptions-item>
<!--                <el-descriptions-item label="型号">-->
<!--                  {{-->
<!--                    !alerterType(alertor.no) ? "多功能声光报警器" : "声光报警器"-->
<!--                  }}-->
<!--                </el-descriptions-item>-->
                <el-descriptions-item :label="$t('hardware.beepDuration')">{{ beepDuration }} {{ $t('common.second') }}</el-descriptions-item>
                <el-descriptions-item v-if="!alerterType(alertor.no)" :label="$t('hardware.alarmTime')">{{
                    alertor.alarmInterval
                  }}{{ $t('common.minute') }}
                </el-descriptions-item>
                <el-descriptions-item v-if="!alerterType(alertor.no)" :label="$t('hardware.exportTime')">{{
                    alertor.reportingInterval
                  }}{{ $t('common.minute') }}
                </el-descriptions-item>
                <el-descriptions-item :label="$t('hardware.signalStrength1')">
                  <div v-html="handleSignalStateFilter(alertor.signalStrength)"/>
                </el-descriptions-item>
                <el-descriptions-item :label="$t('common.owningDepartment')">{{ alertor.departmentName }}</el-descriptions-item>
                <el-descriptions-item :label="$t('common.creatDate')">{{ alertor.createDate | localToUtc }}</el-descriptions-item>
                <el-descriptions-item :label="$t('hardware.reportDate')">{{ alertor.reportDate | localToUtc }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </div>
        <div v-if="!isDemo && alerterType(alertor.no)" class="detail-padding">
          <common :alerter-id.sync="alertor.id" @handle="handleDeviceDrawer"/>
        </div>
        <div v-else-if="!isDemo">
          <multifunction
              v-if="alertor.id"
              ref="multifunction"
              :alerter-id="alertor.id"
              :no="alertor.no"
              :report-date="alertor.reportDate"/>
        </div>
      </div>
    </el-drawer>
    <UpdateAlarmTime ref="UpdateAlarmTime" @handle="handleUpdate"/>
    <UpdateExportTime ref="UpdateExportTime" @handle="handleUpdate"/>
    <UpdateDepartment
        ref="UpdateDepartment"
        @handle="handleUpdate"/>
    <beep-alarm-time ref="BeepAlarmTime" @handle="handleDeepDuration"/>
    <alarm-rules ref="AlarmRules" @handle="handleGetSignalSource"/>
    <return-command ref="ReturnCommand"/>
    <div>
      <!-- <PowerDrawer v-if="outageAlarmDrawer" :id.sync="outageAlarmId" :is-drawer.sync="outageAlarmDrawer"/> -->
      <PowerDrawerNew :id.sync="outageAlarmId" :is-drawer.sync="outageAlarmNewDrawer" />
      <device-drawer v-if="deviceDrawer" :id.sync="deviceId" :is-drawer.sync="deviceDrawer"/>
      <DeviceDrawerNew :id.sync="deviceId" :is-drawer.sync="deviceDrawerNew" />
      <outage-alarm-drawer v-if="outageAlarmDrawer" :id.sync="outageAlarmId" :is-drawer.sync="outageAlarmDrawer"/>
      <smart-socket-drawer
          v-if="smartSocketDrawer"
          :id.sync="smartSocketId"
          :is-drawer.sync="smartSocketDrawer"
          @handle="handleClose"/>
    </div>
  </div>
</template>

<script>
import {getAlertorObtainBeepTime, invalidateAlarmAlertor} from "@/api/alertor";
import BindingDevice from "@/components/BindingDevice";
import Pagination from "@/components/Pagination";
import Common from "@/views/alarmAcousto/components/Common";
import Multifunction from "@/views/alarmAcousto/components/Multifunction";
import BeepAlarmTime from "@/views/alarmAcousto/components/BeepAlarmTime";
import AlarmRules from "@/views/alarmAcousto/components/AlarmRules";
import {getDeviceDetail, updateAlarmLight, updateCloseAlarmSystem} from "@/api/device";
import DrawerNav from "@c/DrawerNav/index";
import ReturnCommand from "@/views/device/components/ReturnCommand";
import UpdateDepartment from "@/views/device/components/UpdateDepartment";
import UpdateExportTime from "@/views/device/components/UpdateExportTime";
import UpdateAlarmTime from "@/views/device/components/UpdateAlarmTime";
import {judgeAlerter, signalStateFilter} from "@/utils/methods";
import {mapMutations} from "vuex";
import DeviceStatusGarden from "@c/DeviceStatusGarden/index";

const isDemo = process.env.VUE_APP_DEMO === "true";

let time;
export default {
  name: "AlerterDrawer",
  components: {
    AlarmRules,
    BeepAlarmTime,
    Multifunction,
    Common,
    BindingDevice,
    UpdateExportTime,
    UpdateAlarmTime,
    Pagination,
    UpdateDepartment,
    DeviceStatusGarden,
    ReturnCommand,
    PowerDrawerNew: () => import("@/views/powerOutageAlarm/components/PowerDrawerNew"),
    DeviceDrawer: () => import("@/views/device/components/DeviceDrawer"),
    DeviceDrawerNew: () => import("@/views/device/components/DeviceDrawerNew"),
    smartSocketDrawer: () => import("@/views/smartSocket/components/SmartSocketDrawer"),
    outageAlarmDrawer: () => import("@/views/powerOutageAlarm/components/PowerDrawer"),
    DrawerNav
  },
  props: {
    isDrawer: {
      type: Boolean,
      default: false
    },
    id: {
      type: String | Number,
      default: null
    },
  },
  provide() {
    return {
      name: this.alertor.name,
      reportDate: this.alertor.reportDate
    }
  },
  computed: {
    alerterType() {
      return function (value) {
        if (typeof value === "string") {
          return (value.indexOf("111109100") !== -1 || value.indexOf("20010101020") !== -1);
        }
      }
    },
    alarmType() {
      return function (item) {
        if (judgeAlerter(item.no)) {
          return {str: item.statusStr === "未激活" ? this.$t("common.notActivate") : item.statusStr, status: item.status};
        } else {
          return {
            str: item.defenceAlarmStatus && item.powerFailure ? this.$t("common.normal") : this.$t("common.abnormal"),
            status: item.defenceAlarmStatus && item.powerFailure ? 1 : 0
          };
        }
      }
    }
  },
  data() {
    return {
      isDemo,
      alertor: {},
      removeAlarm: true,
      closeSystemAlarm: false,
      closeSoundLightAlarm: false,
      beepDuration: 0,
      deviceDrawer: false,
      deviceDrawerNew: false,
      smartSocketDrawer: false,
      outageAlarmDrawer: false,
      deviceId: "",
      smartSocketId: "",
      outageAlarmId: "",
      lightDisabled: false,
        outageAlarmNewDrawer: false
    }
  },
  watch: {
    isDrawer: function (newValue) {
      if (newValue) {
        this.removeAlarm = true;
        this.handleUpdate();
        new Promise((resolve, reject) => {
          time = setInterval(() => {
            if (this.lightDisabled) {
              this.handleUpdate();
              resolve()
            }
          }, 15000)
        }).catch(err => {
          this.$message.error(err);
        })
      } else {
        this.alertor = {};
        this.$emit("id:update", "");
        clearInterval(time);
        time = "";
      }
    },
    lightDisabled: function (newValue) {
      this.setLoading(newValue);
    }
  },
  methods: {
    ...mapMutations(['setLoading']),
    handleUpdate() {
      getDeviceDetail({deviceId: this.id}).then(res => {
        if (res.code) {
          this.closeSystemAlarm = !res.items.closeSystemAlarm;
          this.alertor = res.items;
          this.closeSoundLightAlarm = !this.alertor.closeSoundLightAlarm;
          this.handleDeepDuration();
        }
      })
    },
    handleDeepDuration() {
      getAlertorObtainBeepTime({
        equipmentId: this.alertor.id
      }).then(res => {
        this.beepDuration = res.items;
      })
    },
    handleGetSignalSource() {
      this.$refs.multifunction.handleGetSignalSourceList();
    },
    handleClose() {
      this.$emit("update:isDrawer", false);
    },
    handleAlarmAlertor() {
      this.lightDisabled = true;
      updateAlarmLight({
        id: this.alertor.id,
        closeSoundLightAlarm: this.closeSoundLightAlarm ? 0 : 1
      }).then(res => {
        this.lightDisabled = false;
        if (res.code) {
          this.$message({
            type: "success",
            message: this.$t('common.operateSuccess'),
            duration: 2000
          });
        } else {
          this.$message.error(res.message);
          this.closeSoundLightAlarm = !this.closeSoundLightAlarm;
        }
      })
    },
    handleinvalidateAlarm() {
      invalidateAlarmAlertor({
        id: this.alertor.id
      }).then(res => {
        if (res.code) {
          this.$message.success(this.$t('common.operateSuccess'));
          this.removeAlarm = false;
        } else {
          this.$message.error(res.message);
        }
      })
    },
    handleAlerterDeepAlarmTime() {
      this.$refs.BeepAlarmTime.open(0, {beepAlarmTime: this.beepDuration, equipmentNo: this.alertor.no});
    },
    handleAlarmRules() {
      this.$refs.AlarmRules.open(0, this.alertor.no);
    },
    handleCloseSystemAlarm() {
      updateCloseAlarmSystem({
        id: this.alertor.id,
        closeSystemAlarm: this.closeSystemAlarm ? 0 : 1
      }).then(res => {
        if (res.code) {
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
    handleDropdownMenu(e) {
      this.$refs[e].open(0, this.alertor);
    },
    handleStatus(value) {
      switch (value) {
        case 0:
          return this.$t('common.notActivate');
        case -100:
          return this.$t('common.offLine');
        default:
          return this.$t('common.isLine')
      }
    },
    handleSignalStateFilter(data) {
      return signalStateFilter(data, "dBm", -82, -72, 0);
    },
    handleDeviceDrawer(item) {
      if(item.openTwoSystem){
          switch (item.type) {
              case 10:
                  this.deviceDrawerNew = true;
                  this.deviceId = item.encodeId;
                  break
              case 8:
                  this.outageAlarmNewDrawer = true;
                  this.outageAlarmId = item.encodeId;
                  break
              default:
                  this.deviceDrawerNew = true;
                  this.deviceId = item.encodeId;
                  break
          }
      } else {
          switch (item.type) {
              case 10:
                  this.smartSocketDrawer = true;
                  this.smartSocketId = item.encodeId;
                  break
              case 8:
                  this.outageAlarmDrawer = true;
                  this.outageAlarmId = item.encodeId;
                  break
              default:
                  this.deviceDrawer = true;
                  this.deviceId = item.encodeId;
                  break
          }
      }

    }
  },
}
</script>
