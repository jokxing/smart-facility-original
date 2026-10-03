<template>
  <div>
    <div class="detail-padding">
      <DrawerNav :is-width="false" :name="room.name" @handle="handleIsClose"/>
      <el-row justify="end" type="flex">
        <!-- <el-button class="margin-small-right icon-edit" type="primary" @click="handleAddMonitor">&nbsp;新增监测指标</el-button> -->
<!--        <el-button class="margin-small-right icon-alarm1" type="primary" @click="handleAddReport">&nbsp;报警设置</el-button>-->
        <!-- <el-button class="margin-small-right icon-Audible-alarm" type="primary" @click="handleAdvancedAlarmSet">&nbsp;报警设置</el-button> -->
        <el-button
            v-if="isDemo && [950001, 950003].includes(Number(room.id))"
            class="margin-small-right"
            type="primary"
            @click="handleToDeviceLayout">查看设备布局</el-button>
        <el-button class="margin-small-right icon-add-to" type="primary" @click="handleAddReport">&nbsp;{{ $t('room.addTemplate') }}</el-button>
      </el-row>
      <el-descriptions :column="3" :title="$t('common.basicInformation')"/>
      <div class="layout-row">
        <div style="margin-right: 24px">
          <div class="room-circular">{{ room.name }}</div>
        </div>
        <div>
          <el-descriptions :column="3">
            <el-descriptions-item :label="$t('common.no')">{{ room.no }}</el-descriptions-item>
            <el-descriptions-item :label="$t('room.owningFloor')">{{ room.floorName }}</el-descriptions-item>
            <el-descriptions-item :label="$t('labDevice.sensorStatus')">
                {{
                room.senorStatus === 1 ? $t('common.normal') : (room.senorStatus === 2 ? $t('common.abnormal') : (room.senorStatus === -100 ? $t('common.offLine') : "-"))
              }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('common.owningDepartment')">{{ room.departmentName }}</el-descriptions-item>
            <el-descriptions-item :label="$t('common.creatDate')">{{ room.createDate }}</el-descriptions-item>
            <el-descriptions-item :label="$t('room.newReportClass')">
              <span>{{ room.status | levelFilter }}</span>
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
      <el-row v-if="sensors.length">
        <el-col :lg="4">
          <el-descriptions :title="$t('labDevice.bindDevice')"></el-descriptions>
        </el-col>
        <div v-if="isBindLength > 0">
          <template v-for="item in sensors">
            <a
                v-if="!item.isBind"
                :key="item.id"
                class="margin-small-right"
                @click="handleDeviceDrawer(item)">
              <span class="bind-name">{{ item.name }}</span>
              <span :style="{color: getStatusColor(item.status)}">
                {{ handleStatus(item) }}
              </span>
            </a>
          </template>
        </div>
      </el-row>
    </div>
    <div v-if="bindingEquipment.length" class="detail-padding-nocolor">
      <el-descriptions v-if="bindingEquipment.length"
                       :title="$t('hardware.newStatus') + '（ ' + $t('hardware.detectionDate') + '：' + (isBindLength > 0 ? (sensors[0].reportDate ? sensors[0].reportDate : '') : $t('common.notMessage1')) +' )'">
        <template slot="extra">
          <el-button @click="handleProbeNameEdit">{{ $t('labDevice.sensorEdit') }}</el-button>
          <el-button @click="handleGetRoomThingsList" class="icon-refresh">&nbsp;{{ $t('hardware.reset') }}</el-button>
        </template>
      </el-descriptions>
      <div class="new-state">
        <el-row :gutter="20" v-if="isBindLength > 0">
          <el-col v-for="(item, index) in bindingEquipment" :key="index" :sm="8" :xl="6">
            <hardware-state
                v-if="!item.isBind"
                :data="item"
                @click.native="goRecorderDetail(item)"/>
          </el-col>
        </el-row>
        <el-row class="no-data" v-else>
          <el-col>{{ $t('common.notMessage1') }}</el-col>
        </el-row>
      </div>
    </div>
    <div class="detail-padding">
      <device-monitor-message
          v-if="sensors.length"
          :sensors.sync="sensors"
          :things-id="room.id" :type="3"/>
    </div>
    <div class="detail-padding-nocolor">
      <el-tabs v-model="monitorStatus" @tab-click="handleCutMonitor">
        <el-tab-pane :label="$t('labDevice.monitorDevice')" name="1"></el-tab-pane>
        <el-tab-pane :label="$t('labDevice.noMonitorDevice')" name="2"></el-tab-pane>
      </el-tabs>
      <div>
        <div>
          <el-radio-group v-model="tabPosition" style="margin-bottom: 16px;">
            <el-radio-button label="4">{{ $t('common.all') }}</el-radio-button>
            <el-radio-button label="1">{{ $t('route.watchlabdevice') }}</el-radio-button>
            <el-radio-button label="2">{{ $t('route.administration') }}</el-radio-button>
            <el-radio-button label="3">{{ $t('route.unwatchlabdevice') }}</el-radio-button>
          </el-radio-group>
        </div>
        <div v-if="monitorStatus === '1'">
          <div v-if="monitor.length" class="new-state">
            <el-row :gutter="20">
              <el-col v-for="item in monitor" :key="item.id" :class="{ 'adaptationScreen': isAdaptationScreen }"
                      :span="isAdaptationScreen ? 8 : 6" class="new-state-col" style="padding: 0">
                <EquipmentCard
                    :data="item"
                    @change="handleGoEquipment(item.id)"
                    @handle="handleRemoveRoomGoods"/>
              </el-col>
            </el-row>
          </div>
          <el-empty v-else :image-size="30" :description="$t('room.notBindLabDevice')"></el-empty>
        </div>
        <div v-if="monitorStatus === '2'">
          <el-row justify="space-between" type="flex">
            <el-input
                v-model.trim="monitorItems.keyword"
                class="input-with-select"
                clearable
                :placeholder="$t('room.inputNameOrNo')"
                @keyup.enter.native="handleInstrumentListQuery()">
              <el-button
                  slot="append"
                  class="el-button-host"
                  icon="icon-search1"
                  @click="handleInstrumentListQuery()"/>
            </el-input>
            <el-button v-if="$store.state.level" type="primary" class="icon-add-to" @click="handleAddInstrument(1)">&nbsp;{{ $t('room.addLabDevice') }}</el-button>
          </el-row>
          <things-table
              :items="monitorItems"
              :loading.sync="monitorLoading"
              :table-data="noMonitor"
              :total="monitorTotal"
              @handleDelete="handleRemoveThing"
              @handleEdit="handleEditThing"
              @handlePath="handleGoEquipment"
          />
          <div class="paging">
            <pagination
                v-show="monitorTotal > monitorItems.pageSize"
                :limit.sync="monitorItems.pageSize"
                :page.sync="monitorItems.pageNum"
                :total="monitorTotal"
                @pagination="handleInstrumentListQuery"/>
          </div>
        </div>
      </div>
    </div>
    <div class="detail-padding">
      <el-tabs v-model="otherActiveName" @tab-click="handleCutReport">
        <el-tab-pane :label="$t('room.checkLog')" name="first">
          <el-row justify="space-between" type="flex">
            <el-input
                v-model.trim="items.keyword"
                class="input-with-select"
                clearable
                :placeholder="$t('room.inputNameOrNo')"
                @keyup.enter.native="handleQuery()">
              <el-button
                  slot="append"
                  class="el-button-host"
                  icon="icon-search1"
                  @click="handleQuery()">
              </el-button>
            </el-input>
            <el-button type="primary" @click="handleAddReport" class="icon-add-to">&nbsp;{{ $t('room.addTemplate') }}</el-button>
          </el-row>
          <el-table
              v-loading="patrolLoading"
              :data="patrol"
              class="margin-center"
              size="medium">
            <el-table-column fixed label="#" type="index" width="70px">
              <template v-slot="scope">
            <span v-if="`${total !== 0}`">{{
                (items.pageNum - 1) * items.pageSize + scope.$index + 1
              }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('room.reportName')" prop="name">
              <template v-slot="scope">
                <a @click="handlePreviewReport(scope.row)">{{ scope.row.name }}</a>
              </template>
            </el-table-column>
            <el-table-column :label="$t('common.no')" min-width="160" prop="reportNo"/>
            <el-table-column :label="$t('room.checkUserName')" prop="checkUserName"/>
            <el-table-column :label="$t('room.checkDate')" min-width="180" prop="checkDate"/>
            <el-table-column :label="$t('room.reportClass')" prop="grade">
              <template v-slot="scope">
                <span>{{ scope.row.level | levelFilter }}</span>
              </template>
            </el-table-column>
            <el-table-column v-if="$store.state.level" :label="$t('common.handle')" min-width="110">
              <template v-slot="scope">
                <el-button type="text" @click="handleEditRoomReport(scope.row)">{{ $t('common.edit') }}</el-button>
                <el-button type="text" @click="handleRemovePatrol(scope.row)">{{ $t('common.delete') }}</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 绑定的智能硬件 - 旧版本 -->
        <el-tab-pane :label="$t('labDevice.bindDevice')" name="second">
          <el-row v-if="$store.state.level" justify="end" type="flex">
            <el-button type="primary" @click="handleOpenBindingDevice">{{ $t('common.bindDevice') }}</el-button>
          </el-row>
          <el-table
              v-loading="patrolLoading"
              :data="sensorsArray"
              class="margin-center"
              size="medium">
            <el-table-column fixed label="#" type="index" width="70px">
              <template slot-scope="scope">
            <span v-if="`${total !== 0}`">{{
                (items.pageNum - 1) * items.pageSize + scope.$index + 1
              }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('common.name')" prop="name"/>
            <el-table-column :label="$t('common.no')" prop="no"/>
            <el-table-column :label="$t('common.value')" width="250">
              <template slot-scope="scope">
                <hardwareValue :data="scope.row"/>
              </template>
            </el-table-column>
            <el-table-column :label="$t('hardware.status')" prop="data">
              <template slot-scope="scope">
              <span :class="scope.row.status === $STATUS.NORMAL ? 'normal' : 'abnormal'">
                {{ scope.row.status === $STATUS.NORMAL ? $t('common.normal') : (scope.row.status === $STATUS.OFFLINE ? $t('common.offLine') : $t('common.abnormal')) }}
              </span>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('hardware.bindStatus')"
            >
              <template slot-scope="scope">
                <span>{{ scope.row.isBind ? $t('labDevice.no') : $t('labDevice.yes') }}</span>
              </template>
            </el-table-column>

            <el-table-column v-if="$store.state.level" :label="$t('common.handle')" width="100">
              <template slot-scope="scope">
                <el-button v-if="!scope.row.isBind" type="text" @click="handleUnBindEquipment(scope.row)">{{ $t('common.unBind') }}</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 绑定的智能硬件 - 新版本 -->
        <!-- <el-tab-pane label="绑定的智能硬件" name="second">
          <el-table
              v-loading="patrolLoading"
              :data="sensorsArray"
              class="margin-center"
              size="medium">
            <el-table-column fixed label="序号" type="index" width="70px">
              <template v-slot="scope">
            <span v-if="`${total !== 0}`">{{
                (items.pageNum - 1) * items.pageSize + scope.$index + 1
              }}</span>
              </template>
            </el-table-column>
            <el-table-column label="名称" prop="name"/>
            <el-table-column label="编号" prop="no"/>
          </el-table>
        </el-tab-pane> -->
        <el-tab-pane :label="$t('labDevice.informPersonnel')" name="thirdly"/>
        <el-tab-pane v-if="sensors.length" :label="$t('labDevice.historyLog')" name="fourthly"/>
      </el-tabs>
      <div v-if="otherActiveName === 'thirdly'">
        <el-row v-if="$store.state.level" justify="end" type="flex">
          <el-button type="primary" @click="handleAddUser" class="icon-staff-settings">&nbsp;{{ $t('common.addPrincipal') }}</el-button>
        </el-row>
        <principal-table :equipment-users="equipmentUsers" :items="items" :loading="equipmentLoading" :total="total"
                         class="margin-center"/>
      </div>
      <history-alarm-record v-if="otherActiveName === 'fourthly'" :things-id="room.id" :sensors="sensors" :things-type="11"/>
      <div class="paging">
        <pagination
            v-show="total > 10"
            :limit.sync="items.pageSize"
            :page.sync="items.pageNum"
            :total="total"
            @pagination="handleQuery"/>
      </div>
    </div>
    <div v-if="reportDrawer">
      <ReportEdit
          :is-drawer.sync="reportDrawer"
          :preview.sync="isPreview"
          :row.sync="reportObject"
          @handle="handleQuery()"/>
    </div>

    <AdvancedAlarmSet ref="AdvancedAlarmSet" />
    <ReportCreate ref="ReportCreate" :reportDrawer.sync="reportDrawer"/>
    <DeviceDrawer :id.sync="deviceId" :hideSensorsTypes="[17,1001]"
                  :is-drawer.sync="deviceDrawer"/>
    <AlerterDrawer :id.sync="alerterId" :is-drawer.sync="alerterDrawer"/>
    <PowerDrawer v-if="outageAlarmDrawer" :id.sync="outageAlarmId" :is-drawer.sync="outageAlarmDrawer"/>
    <SmartSocketDrawer
        :id.sync="smartSocketId"
        :is-drawer.sync="smartSocketDrawer"
        @handle="handleClose"/>
    <instrument-drawer v-if="instrumentId">
      <drawer-page v-if="instrumentId" :detail-id="instrumentId"/>
    </instrument-drawer>
    <BindingDevice ref="BindingDevice" @handle="handleBindingEquipment"/>
    <administration-modal
        v-if="modalVisible"
        :room-id="id"
        :type="Number(tabPosition)"
        @handle="handleGetRoomThingsList"/>
    <SetPrincipal ref="SetPrincipal" @handle="handleEquipmentUsers"/>
    <ProbeNameEdit ref="probeNameEdit" @handle="handleGetRoomThingsList"/>
    <sensor-table ref="SensorTable"/>
  </div>
</template>

<script>
import HardwareState from "@/components/HardwareState";
import BindingDevice from "@/components/BindingDevice";
import PrincipalTable from "@/components/PrincipalTable";
import SensorTable from "@/components/SensorTable";
import SetPrincipal from "@/components/SetPrincipal";
import EquipmentCard from "@/views/room/components/EquipmentCard";
import ChartDimension from "@/components/ChartDimension";
import AdministrationModal from "@/views/labDevice/modal"
import Pagination from "@/components/Pagination/index";
import {
  addRoomThings,
  getRoomDetail,
  getRoomDeviceErrorStatistics,
  getRoomMonitorInstrument,
  getRoomReportList,
  getRoomThingsList,
  removeReportRoomReport,
  removeRoomGoods,
  removeRoomThings
} from "@/api/room";
import {BASE_URL, DEVICE_ID, items, MONITORSTATUS, TIME_FORMAT} from "@/utils/constant";
import {resolveDeviceAssetUrl} from "@/utils/demoDeviceUrl";
import HardwareValue from "@/components/HardwareValue/index";
import {postInstrumentList} from "@/api/labDevice";
import {mapMutations, mapState} from "vuex";
import moment from "moment";
import {arrayToHeavy, computationTime} from "@/utils/methods";
import {getThingsUserList} from "@/api/user";
import ThingsTable from "@/views/room/components/ThingsTable";
import HistoryAlarmRecord from "@c/HistoryAlarmRecord";
import DeviceMonitorMessage from "@c/DeviceMonitorMessage"
import ReportEdit from "@/views/room/components/ReportEdit";
import AdvancedAlarmSet from "@/views/AdvancedAlarmSet/index";
import ReportCreate from "@/views/room/components/ReportCreate";
import DrawerNav from "@c/DrawerNav"
import ProbeNameEdit from "@/components/ProbeNameEdit";

const state = {
  normal: "正常",
  alarm: "报警",
  offLine: "离线"
}

const dateType = {
  1: 1,
  2: 7,
  3: 30,
  4: 365
}

export default {
  name: "RoomModule",
  components: {
    DeviceDrawer: () => import("@/views/device/components/DeviceDrawerNew"),
    SmartSocketDrawer: () => import("@/views/smartSocket/components/SmartSocketDrawer"),
    DrawerNav,
    AlerterDrawer: () => import("@/views/alarmAcousto/components/AlerterDrawer"),
    PowerDrawer: () => import("@/views/powerOutageAlarm/components/PowerDrawerNew"),
    HistoryAlarmRecord,
    ThingsTable,
    EquipmentCard,
    HardwareState,
    BindingDevice,
    ChartDimension,
    HardwareValue,
    AdministrationModal,
    SensorTable,
    Pagination,
    PrincipalTable,
    SetPrincipal,
    DrawerPage: () => import("@/views/labDevice/components/LabDeviceDrawer"),
    DeviceMonitorMessage,
    AdvancedAlarmSet,
    ReportCreate,
    ReportEdit,
    instrumentDrawer: () => import("@c/Drawer/index"),
    ProbeNameEdit
  },
  props: ["id"],
  data() {
    return {
      noMonitor: [],
      room: {},
      monitorLoading: false,
      monitorItems: {
        pageSize: items.PAGE_SIZE,
        pageNum: items.PAGE_NUM,
        keyword: ""
      },
      monitorTotal: 0,
      items: {
        pageSize: items.PAGE_SIZE,
        pageNum: items.PAGE_NUM,
        keyword: ""
      },
      patrol: [],
      total: 0,
      patrolLoading: false,
      sensors: [],
      monitor: [],
      thingsActiveName: "first",
      otherActiveName: "first",
      bindingEquipment: [],
      equipmentUsers: [],
      equipmentLoading: false,
      deviceDrawer: false,
      alerterDrawer: false,
      smartSocketDrawer: false,
      outageAlarmDrawer: false,
      deviceId: "",
      alerterId: "",
      smartSocketId: "",
      outageAlarmId: "",
      reportDrawer: false,
      reportObject: {},
      isPreview: false,
      instrumentId: null,
      monitorStatus: "1",
      tabPosition: 4,
      isBindLength: 0,
      isAdaptationScreen: false,
      sensorsArray: [],
      isDemo: process.env.VUE_APP_DEMO === 'true'
    }
  },
  created() {
    this.handleInit();
    //用户分辨率150%为true，其他为false
    if (screen.width < 1300) {
      this.isAdaptationScreen = true
    }
  },
  computed: {
    ...mapState("lab", {
      modalVisible: "modalVisible",
      isReflesh: "isReflesh",
    }),
  },
  watch: {
    modalVisible() {
      if (!this.modalVisible) {
        this.handleInstrumentListQuery();
      }
    },
    monitorStatus: function (newValue) {
      if (newValue === "2") {
        this.handlePostInstrumentList(newValue, newValue, this.tabPosition);
      } else {
        this.handleGetRoomMonitorInstrument()
      }
    },
    tabPosition: function (newValue) {
      if (this.monitorStatus === "2") {
        this.monitorItems = {
          pageSize: items.PAGE_SIZE,
          pageNum: items.PAGE_NUM,
          keyword: ""
        }
        this.handlePostInstrumentList(this.monitorStatus, this.monitorStatus, newValue);
      } else {
        const type = newValue === "4" ? 0 : newValue
        this.handleGetRoomMonitorInstrument(type);
      }
    }
  },
  methods: {
    handleToDeviceLayout() {
      if (!this.isDemo || !this.room || !this.room.id) return;
      this.$emit('handleCloseDrawer');
      this.$router.push({
        name: 'RoomView',
        query: {
          roomId: this.room.id,
          roomName: this.room.name
        }
      });
    },
    handleAddMonitor() {
      this.$refs.SensorTable.open(0, this.room.id);
    },
    handleStatus(item) {
      switch (item.status) {
        case 1:
          return "（" + this.$t('common.normal') + "）";
        case -100:
          return "（" + this.$t('common.offLine') + "）";
        case 0:
          return "（" + this.$t('common.notActivate') + "）";
        default:
          return "（" + this.$t('common.abnormal') + "）";
      }
    },
    ...mapMutations({
      handleDrawerOpen: "DRAWEROPEN",
    }),
    handleCutMonitor() {
      this.tabPosition = 4;
    },
    handleGoEquipment(id) {
      this.instrumentId = id;
      this.handleDrawerOpen();
    },
    handleClose(val) {
      this.smartSocketDrawer = val;
    },
    // 探头名称编辑
    handleProbeNameEdit() {
      this.$refs.probeNameEdit.open(this.id, 11)
    },

    async handleInit() {
      await getRoomDetail({id: this.id}).then(res => {
        if (res.code) {
          this.room = res.items;
        } else {
          this.$message.error(res.message);
        }
      });
      this.handleGetRoomThingsList();
      await this.handleGetRoomReportList();
      await this.handleGetRoomMonitorInstrument();
      this.handleEquipmentUsers();
    },
    goRecorderDetail(item) {
      this.handleDeviceDrawer({encodeId: item.encodeId, type: item.deviceType, isLook: item.isLook});
    },
    handleShowSlash(index) {
      return index !== this.equipmentUsers.length - 1;
    },
    handleEquipmentUsers() {
      this.equipmentLoading = true;
      delete this.items.keyword;
      this.items.thingId = this.id;
      getThingsUserList(this.items).then(res => {
        this.equipmentLoading = false;
        if (res.code) {
          const {pageNum, list, total} = res.items;
          if (pageNum === items.PAGE_NUM) {
            this.total = total;
          }
          this.equipmentUsers = list;
        } else {
          this.$message.error(res.message);
        }
      })
    },
    handleGetRoomMonitorInstrument(types = 0) {
      this.monitor = [];
      getRoomMonitorInstrument({roomId: this.id, types}).then(res => {
        if (res.code) {
          res.items.map(item => {
            let obj = {
              id: item.id,
              name: item.name,
              url: resolveDeviceAssetUrl(item.logoUrl, BASE_URL),
              sensors: []
            };
            item.simpleEquipments.map(i => {
              obj.type = i.type;
              obj.powerFailure = i.powerFailure;
              obj.sensors = obj.sensors.concat(...i.sensors);
            })
            this.monitor.push(obj);
          });
        } else {
          this.$message.error(res.message);
        }
      });
    },
    handleCutReport() {
      this.items = {
        pageSize: items.PAGE_SIZE,
        pageNum: items.PAGE_NUM,
        keyword: ""
      }
      if (this.otherActiveName === "first") {
        this.handleGetRoomReportList();
      }
      if (this.otherActiveName === "thirdly") {
        this.handleEquipmentUsers();
      }
    },
    handleEditRoomReport(row) {
      this.reportDrawer = true;
      this.reportObject = row;
      this.$emit('update:reportDrawer', true);
      this.$emit("change", row);
      this.$emit("update:preview", false);
    },
    handlePreviewReport(row) {
      this.reportDrawer = true;
      this.reportObject = row;
      this.$emit('update:reportDrawer', true);
      this.$emit("update:preview", true);
      this.$emit("change", row);
    },
    handleInstrumentListQuery() {
      if (this.thingsActiveName === "first") {
        this.handlePostInstrumentList(2, this.monitorStatus, this.tabPosition);
      }
      if (this.thingsActiveName === "second") {
        this.handlePostInstrumentList("", 3)
      }
    },
    handlePostInstrumentList(monitor = 3, search = 2, type = 4) {
      postInstrumentList({
        keyword: this.monitorItems.keyword,
        monitor,
        "pageNum": this.monitorItems.pageNum,
        "pageSize": this.monitorItems.pageSize,
        "roomId": this.id,
        search,
        type
      }).then(res => {
        if (res.code) {
          if (res.items.pageNum === items.PAGE_NUM) {
            this.monitorTotal = res.items.total;
          }
          this.noMonitor = res.items.list;
        }
      })
    },
    handleAddInstrument(row) {
      this.handleAddModal({roomId: this.id, types: row});
    },
    ...mapMutations("lab", {
      handleAddModal: "ADDMODAL",
      handleEditModal: "EDITMODAL",
    }),
    handleRemoveRoomGoods(val) {
      removeRoomGoods({
        labId: Number(this.id),
        thingsId: Number(val)
      }).then(res => {
        if (res.code) {
          this.$message.success(this.$t('room.unBindSuccess'));
          this.handlePostInstrumentList(this.monitorStatus, this.monitorStatus, this.tabPosition);
        } else {
          this.$message.error(res.message);
        }
      })
    },
    getStatusColor(status) {
      let color = "";
      MONITORSTATUS.map((a) => {
        if (a.code === status) {
          color = a.color;
        }
      });
      return color;
    },
    handleOpenBindingDevice() {
      this.$refs.BindingDevice.open(1);
    },
    handleGetRoomThingsList() {
      this.bindingEquipment = [];
      this.sensors = [];
      getRoomThingsList({roomId: this.id}).then(res => {
        if (res.code) {
          const sensorsArray = res.items.list;
          let lastName = "";
          sensorsArray.map(item => {
            if (!item.sensors.length) {
              this.bindingEquipment.push(item)
            } else {
              item.sensors.map(i => {
                if (i["sensorType"]) {
                  if (lastName === i.sensorType.name) {
                    i.sensorType.name = lastName + "2";
                  }
                  lastName = i.sensorType.name;
                  i.encodeId = item.encodeId;
                  i.deviceType = item.type;
                  i.isLook = item.isLook;
                  i.isBind = item.isBind
                  this.bindingEquipment.push(i);
                }
              })
            }
            if(item.isBind === 0){
              this.isBindLength++
            }
          });
          this.sensorsArray = sensorsArray;
          this.sensors = arrayToHeavy(sensorsArray,"no");
          this.$forceUpdate()
        } else {
          this.$message.error(res.message);
        }
      })
    },
    handleQuery() {
      if (this.otherActiveName === "first") {
        this.handleGetRoomReportList();
      }
      if (this.otherActiveName === "thirdly") {
        this.handleEquipmentUsers();
      }
    },
    handleGetRoomReportList() {
      getRoomReportList({
        "endDate": "",
        "keyword": this.items.keyword,
        "pageNum": this.items.pageNum,
        "pageSize": this.items.pageSize,
        "roomId": this.id,
        "startDate": ""
      }).then(res => {
        if (res.code) {
          if (res.items.pageNum === items.PAGE_NUM) {
            this.total = res.items.total;
          }
          this.patrol = res.items.list;
        }
      })
    },
    handleBindingEquipment(row) {
      addRoomThings({
        thingsId: this.id,
        equipmentId: row.equipmentId,
        equipmentType: row.equipmentType
      }).then(res => {
        if (res.code) {
          this.$message.success(this.$t('hardware.bindSuccess'));
          this.handleGetRoomThingsList();
        } else {
          this.$message.error(res.message);
        }
      })
    },
    handleRemoveThing(row) {
      this.$confirm(this.$t('room.deleteMontiLabDevice') + row.name + this.$t('romm.deleteMontiLabDevice1'), this.$t('room.deleteMontiLabDevice2'), {
        type: "warning",
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel')
      }).then(() => {
        this.handleRemoveRoomGoods(row.id);
      }).catch(() => {
        this.$message.info(this.$t('common.cancelHandle'));
      })
    },
    handleEditThing(row) {
      if (row === 2) {
        this.handleAddModal({roomId: this.id, types: row});
      } else {
        this.handleEditModal(row);
      }
    },
    handleRemovePatrol(row) {
      this.$confirm(this.$t('room.deleteCheck'), this.$t('room.deleteCheckHint'), {
        type: "warning",
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel')
      }).then(() => {
        removeReportRoomReport({id: row.id}).then(res => {
          if (res.code) {
            this.$message.success(this.$t('common.deleteSuccess'));
            this.handleQuery();
          } else {
            this.$message.error(res.message);
          }
        })
      }).catch(() => {
        this.$message.info(this.$t('common.deleteCanceled'));
      })
    },
    handleAdvancedAlarmSet(){
      this.$refs.AdvancedAlarmSet.open({id: this.room.id, type:3})
      ///xxxx
    },
    handleAddReport() {
      this.$refs.ReportCreate.open({id: this.room.id, name: this.room.name});
    },
    handleUnBindEquipment(row) {
      this.$confirm(this.$t('room.unBindHardwareAndRoom'), this.$t('room.unBindHardware'), {
        type: "warning",
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel')
      }).then(() => {
        removeRoomThings({
          "equipmentId": row.id,
          "equipmentType": row.type,
          "thingsId": this.id,
          "thingsType": 11
        }).then(res => {
          if (res.code) {
            this.$message.success(this.$t('common.unBindSuccess'));
            this.handleGetRoomThingsList();
          } else {
            this.$message.error(res.message);
          }
        })
      })
    },
    handleAddUser() {
      this.$refs.SetPrincipal.open(0, this.id, 11);
    },
    handleShowAlarmScope(value) {
      return !DEVICE_ID[value];
    },
    handleDeviceDrawer(item) {
      if (!item.isLook) {
        return this.$message.error(this.$t('common.NoPermission'));
      }
      switch (item.type) {
        case 0:
          this.deviceDrawer = true;
          this.deviceId = item.encodeId;
          break
        case 10:
          this.smartSocketDrawer = true;
          this.smartSocketId = item.encodeId;
          break
        case 8:
          this.outageAlarmDrawer = true;
          this.outageAlarmId = item.encodeId;
          break
        case 7:
          this.alerterDrawer = true;
          this.alerterId = item.encodeId;
          break
      }
    },
    handleIsClose() {
      this.$emit("handleCloseDrawer", false);
    }
  }
}
</script>

<style lang="less" scoped>
.bind-name{
  line-height: 30px;
}
.stateMonitor {
  margin-bottom: 30px;

  .monitorBoxGroup {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;

    .monitorBox-item {
      width: 240px;
      padding: 12px 20px;
      border-radius: 3px;
      color: #fff;
      background-color: #ff4949;
      margin-left: 20px;
      margin-top: 20px;

      .header {
        height: 20px;
        line-height: 20px;
        font-size: 12px;

        .name {
          font-size: 16px;
          font-weight: bold;
          margin-right: 10px;
        }
      }

      .num {
        height: 60px;
        line-height: 60px;
        text-align: center;
        font-size: 32px;
        font-weight: bold;
      }

      .range {
        font-size: 12px;
        height: 32px;
        line-height: 20px;
      }

      .unit {
        float: right;

        i {
          font-style: normal;
          color: #fff;
          font-size: 14px;
        }
      }
    }
  }
}

.room-circular {
  width: 115px;
  height: 115px;
  border-radius: 50%;
  border: 10px solid #00c1de;
  background: #00c1de;
  color: #FFFFFF;
  font-size: 20px;
  font-weight: 500;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: 1.5;
}

.new-state-col {
  width: 24.7%;
}

.new-state-col:first-child {
  margin-left: 14px;
}

.adaptationScreen.el-col-8 {
  width: 32.8%
}

</style>
