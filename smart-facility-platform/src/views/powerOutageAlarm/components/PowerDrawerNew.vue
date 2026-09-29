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
<!--                {{ removeAlarm ? $t('hardware.removedAlarm') : $t('hardware.removeAlarm') }}-->
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
                <el-button
                    v-if="powerOutage.wifiFlag"
                    :disabled="powerOutage.status === 0"
                    @click="handleDropdownMenu('NetworkConfiguration')">
                    {{ $t('hardware.networkConfiguration') }}
                </el-button>
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
                  :status="powerOutage.status == 0 ? 0 : (powerOutage.status == -100 ? -100 : powerOutage.powerFailure === 1 ? 1 : -1)"
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
          <DeviceBindRelationship :id="id" @handle="handleBinding" />
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
        <MonitorInfo class="detail-padding" v-if="monitorSensors.length > 0" :objId="powerOutage.id" :sensors="monitorSensors" :type="1" />
        <div class="detail-padding-nocolor">
          <el-descriptions class="margin-center" :title="$t('hardware.users')">
            <template v-if="$store.state.level" slot="extra">
              <el-tooltip v-if="isOpenTwoSystem && isBinding" effect="dark" :content="$t('hardware.isOpenTwoSystem')" placement="top">
                <el-button class="icon-staff-settings button-disabled" type="primary"> {{ $t('common.addPrincipal') }}</el-button>
              </el-tooltip>
              <el-button type="primary" v-else @click="handleSetPrincipal" class="icon-staff-settings">&nbsp;{{ $t('common.addPrincipal') }}</el-button>
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
          <el-descriptions :title="$t('hardware.alarmLog')"></el-descriptions>

          <HistoryAlarmRecord v-if="powerOutage" :type="1" :id="powerOutage.id" />
        </div>
      </div>
    </el-drawer>
    <SetPrincipal ref="SetPrincipal" @handle="handleEquipmentUsers"/>
    <UpdateAlarmTime ref="UpdateAlarmTime" @handle="handleUpdate"/>
    <UpdateExportTime ref="UpdateExportTime" @handle="handleUpdate"/>
    <return-command ref="ReturnCommand"/>
      <network-configuration ref="NetworkConfiguration" @handle="handleUpdate"/>
      <UpdateDepartment
        ref="UpdateDepartment"
        @handle="handleUpdate"/>
  </div>
</template>

<script>
import AlarmTable from "@/components/AlarmTable";
import SetPrincipal from "@/components/SetPrincipal"
import {getPowerInvalidateAlarm} from "@/api/powerOutage";
import {getEquipmentUserList, removeEquipmentUser} from "@/api/user";
import {ALERTOR_STATUS, items} from "@/utils/constant";
import {
  getDeviceDetail,
  updateAlarmLight,
  updateCloseAlarmSystem
} from "@/api/device";
import { getDeviceSingleMonitorFlag, getDeviceMonitorFlag, getIsAlarmRuleOpenTwoSystem } from "@/api/monitorIndicator";
import Pagination from "@/components/Pagination";
import UpdateAlarmTime from "@/views/device/components/UpdateAlarmTime";
import UpdateExportTime from "@/views/device/components/UpdateExportTime";
import PrincipalTable from "@/components/PrincipalTable";
import ReturnCommand from "@/views/device/components/ReturnCommand";
import UpdateDepartment from "@/views/device/components/UpdateDepartment";
import LineMarkChart from "@c/LineMarkChart/index";
import DrawerNav from "@c/DrawerNav/index";
import {mapMutations} from "vuex";
import {signalStateFilter} from "@/utils/methods";
import DeviceStatusGarden from "@c/DeviceStatusGarden/index";
import MonitorInfo from "@c/MonitorInfo";
import HistoryAlarmRecord from "@/components/HistoryAlarmRecord/index.vue";
import DeviceBindRelationship from "@/views/device/components/DeviceBindRelationship";
import store from "@/store";
import NetworkConfiguration from "@/views/device/components/NetworkConfiguration";

export default {
  name: "PowerDrawer",
  components: {
    UpdateExportTime,
    UpdateAlarmTime,
    AlarmTable,
    Pagination,
    SetPrincipal,
    PrincipalTable,
    UpdateDepartment,
    ReturnCommand,
    DeviceStatusGarden,
    LineMarkChart,
    DrawerNav,
    MonitorInfo,
    HistoryAlarmRecord,
    DeviceBindRelationship,
      NetworkConfiguration,
  },
  props: {
    id: {
      type: String,
      default: ""
    },
    isDrawer: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      router: {
        name: "1",
        id: "",
        title: ""
      },
      removeAlarm: false,
      equipmentUsers: [],
      loading: false,
      items: {
        pageSize: items.PAGE_SIZE,
        pageNum: items.PAGE_NUM
      },
      total: 0,
      principalTotal: 0,
      principalItems: {
        pageNum: items.PAGE_NUM,
        pageSize: items.PAGE_SIZE,
        equipmentId: "",
        equipmentType: "DEVICE",
      },
      closeAlarmFlag: false,
      closeSystemAlarm: false,
      companyName: "",
      createDate: "",
      powerOutage: {},
      lightDisabled: false,
      sensorsFlag: [],
      monitorSensors: [],
      isBinding: false,
      isOpenTwoSystem: false,
    }
  },
  watch: {
    isDrawer(val) {
      if(val) {
        getDeviceDetail({deviceId: this.id}).then(res => {
          if (res.code) {
            this.powerOutage = res.items;
            this.router.title = this.powerOutage.name;
            this.principalItems.equipmentId = this.powerOutage.id;
            store.commit('setThingDetail', this.powerOutage)
            this.handleInit();
            this.getIsAlarmRule();
            this.getDeviceSingleMonitor();
            this.getDeviceMonitor()
          }
        })
      }else{
        this.powerOutage = ""
      }
    },
    lightDisabled: function (newValue) {
      this.setLoading(newValue);
    }
  },
  methods: {
    ...mapMutations(['setLoading']),
    async handleInit() {
      await this.handleEquipmentUsers();
      this.closeAlarmFlag = !this.powerOutage.closeSoundLightAlarm;
      this.closeSystemAlarm = !this.powerOutage.closeSystemAlarm;
      this.companyName = JSON.parse(localStorage.getItem("USERINFO")).companyName;
    },
    handleSignalStateFilter(data) {
      return signalStateFilter(data, "dBm", -82, -72, 0);
    },
    getDeviceSingleMonitor() {
      this.monitorSensors = [];
      getDeviceSingleMonitorFlag({equipmentId: this.powerOutage.id}).then(res => {
        if(res.code === 1){
            this.monitorSensors = res.items
        }
      })
    },
    getDeviceMonitor(){
      this.sensorsFlag = [];
      getDeviceMonitorFlag({equipmentId: this.powerOutage.id}).then(res => {
        if(res.code === 1){
          this.sensorsFlag = res.items;
          store.commit('setDeviceSensorsFlag', this.sensorsFlag)
        }
      })
    },
    // 获取该智能硬件是否在2.0系统上，为true限制报警规则，为false不限制
    getIsAlarmRule() {
      getIsAlarmRuleOpenTwoSystem({equipmentId: this.powerOutage.id}).then(res => {
        if(res.code === 1){
          this.isOpenTwoSystem = res.items
        }
      })
    },
    handleDropdownMenu(e) {
      this.$refs[e].open(0, this.powerOutage);
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
    handleBinding(val){
      this.isBinding = val
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
.button-disabled{
    cursor: no-drop;
}
</style>
