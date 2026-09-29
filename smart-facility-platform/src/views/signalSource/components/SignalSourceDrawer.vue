<template>
  <el-drawer
      v-loading="$store.state.loading"
      :before-close="handleClose"
      :modal="false"
      :visible.sync="isDrawer"
      :withHeader="false"
      size="70%">
    <template>
      <div v-if="isDrawer" class="detail-container">
        <div class="detail-padding">
          <drawer-nav :deviceName="signal.no" :name="signal.name" :type="1" @handle="handleClose"/>
          <el-descriptions :title="$t('common.basicInformation')">
            <template #extra>
              <el-button type="primary" class="icon-edit" @click="handleDropdownMenu('UpdateDepartment')">&nbsp;{{ $t('common.edit') }}</el-button>
            </template>
          </el-descriptions>
          <div class="layout-row">
            <div style="margin-right: 24px">
              <device-status-garden
                  :status.sync="signalType(signal).status"
                  :status-str.sync="signalType(signal).str"/>
            </div>
            <div>
              <el-descriptions :column="2">
                <el-descriptions-item :label="$t('common.no')">{{ signal.no }}</el-descriptions-item>
                <el-descriptions-item :label="$t('common.companyName')">{{ companyName }}</el-descriptions-item>
                <el-descriptions-item :label="$t('common.owningDepartment')">{{ signal.departmentName }}</el-descriptions-item>
                <el-descriptions-item :label="$t('hardware.reportDate')">{{ signal.reportDate | localToUtc }}</el-descriptions-item>
                <el-descriptions-item :label="$t('hardware.signalStrength1')">
                  <div v-html="handleSignalStateFilter(signal.signalStrength)"/>
                </el-descriptions-item>
                <el-descriptions-item :label="$t('common.creatDate')">{{ signal.createDate | localToUtc }}</el-descriptions-item>
                <el-descriptions-item :label="$t('hardware.lineStatus')">
                <span :class="[0, 1].includes(signal.status) ? '' : 'abnormal'">
                  {{ signalType(signal).str }}
                </span>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </div>
        <div class="detail-padding-nocolor">
          <el-descriptions
              :title="$t('hardware.newStatus') + ' （'+$t('hardware.detectionDate')+'：'+ (signal.reportDate ?  signal.reportDate : '') +'）'">
            <template slot="extra">
              <el-button class="icon-refresh" @click="handleInit()">&nbsp;{{ $t('hardware.reset') }}</el-button>
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
        <div class="detail-padding">
          <device-monitor-message
              v-if="sensors.length"
              :default-name="signal.name"
              :is-tab="false"
              :sensors.sync="sensors"/>
        </div>
        <div class="detail-padding-nocolor">
          <el-descriptions :title="$t('hardware.bindThings')">
            <template slot="extra">
              <el-button v-if="$store.state.level" type="primary" @click="handleBindingEquipment">{{ $t("common.bindDevice") }}</el-button>
            </template>
          </el-descriptions>
          <el-table
              v-loading="loading"
              :data="signalData"
              border
              :default-sort="{order: 'descending'}">
            <el-table-column fixed label="#" type="index" width="70px">
              <template v-slot="scope">
            <span v-if="`${total !== 0}`">{{
                (items.pageNum - 1) * items.pageSize + scope.$index + 1
              }}</span>
              </template>
            </el-table-column>
            <el-table-column fixed :label="$t('common.name')" sortable>
              <template v-slot="scope">
                <a @click="handleShowDrawer(scope.row)">
                  {{ scope.row.name }}
                </a>
              </template>
            </el-table-column>
            <el-table-column fixed :label="$t('common.no')" prop="no" sortable>
              <template v-slot="scope">
                <a @click="handleShowDrawer(scope.row)">
                  {{ scope.row.no }}
                </a>
              </template>
            </el-table-column>
            <el-table-column :label="$t('hardware.value')" min-width="240">
              <template v-slot="scope">
                <hardwareValue :data="scope.row"/>
              </template>
            </el-table-column>
            <el-table-column :label="$t('hardware.status')" min-width="170">
              <template v-slot="scope">
                <device-signal :data="scope.row"/>
                <div>{{ $t('hardware.kwh') }}：&nbsp;{{ scope.row.battery }} V</div>
              </template>
            </el-table-column>
            <el-table-column fixed="right" :label="$t('common.handle')" min-width="100">
              <template v-slot="scope">
                <el-button type="text" @click="postDeviceSignalUnbind(scope.row)">{{ $t("common.unBind") }}</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="paging">
            <pagination
                v-show="total > 10"
                :limit.sync="items.pageSize"
                :page.sync="items.pageNum"
                :total="total"
                @pagination="handleSearchThingsAlertor"/>
          </div>
          <UpdateDepartment
              ref="UpdateDepartment"
              @getList="handleInit"/>
          <device-drawer v-if="deviceDrawer" :id.sync="deviceId" :is-drawer.sync="deviceDrawer"/>
          <DeviceDrawerNew :hideSensorsTypes="[17,1001]" :id.sync="deviceId" :is-drawer.sync="deviceDrawerNew" />
          <BindingDevice ref="BindingDevice" :thing-type="true" @handle="handleBindingAlertor"/>
        </div>
      </div>
    </template>
  </el-drawer>
</template>

<script>
import DrawerNav from "@c/DrawerNav/index";
import {judgeAlerter, signalStateFilter} from "@/utils/methods";
import LineMarkChart from "@c/LineMarkChart/index";
import HardwareValue from "@c/HardwareValue/index";
import DeviceSignal from "@c/DeviceSignal/index";
import BindingDevice from "@c/BindingDevice/index";
import {ERROR, items, TIME_DIMENSION} from "@/utils/constant";
import Pagination from "@c/Pagination/index";
import {getDeviceDetail} from "@/api/device";
import {getDeviceSignalBindList, postDeviceSignalBind, postDeviceSignalUnbind} from "@/api/signal";
import HardwareState from "@c/HardwareState/index";
import DeviceMonitorMessage from "@c/DeviceMonitorMessage/index";
import UpdateDepartment from "@/views/device/components/UpdateDepartment";
import DeviceStatusGarden from "@c/DeviceStatusGarden/index";

let time;
export default {
  name: "SignalSourceDrawer",
  components: {
    DrawerNav,
    LineMarkChart,
    DeviceStatusGarden,
    UpdateDepartment,
    HardwareValue,
    DeviceSignal,
    BindingDevice,
    HardwareState,
    DeviceMonitorMessage,
    Pagination,
    DeviceDrawer: () => import("@/views/device/components/DeviceDrawer"),
    DeviceDrawerNew: () => import("@/views/device/components/DeviceDrawerNew"),
  },
  props: {
    isDrawer: {
      type: Boolean,
      default: false
    },
    id: {
      type: [Number, String],
      default: ""
    }
  },
  data() {
    return {
      signal: {},
      bingThings: [],
      interval: 4,
      signalData: [],
      loading: false,
      active: 14,
      total: 0,
      items: {
        pageSize: items.PAGE_SIZE,
        pageNum: items.PAGE_NUM
      },
      sensors: [],
      deviceDrawer: false,
      deviceDrawerNew: false,
      deviceId: "",
      dimensions: TIME_DIMENSION,
      companyName: JSON.parse(localStorage.getItem("USERINFO")).companyName
    }
  },
  computed: {
    signalType() {
      return function (item) {
        return {str: item.runStatus === 0 ? this.$t("common.notActivate") : item.statusStr, status: item.status};
      }
    }
  },
  created() {
    this.handleInit()
  },
  watch: {
    signal: {
      handler: function (newValue) {
      },
      deep: true
    },
    isDrawer(val){
        if(val){
            this.handleInit();
            new Promise((resolve, reject) => {
              time = setInterval(() => {
                this.handleInit();
                resolve();
              }, 20000)
            }).catch(err => {
              return reject(err)
            })
        }
    },
  },
  methods: {
    handleDropdownMenu(val) {
      this.$refs[val].open(0, this.signal);
    },
    handleClose() {
      this.$emit("update:isDrawer", false);
    },
    handleSignalStateFilter(data) {
      return signalStateFilter(data, "dBm", -82, -72, 0);
    },
    handleInit() {
      this.getSignalDetail();
    },
    async getSignalDetail() {
      try {
        const res = await getDeviceDetail({deviceId: this.id});
        this.sensors = [];
        this.signal = res.items;
        res.items.sensors.map((item) => {
          if (item["sensorType"]) {
            this.sensors.push(item);
          }
        });
        this.items.signId = this.signal.id;
        await this.handleSearchThingsAlertor();
      } catch (e) {
        this.$message.error(ERROR);
      }
    },
    handleStatusColor(value) {
      if (value !== 1) {
        return {color: "abnormal", icon: "icon-warning-line"};
      } else {
        return {color: "normal", icon: "icon-normal"};
      }
    },
    handleHistoryData() {
      const array = [{idx: 14, sensorType: {name: "断电检测", unit: ""}}]
      this.$refs.SeeHistoryData.open(
          this.signal.id,
          array,
          this.signal.name
      );
    },
    handleBindingEquipment() {
      this.$refs.BindingDevice.open(3);
    },
    handleShowDrawer(item) {
      if(item.openTwoSystem){
        this.deviceDrawerNew = true;
      }else{
        this.deviceDrawer = true;
      }
      this.deviceId = item.encodeId;
    },
    handleSearchThingsAlertor() {
      this.signalData = [];
      this.loading = true;
      getDeviceSignalBindList(this.items).then(res => {
        this.loading = false;
        if (res.code) {
          this.signalData = res.items.list;
          (res.items.pageNum === items.PAGE_NUM && res.items["total"]) && (this.total = res.items.total);
        } else {
          this.$message.error(res.message);
        }
      })
    },
    handleBindingAlertor(row) {
      postDeviceSignalBind({
        signalReceiverId: this.signal.id,
        equipmentId: row.id,
      }).then(res => {
        this.handleMessage(res, this.$t("hardware.bindSuccess"));
      })
    },
    postDeviceSignalUnbind(row) {
      this.$confirm(this.$t("hardware.unBindMessage"), this.$t("hardware.unBindTitle"), {
        type: "warning",
        cancelButtonText: this.$t("common.cancel"),
        confirmButtonText: this.$t("common.confirm")
      }).then(() => {
        postDeviceSignalUnbind({
          signalReceiverId: this.signal.id,
          equipmentId: row.id,
          equipmentType: row.type
        }).then(res => {
          this.handleMessage(res, this.$t("hardware.unBinded"));
          this.handleSearchThingsAlertor();
        })
      }).catch(() => {
        return this.$message.info(this.$t("hardware.cancelHandle"));
      })
    },
    handleMessage(res, txt) {
      if (res.code) {
        this.$message.success(txt);
        this.handleSearchThingsAlertor();
      } else {
        this.$message.error(res.message);
      }
    },
  },
  beforeDestroy() {
    clearInterval(time);
    time = null;
  }
}
</script>

<style lang="less" scoped>
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
