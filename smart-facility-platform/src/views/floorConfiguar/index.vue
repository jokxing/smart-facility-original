<template xmlns="">
  <div
      v-loading="loading"
      class="designerLayout designer_fullScreen"
      element-loading-background="rgba(0, 0, 0, 0.8)"
      style="touch-action: none;">
    <div class="designerHeader" :class="{ 'demo-header-toolbar': isDemo }">
      <div class="layout-left-nav" v-show="allBtn">
        <span :class="overviewVisible ? 'folderUp' : ''" class="unfolder" @click="handleClickIsFolder"></span>
        <div class="header-toolbar">
          <div class="toolbar-group filter-group" data-testid="status-filter-group">
            <div class="layout-switch">
              <div :class="senorStatusType === 3000 ? 'is-active':''" class="type-button" @click="handleShowAllData">{{ $t('dataV.allShow') }}
              </div>
              <div :class="senorStatusType === null ? 'is-active':''" class="type-button" @click="handleCloseAllData">{{ $t('dataV.allClose') }}
              </div>
              <div :class="senorStatusType === 1 ? 'is-active':''" class="type-button" @click="senorStatusType = 1">{{ $t('common.normal') }}</div>
              <div :class="senorStatusType === 2 ? 'is-active':''" class="type-button" @click="senorStatusType = 2">{{ $t('common.abnormal') }}</div>
              <div :class="senorStatusType === -100 ? 'is-active':''" class="type-button" @click="senorStatusType = -100">
                  {{ $t('common.offLine') }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="title">{{ floorName }}</div>
      <div class="nav" v-show="allBtn">
        <div class="navItem back" @click="handleBackToList"><i></i>{{ $t('common.back') }}</div>
        <div class="navItem" @click="handleConfiguar" v-if="$store.state.level">{{ $t('dataV.inDeploy') }}</div>
        <div v-if="isDemo" class="navItem" @click="handleToRoomLayout">查看设备布局</div>
        <div class="navItem" @click="handleToScreen('roomDataV')">{{ $t('dataV.labDeviceDataV') }}</div>
        <div class="navItem" @click="handleToScreen('floorDataV')">{{ $t('dataV.roomDataV') }}</div>
      </div>
    </div>
    <!-- @touchstart.capture="handleTouchstart" @touchmove="handleTouchmove" @touchend="handleTouchend" -->
    <div ref="layout" class="layout" @mousewheel.prevent="detectZoom" @touchstart.capture="handleTouchstart" @touchmove="handleTouchmove" @touchend="handleTouchend">
      <v-stage ref="stage" :config="config">
        <v-layer ref="backgroundLayer">
          <v-image :config="bgConfig"></v-image>
        </v-layer>
        <v-layer>
          <template v-for="(item, index) in deviceList">
            <v-group
                v-if="!isDemo || senorStatusTypeShow(senorStatusType, item.senorStatus)"
                :key="item.id"
                :config="{
                  x: item.x * ratio,
                  y: item.y * ratio,
                  name: `deviceGroup${index}`,
                }"
            >
              <!-- <v-rect
                  :config="{
                  x: 0,
                  y: 0,
                  width: 180,
                  height: 80,
                }"
              ></v-rect> -->
              <v-text
                  :config="{
                    x: 38 * ratio,
                    y: 0,
                    width: item.width,
                    text: item.name,
                    fontSize: item.fontSize * ratio,
                    fill: item.color,
                    fontFamily: 'RuiZiZhenYanTi',
                  }"
                  @dblclick="handleRoomDetail(item, $event)"
                  @mousedown="handleMouseDown(item, $event)"
                  @mouseout="handleNoPathRoom"
                  @mouseover="handlePathRoom(item, $event)"
                  @mousemove="moveRoomHover"
                  @touchstart="handleMouseDown(item, $event)"
              ></v-text>
              <v-image
                  v-if="(item.deviceList && item.deviceList.length > 0) || showDemoRoomStatus(item)"
                  :config="{
                    image:
                      item.senorStatus === 1
                      ? successImage
                      : (item.senorStatus === 2 || item.senorStatus === 0)
                      ? errorImage
                      : offlineImage,
                    x: 0,
                    y: 0,
                    width: 30,
                    height: 35,
                    scaleX: 1 * ratio,
                    scaleY: 1 * ratio,
                  }"
                  @mousedown="handleRoomDetail(item, $event)"
                  @mouseout="handleMouseOut"
                  @mouseover="handleMouseOver(item, $event)"
                  @mousemove="moveRoomHover"
                  @touchstart="handleRoomDetail(item, $event)"
              ></v-image>
            </v-group>
          </template>
        </v-layer>
        <v-layer>
          <template v-for="(item, index) in deviceList">
            <v-group
                v-if="senorStatusTypeShow(senorStatusType, item.senorStatus) || (!isDemo && downId == item.id)"
                :key="item.id"
                :config="{
                x: item.x * ratio,
                y: item.y * ratio,
                name: `deviceGroup${index}`,
                scaleX: item.scaleX * ratio || ratio,
                scaleY: item.scaleY * ratio || ratio,
                }"
            >
              <!-- <v-image
                  v-if="(isData && item.equipments.length) || downId == item.id"
                  :config="{
                  x:-20  / (item.scaleX ? item.scaleX : 1),
                  y: 30  / (item.scaleY ? item.scaleY : 1),
                  width: 240 / (item.scaleX ? item.scaleX : 1),
                  height: 95 / (item.scaleY ? item.scaleY : 1),
                  image: dataBg,
                }">
              </v-image> -->
              <v-rect
                v-if="(isData && item.equipments.length) || downId == item.id"
                ref="rect"
                :config="{
                  x:-20  / (item.scaleX ? item.scaleX : 1),
                  y: 30  / (item.scaleY ? item.scaleY : 1),
                  width: 240 / (item.scaleX ? item.scaleX : 1),
                  height: 95 / (item.scaleY ? item.scaleY : 1),
                  fill: '#335c90e0',
                  cornerRadius: 10
                }"
              />
              <div v-for="(sensors, index1) in handleSensors(item)" :key="index1">
                <div v-if="isData || downId == item.id">
                  <div v-if="index1 <= 5">
                    <div>
                      <v-text
                          v-if="index1 %3 === 0"
                          :key="index1"
                          :config="handleAliasConfig(-14,index1,item,sensors)"
                      >
                      </v-text>
                      <v-text
                          v-else-if="index1 %3 === 1"
                          :key="index1"
                          :config="handleAliasConfig(66,index1,item,sensors)"
                      >
                      </v-text>
                      <v-text
                          v-else
                          :key="index1"
                          :config="handleAliasConfig(146,index1,item,sensors)"
                      >
                      </v-text>
                      <v-text
                          v-if="index1 %3 === 0"
                          :key="sensors.id"
                          :config="handleValConfig(-14,index1,item,sensors)">
                      </v-text>
                      <v-text
                          v-else-if="index1 %3 === 1"
                          :key="sensors.id"
                          :config="handleValConfig(66,index1,item,sensors)">
                      </v-text>
                      <v-text
                          v-else
                          :key="sensors.id"
                          :config="handleValConfig(146,index1,item,sensors)">
                      </v-text>
                    </div>
                  </div>
                </div>
              </div>
            </v-group>
          </template>
        </v-layer>
      </v-stage>
    </div>
    <div class="dropdown-btn" :title="$t('dataV.showHandle')" @click="allBtn = !allBtn">
      <i class="icon-dropdown"></i>
    </div>
    <!-- <div id="index" :class="{ index150: isScreen === 2}">
    </div> -->
    <div v-if="isShowFloor && allBtn" :class="isFloor ? 'up-left' : ''" class="right-ring" @click="isFloor = !isFloor">
      <i class="icon-dropdown" style="font-size: 12px;"></i>
    </div>
    <div v-if="isFloor && allBtn" class="right-bg">
      <div class="right-btn">
        <div v-if="floorBtns.length > 0" class="floor-btn">
          <div v-for="item in floorBtns"
               :key="item.id"
               class="time">
            <el-button
                :class="{'is-active': item.id == floorId}"
                @click="goFloorView(item)">
              {{ item.name }}
            </el-button>
            <div class="dotted-line"></div>
          </div>
        </div>
        <div class="icon" @click.stop="showBuildingBtn =! showBuildingBtn">
          <img alt="" src="../../assets/centerControl/building-icon.png">
        </div>
        <div v-show="!showBuildingBtn" class="building-btn">
          <div
              v-for="(item, index) in buildingData"
              :key="item.id">
            <el-button
                v-if="item.id === buildingNumIndex"
                :class="{ active: item.id === buildingNumIndex }"
                @click="handleBuildingNum(item.id, index)">
              {{ item.name }}
            </el-button>
          </div>
        </div>
        <transition name="building-fade">
          <div v-show="showBuildingBtn" class="building-btn">
            <template v-for="(item, index) in buildingData">
              <el-button
                  v-if="index <1"
                  :key="item.id"
                  :class="{ active: item.id === buildingNumIndex }"
                  @click="handleBuildingNum(item.id, index)">
                {{ item.name }}
              </el-button>
            </template>
          </div>
        </transition>
      </div>
    </div>
    <div v-if="isDemo && hoverRoom" class="demo-room-tooltip" role="tooltip"
      :style="{left: roomHoverPoint.x + 'px', top: roomHoverPoint.y + 'px'}">
      <strong>{{ hoverRoom.name }}</strong>
      <template v-if="hoverRoom.deviceSummary">
        <div>设备 {{ hoverRoom.deviceSummary.total }} 台</div>
        <div>正常 {{ hoverRoom.deviceSummary.normal }} · 告警 {{ hoverRoom.deviceSummary.alarm }} · 离线 {{ hoverRoom.deviceSummary.offline }}</div>
        <div v-if="hoverRoom.deviceSummary.unknown">未知 {{ hoverRoom.deviceSummary.unknown }}</div>
      </template>
      <div v-else>暂无设备统计</div>
      <small>演示数据</small>
    </div>
    <RoomStatisticsDrawer :floorData="floorData"></RoomStatisticsDrawer>
    <div v-if="isDemo && selectedRoomCard" :style="{left: roomCardPoint.x + 'px', top: roomCardPoint.y + 'px'}" style="position: fixed; z-index: 30; padding: 20px; width: 290px; box-sizing: border-box; background: #173b50; color: #d5edf4; border: 1px solid #62a6bb; border-radius: 8px;">
      <strong>{{ selectedRoomCard.name }}</strong>
      <button class="room-card-close" type="button" aria-label="关闭房间操作卡" title="关闭" @click="selectedRoomCard = null">
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="11" fill="#e66060" stroke="#fff" />
          <path d="M8 8L16 16M8 16L16 8" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
      <div style="margin-top: 12px;">
        <el-button @click="showSelectedRoomDetail">查看详情</el-button>
        <el-button type="primary" @click="enterSelectedRoom">进入房间</el-button>
      </div>
    </div>
    <RoomDrawerNew :isDrawer.sync="isDrawerNew" :roomId.sync="roomId" />
    <Drawer :departments="departments" :is-drawer.sync="isDrawer" :room-id.sync="roomId" @handle="handleCloseDrawer"/>
  </div>
</template>
<script>
import {mapMutations, mapState} from "vuex";
import {mapFloorOverview} from "@/api/centerController";
import {fetchDemoScenario, updateDemoScenario} from "@/api/demoScenario";
import RoomStatisticsDrawer from "./components/RoomStatistics.vue";
import {BASE_URL,DATAZOOM} from "@/utils/constant.js";
import {resolveFloorMapUrl} from "@/utils/demoFloorMapUrl";
import Drawer from "@/views/room/components/RoomDrawer";
import RoomDrawerNew from "@/views/room/components/RoomDrawerNew";
import {getDepartment} from "@/api/department";
import {getRoomDetail} from "@/api/room";
import "@/plugins/konva";

const isDemo = process.env.VUE_APP_DEMO === "true";
const DEMO_LAYOUT_ROOM_IDS = [950001, 950003];
let scal = 1.05;
let width = 1678, height = 795;
let element, time, elementKonva, timeIn;
let textY = 30;
export default {
  components: {
    Drawer,
    RoomDrawerNew,
    RoomStatisticsDrawer,
  },
  props: {
    data: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      loading: true,
      errorImage: null,
      offlineImage: null,
      successImage: null,
      bgConfig: {},
      textConfig: {},
      deviceList: [],
      floorData: {},
      selectedShapeName: "",
      statusConfig: {},
      selectedRoomKey: "",
      config: {},
      roomStatistics: {},
      ratio: 1,
      room: {},
      roomId: null,
      selectedRoomCard: null,
      roomCardPoint: {x: 12, y: 80},
      isDrawer: false,
      isDrawerNew: false,
      departments: [],
      transform: "translateX(-50%) translateY(-43%) scaleX(1) scaleY(1)",
      floorName: "",
      isScreen: 0,
      isData: false,
      senorStatusType: isDemo ? 3000 : 2,
      sensors: [],
      downId: null,
      dataBg: null,
      iconType: null,
      floorId: null,
      scal: 1.05,
      buildingData: [],
      buildingNumIndex: null,
      floorBtns: [],
      showBuildingBtn: false,
      mapId: null,
      mapUrl: null,
      isFloor: false,
      isShowFloor: false,
      allBtn: true,
      displacement: {
        moveable: false,
        scale: 1.05
      },
      blockChildEle: false,
      touSet: null,
      touSet2: null,
      isDemo,
      hoverRoom: null,
      roomHoverPoint: {x: 0, y: 0},
      demoScenario: 'normal'
    };
  },
  created() {
    this.floorName = this.$route.query.floorName;
    this.mapId = this.$route.query.mapId;
    time = null;
  },
  mounted() {
    this.loadDemoScenario();
    let pic1 = require("@/assets/centerControl/status_warn.png");
    let pic2 = require("@/assets/centerControl/status_offline.png");
    let pic3 = require("@/assets/centerControl/status_success.png");
    this.handleInitView();
    this.loadImage(pic1)
        .then((pic) => {
          this.errorImage = pic;
          return this.loadImage(pic2);
        })
        .then((pic) => {
          this.offlineImage = pic;
          return this.loadImage(pic3);
        })
        .then((pic) => {
          this.successImage = pic;
        });

    let dataBgPic = require("@/assets/centerControl/charts-type.png");
    this.loadImage(dataBgPic)
        .then((pic) => {
          this.dataBg = pic;
        })
    if (this.$route.query) {
      let {floorId} = this.$route.query;
      this.floorId = floorId * 1;
      if (floorId) {
        this.getDrawerDataAsync();
        new Promise((resolve, reject) => {
          timeIn = setInterval(() => {
            this.getDrawerDataAsync();
            resolve();
          }, 60000)
        })
      }
      this.mapUrl = this.$route.query.mapUrl;
      const _ = this;
      _.handleResize();
      window.onresize = () => {
        return (() => {
          _.handleResize();
        })();
      };
    }
    if (screen.height < 1080) {
      if (screen.height >= 800) {
        this.isScreen = 1;
      } else {
        this.isScreen = 2;
      }
    }

  },
  computed: {
    ...mapState("cmap", {
      overviewVisible: "overviewVisible",
    }),
  },
  methods: {
    moveRoomHover(event) {
      if (!isDemo || !event || !event.evt) return;
      this.roomHoverPoint = {
        x: Math.max(12, Math.min(event.evt.clientX + 18, window.innerWidth - 282)),
        y: Math.max(12, Math.min(event.evt.clientY + 18, window.innerHeight - 165))
      };
    },
    handleRefreshTime() {
      clearInterval(timeIn);
      timeIn = "";
      new Promise((resolve, reject) => {
        timeIn = setInterval(() => {
          this.getDrawerDataAsync();
          resolve();
        }, 60000)
      })
    },
    handleIsUrlNoQuery() {
      let floorArray = JSON.parse(localStorage.getItem("floor")) ?? null;
      if (!floorArray) {
        if(this.$route.query.mapUrl){
          this.mapUrl = this.$route.query.mapUrl;
          var obj = {id: this.$route.query.floorId, name: this.floorName, mapUrl: this.mapUrl, mapId: this.mapId}
        }else{
          for(var i = 0; i < this.floorBtns.length; i++){
            if(this.floorBtns[i].id === 91){
              var floorBtns = this.floorBtns[i]
            }
          }
          this.mapUrl = floorBtns.mapUrl;
          var obj = {id: floorBtns.id, name: floorBtns.name, mapUrl: this.mapUrl, mapId: floorBtns.mapId}
        }
        localStorage.setItem("floor", JSON.stringify(obj));
        floorArray = obj;
      }else{
        floorArray = JSON.parse(localStorage.getItem("floor"))
      }

      this.floorId = floorArray.id;
      this.mapUrl = floorArray.mapUrl;
      this.floorName = floorArray.name;
      this.mapId = floorArray.mapId;

      this.handleResize();
      this.getDrawerDataAsync();
      this.handleRefreshTime();
    },
    goFloorView(item) {
      this.loading = true;
      this.deviceList = [];
      this.floorId = item.id;
      this.floorName = item.name;
      this.mapUrl = item.mapUrl;
      this.mapId = item.mapId;
      localStorage.setItem("floor", JSON.stringify(item));
      this.$nextTick(() => {
        const image = new window.Image();
        const resolved = resolveFloorMapUrl(item.mapUrl, BASE_URL);
        if (!resolved) {
          this.loading = false;
          this.$message.warning("当前楼层暂无可用平面图");
          return;
        }
        image.src = resolved;
        this.bgConfig.image = image;
      })
      this.getDrawerDataAsync();
      this.handleRefreshTime();
    },
    handleBuildingNum(id, index) {
      this.buildingNumIndex = id;
      this.floorBtns = [];
      for (let i = this.buildingData[index].subDivisions.length - 1; i >= 0; i--) {
        this.floorBtns.push(this.buildingData[index].subDivisions[i]);
      }
    },
    handleShowAllData() {
      this.isData = true;
      this.senorStatusType = 3000;
    },
    handleCloseAllData() {
      this.isData = false;
      this.senorStatusType = null;
    },
    senorStatusTypeShow(activeValue, value) {
      if (isDemo) return activeValue != null && (Number(activeValue) === 3000 || Number(activeValue) === Number(value));
      if (Number(activeValue) === value) {
        this.isData = true;
        return true;
      }
      return Number(activeValue) === 3000;
    },
    handleAliasConfig(x, index1, item, sensors) {
      var data = {
        x: x / (item.scaleX ? item.scaleX : 1),
        y: this.handleTextY(index1) / (item.scaleY ? item.scaleY : 1),
        fontSize: 12 / (item.scaleX ? item.scaleX : 1),
        fill: '#fff',
        text: sensors['sensorType'] ? sensors.sensorType.sensorAlias : '',
      };
      return data
    },
    handleValConfig(x, index1, item, sensors) {
      var data = {
        x: x,
        y: this.handleTextY(index1) / (item.scaleY ? item.scaleY : 1) + 15,
        fontSize: 13,
        fill: this.handleGetStatusColor(sensors.status, sensors),
        text: sensors.signalSwitchStatus === 1 ? "关闭" : this.handleSensorVal(sensors),
      };
      return data
    },
    handleTextY(index) {
      switch (index) {
        case 3:
          return textY = 80
        case 4:
          return textY = 80
        case 5:
          return textY = 80
        case 6:
          return textY = 95
        case 7:
          return textY = 95
        case 8:
          return textY = 95
        default:
          return textY = 44
      }
    },
    // 润鹏
    handleAliasConfigRP(index1, item, sensors) {
      var data = {
        x: 0,
        y: this.handleTextYRP(index1) / (item.scaleY ? item.scaleY : 1),
        fontSize: 14 / (item.scaleX ? item.scaleX : 1),
        fill: this.handleGetStatusColor(sensors.status, sensors),
        text: sensors['sensorType'] ? sensors.sensorType.sensorAlias : '',
        stroke: '#fff',
        strokeWidth: 2,
        fillAfterStrokeEnabled: true,
      };
      return data
    },
    // 润鹏
    handleValConfigRP(index1, item, sensors) {
      var data = {
        x: 90,
        y: this.handleTextYRP(index1) / (item.scaleY ? item.scaleY : 1),
        fontSize: 14,
        fill: this.handleGetStatusColor(sensors.status, sensors),
        text: sensors.signalSwitchStatus === 1 ? this.$t('common.close') : this.handleSensorVal(sensors),
        stroke: '#fff',
        strokeWidth: 2,
        fillAfterStrokeEnabled: true,
      };
      return data
    },
    // 润鹏
    handleAliasValConfigRP(index1, item, sensors) {
      var data = {
        x: 15,
        y: this.handleTextYRP(index1) / (item.scaleY ? item.scaleY : 1),
        fontSize: 14 / (item.scaleX ? item.scaleX : 1),
        fill: this.handleGetStatusColor(sensors.status, sensors),
        text: (sensors['sensorType'] ? sensors.sensorType.sensorAlias : '') + (sensors.signalSwitchStatus === 1 ? '\xa0\xa0\xa0\xa0' + "【关闭】" : '\xa0\xa0\xa0\xa0' + this.handleSensorVal(sensors)),
        // stroke: '#fff',
        // strokeWidth: 2,
        // fillAfterStrokeEnabled: true,
      };
      return data
    },
    // 润鹏
    handleTextYRP(index) {
      switch (index) {
        case 0:
          return textY = 36
        case 1:
          return textY = 56
        case 2:
          return textY = 76
        case 3:
          return textY = 96
        case 4:
          return textY = 116
        case 5:
          return textY = 136
        case 6:
          return textY = 156
        case 7:
          return textY = 176
      }
    },
    handleSensorVal(item) {
      if (item !== [] && item["sensorType"]) {
        if (DATAZOOM[item.type]) {
            const obj = DATAZOOM[item.type];
            if(item.status === -111){
                return obj[1]
            }else{
                return item.value ? obj[2] : obj[1];
            }
        } else {
            return item.value + item.sensorType.unit
        }
    }
    },
    handleSensors(item) {
      let array = [];
      item.equipments.map(device => {
        device.sensors.map(sensor => {
          sensor.type !== 21 && sensor.showFlag && array.push(sensor);
        })
      });
      return array;
    },
    handleInitView() {
      if (screen.height < 1080) {
        if (screen.height >= 800) {
          this.ratio = 0.8;
        }else{
          this.ratio = 0.7;
        }
        // if (screen.height >= 800) {
        //   this.ratio = 0.7;
        // } else {
        //   this.ratio = 0.55;
        // }
      }
      width = 1678 * this.ratio;
      height = 795 * this.ratio;
    },
    ...mapMutations("cmap", {
      handleSetIsDrawer: "SETISOVERVIEWDRAWER",
    }),
    handleCloseDrawer(val) {
      this.isDrawer = val;
    },
    async getDrawerDataAsync() {
      try {
        let temp = [];
        let stemp = [];
        let result = await mapFloorOverview({
          floorId: this.floorId,
        });
        this.loading = false;
        if (result.code === 1) {
          this.floorData = result.items;
          // Prefer overview as source of truth for name/map (SaaS edits sync on refresh).
          if (result.items) {
            if (result.items.floorName) this.floorName = result.items.floorName;
            if (result.items.mapId != null) this.mapId = result.items.mapId;
            if (result.items.mapUrl != null && result.items.mapUrl !== '' && result.items.mapUrl !== this.mapUrl) {
              this.mapUrl = result.items.mapUrl;
              this.handleInit(this.config && this.config.width, this.config && this.config.height);
            }
          }
          if (
              result.items &&
              result.items.labList &&
              result.items.labList.length >= 0
          ) {
            // Only paint placed markers (reject sentinel / invalid coords).
            temp = result.items.labList.filter(room => {
              const x = Number(room && room.x);
              const y = Number(room && room.y);
              return Number.isFinite(x) && Number.isFinite(y) && x > -1000 && y > -1000;
            });
            for (let i = 0; i < temp.length; i++) {
              let ctemp = [];
              for (let j = 0; j < (temp[i].equipments || []).length; j++) {
                for (let k = 0; k < (temp[i].equipments[j].sensors || []).length; k++) {
                  ctemp.push(temp[i].equipments[j].sensors[k]);
                }
                this.sensors = [];
                const obj = temp[i].equipments[j];
                if (temp[i].equipments[j].type == 8) {
                  temp[i].senorStatus = obj.status;
                  obj.sensors = [{
                    status: obj.powerFailure,
                    sensorType: {sensorAlias: obj.name},
                    type: 17,
                    value: obj.powerFailure
                  }];
                  ctemp.push(obj);
                }

                // this.sensors.push(obj.sensors);
              }
              let obj = {
                ...temp[i],
                deviceList: ctemp,
              };
              stemp.push(obj);
            }
          }
        }
        this.deviceList = stemp;
      } catch (err) {
        // this.deviceList = [];
        throw err;
      }
    },

    handleClickIsFolder() {
      this.handleSetIsDrawer();
    },

    handleBackToList() {
      this.$router.push("/building");
    },

    async loadDemoScenario() {
      if (!isDemo) return;
      try {
        const res = await fetchDemoScenario();
        if (res && res.code === 1 && res.items) {
          this.demoScenario = res.items.scenario || 'normal';
        }
      } catch (_) {
        this.demoScenario = 'normal';
      }
    },

    async handleDemoScenario(scenario) {
      this.hoverRoom = null;
      if (!isDemo) return;
      try {
        const res = await updateDemoScenario(scenario);
        if (res && res.code === 1 && res.items) {
          this.demoScenario = res.items.scenario;
          await this.getDrawerDataAsync();
          const label = this.demoScenario === 'alarm' ? '异常' : (this.demoScenario === 'offline' ? '离线' : '正常');
          this.$message.success('已切换演示场景：' + label + '（房间状态图标已更新）');
        } else if (res && res.message) {
          this.$message.error(res.message);
        }
      } catch (err) {
        this.$message.error((err && err.message) || '场景切换失败');
      }
    },

    showDemoRoomStatus(item) {
      return isDemo && item && DEMO_LAYOUT_ROOM_IDS.includes(item.id);
    },

    handleToRoomLayout() {
      if (!isDemo) return;
      const selected = this.deviceList.find(item => item.id === this.roomId);
      const fallback = this.deviceList.find(item => DEMO_LAYOUT_ROOM_IDS.includes(item.id))
        || this.deviceList.find(item => item.id === 950001);
      const room = (selected && DEMO_LAYOUT_ROOM_IDS.includes(selected.id) ? selected : null) || fallback;
      if (!room) {
        return this.$message.info('当前楼层暂无实验室设备布局');
      }
      this.$router.push({
        name: 'RoomView',
        query: {
          roomId: room.id,
          roomName: room.name
        }
      });
    },

    handleConfiguar() {
      if (!this.$store.state.level) {
        return this.$message.error(this.$t('dataV.noRule'))
      }
      let {floorId, mapUrl, mapId} = this.$route.query;
      this.$router.push({
        path: "/floor/designer",
        query: {
          floorId: this.floorId,
          mapUrl: this.mapUrl,
          mapId: this.mapId,
          floorName: this.floorName
        },
      });
    },

    handleToScreen(url) {
      if (isDemo && url !== 'floorDataV' && url !== 'roomDataV') {
        return this.$message.info("本阶段尚未接入该大屏");
      }
      let {floorId} = this.$route.query;
      this.$router.push({
        path: "/" + url,
        query: {
          floorId: this.floorId || floorId,
        },
      });
    },
    handlePathRoom(item, event) {
      if (isDemo) { this.hoverRoom = item; this.moveRoomHover(event); }
      document.body.style.cursor = "pointer";
    },
    handleNoPathRoom() {
      this.hoverRoom = null;
      document.body.style.cursor = "";
    },
    handleMouseOver(data, event) {
      if (isDemo) {
        this.hoverRoom = data;
        this.moveRoomHover(event);
        document.body.style.cursor = 'pointer';
        return;
      }
      if (!data.isEdit) {
        return false;
      }
      let {id} = data;
      this.selectedRoomKey = id;
      document.body.style.cursor = "pointer";
      const e = window.event;
      this.downId = data.id;
      // this.createElement(data);
    },
    /**** 创建一个div ****/
    createElement(data) {
      let html = "";
      const e = event || window.event;
      let length = 0,
          left = "left:" + (e.clientX + 5) + "px",
          top = "top:" + (e.clientY - 140) + "px;";
      element = document.getElementById("index");
      data.equipments.forEach(item => {
        item.sensors.forEach(sensor => {
          length += 1;
          if (length <= 8) {
            if (this.isScreen === 0 || this.isScreen === 1) {
              html += `<div class="charts-type device-name" style="color: ${this.handleGetStatusColor(sensor.status)}; width: 50%;font-size: 16px;line-height: 26px;padding-right:16px"><span style="color:#fff;text-shadow: #07173580 2px 0px 3px;">${sensor.sensorType.name}：</span><span style="text-shadow: #07173566 2px 0px 3px;font-weight: bold;">${this.handleSensorVal(sensor)}</span></div>`
            }
            if (this.isScreen === 2) {
              html += `<div class="charts-type device-name-two" style="color: ${this.handleGetStatusColor(sensor.status)}; width: 50%;font-size: 12px;line-height: 20px;padding-right:10px"><span style="color:#fff;text-shadow: #07173580 2px 0px 3px;">${sensor.sensorType.name}：</span><span style="text-shadow: #07173566 2px 0px 3px;font-weight: bold;">${this.handleSensorVal(sensor)}</span></div>`
            }
          }

        })
      })
      if (document.body.clientWidth - e.clientX < 300) {
        if (this.isScreen === 0) {
          left = "left:" + (e.clientX - 100) + "px";
        }
        if (this.isScreen === 1) {
          left = "left:" + (e.clientX - 60) + "px";
        }
        if (this.isScreen === 2) {
          left = "left:" + (e.clientX - 10) + "px";
        }
      }
      if (this.isScreen === 2) {
        top = "top:" + (e.clientY - 130) + "px;";
      }
      /**** 根据传感器个数给定长度， 根据鼠标位置给定显示位置 ****/
      // element.style = "z-index: 3000;padding:30px;border-radius: 4px;width: 200px; height: " + (25 * length + 50) + "px;opacity: 0.9; position: absolute;" + top + left ;
      element.style = "z-index: 3000;padding:16px 0 42px 45px;position: absolute;" + top + left;
      element.innerHTML = html;
    },
    handleMouseOut() {
      this.hoverRoom = null;
      this.selectedRoomKey = "";
      document.body.style.cursor = "default";
      // element.style = "";
      // element.innerHTML = "";
      this.downId = null
    },

    handleResize() {
      this.hoverRoom = null;
      this.handleInitView();
      this.config = {
        width,
        height,
      };
      this.handleInit(width, height);
    },
    handleInit(width, height) {
      this.$nextTick(() => {
        const resolved = resolveFloorMapUrl(this.mapUrl, BASE_URL);
        if (!resolved) {
          this.bgConfig = {};
          return;
        }
        const image = new window.Image();
        image.onload = () => {
          this.bgConfig = {
            x: 0,
            y: 0,
            image,
            width: width,
            height: height,
          };
        };
        image.onerror = () => {
          this.$message.warning("平面图资源加载失败");
        };
        image.src = resolved;
      });
    },

    // 触摸事件
    handleTouchstart(event) {
      this.hoverRoom = null;
      this.blockChildEle = true;
      this.touSet = setTimeout(() => {
        this.blockChildEle = false
      },300)

      var touches = event.touches;
      var events = touches[0];
      var events2 = touches[1];

      // event.preventDefault();

      // 第一个触摸点的坐标
      this.displacement.pageX = events.pageX;
      this.displacement.pageY = events.pageY;

      this.displacement.moveable = true;

      if (events2) {
        this.blockChildEle = true;
        clearTimeout(this.touSet);
        clearTimeout(this.touSet2);
        this.displacement.pageX2 = events2.pageX;
        this.displacement.pageY2 = events2.pageY;
      }

      this.displacement.originScale = this.displacement.scale || 1;
    },
    // 滑动事件
    handleTouchmove(event){
      this.blockChildEle = true;
      clearTimeout(this.touSet);

      if (!this.displacement.moveable) {
        return;
      }

      var touches = event.touches;
      var events = touches[0];
      var events2 = touches[1];

      if(events2){
        // 第2个指头坐标在touchmove时候获取
        if (!this.displacement.pageX2) {
          this.displacement.pageX2 = events2.pageX;
        }
        if (!this.displacement.pageY2) {
          this.displacement.pageY2 = events2.pageY;
        }

        var zoom =
          this.getDistance(
            {
              x: events.pageX,
              y: events.pageY
            },
            {
              x: events2 ? events2.pageX : '',
              y: events2 ? events2.pageY : ''
            }
          ) /
          this.getDistance(
            {
              x: this.displacement.pageX,
              y: this.displacement.pageY
            },
            {
              x: this.displacement.pageX2,
              y: this.displacement.pageY2
            }
          );
        // 应用在元素上的缩放比例
        var newScale = this.displacement.originScale * zoom;
        // 最大缩放比例限制
        if (newScale >= 1.2) {
          newScale = 1.2;
        }
        if(newScale <= 0.8){
          newScale = 0.8
        }
        // 记住使用的缩放值
        this.displacement.scale = newScale;
        // 图像应用缩放效果
        let elementKonva = document.querySelector(".konvajs-content");
        elementKonva.style.transform = "translateX(-50%) translateY(-50%) scale(" + newScale + ")";
      }
    },
    // 手指离开事件
    handleTouchend(event){
      if(event.touches.length <= 1){
        this.displacement.pageX2 = null;
        this.displacement.pageY2 = null
      }
    },
    // 点击房间名称
    handleMouseDown(data, ev) {
      if (this.isDemo) {this.openRoomCard(data, ev); return;}
      this.touSet2 = setTimeout(() => {
        if(!this.blockChildEle){
          if (time) {
            time = clearTimeout(time);
          } else {
            time = setTimeout(() => {
              if (ev.evt.cancelBubble) {
                return false
              } else {
                if (!data.isEdit) {
                  return this.$message.error(this.$t('dataV.noLookRule'));
                } else if (process.env.VUE_APP_DEMO === 'true') {
                  // Demo: room name click opens read-only drawer (RoomView route not opened yet).
                  this.roomId = data.id;
                  if (data.openTwoSystem) {
                    this.isDrawerNew = true;
                  } else {
                    this.isDrawer = true;
                  }
                } else {
                  let {id, name} = data;
                  this.$router.push({
                    name: "RoomView",
                    query: {
                      roomId: id,
                      roomName: name
                    },
                  });
                }
              }
            }, 200);
          }
        }
      },400)
    },

    // handleMouseDown(data, ev) {
    //   if (time) {
    //     time = clearTimeout(time);
    //   } else {
    //     time = setTimeout(() => {
    //       if (ev.evt.cancelBubble) {
    //         return false
    //       } else {
    //         if (!data.isEdit) {
    //           return this.$message.error("抱歉，你没有该房间查看权限");
    //         } else {
    //           let {id, name} = data;
    //           this.$router.push({
    //             name: "RoomView",
    //             query: {
    //               roomId: id,
    //               roomName: name
    //             },
    //           });
    //         }
    //       }
    //     }, 500);
    //   }
    // },

    loadImage(src) {
      return new Promise((resolve, reject) => {
        let image = new Image();
        image.onload = () => {
          resolve(image);
        };
        image.onerror = () => {
          const err = new Error(this.$t('dataV.imgLoadingErr') +` ${src}`);
        };
        image.src = src;
      });
    },

    handleSerialize(data) {
      let obj = {
        x: 50,
        y: 80,
        radius: 10,
      };
      let {statusStr} = data;
      let color = "#19E98E";
      if (statusStr === "离线") {
        color = "#B7C3D9";
      } else if (statusStr === "报警") {
        color = "#F76666";
      } else {
        color = "#19E98E";
      }
      return {
        ...obj,
        fill: color,
      };
    },

    handleGetStatusColor(status) {
      let color = "";
      switch (status) {
        case 1:
          color = "#19E98E";
          break;
        case 2:
          color = "#F76666";
          break;
        case -100:
          color = "#B7C3D9";
          break;
        default:
          color = "#ffffff";
      }
      return color;
    },

    openRoomCard(room, event) {
      const native = event && event.evt;
      const point = native && ((native.touches && native.touches[0]) || native);
      const x = point && Number.isFinite(point.clientX) ? point.clientX : window.innerWidth / 2;
      const y = point && Number.isFinite(point.clientY) ? point.clientY : window.innerHeight / 2;
      this.roomCardPoint = {
        x: Math.max(12, Math.min(x + 16, window.innerWidth - 302)),
        y: Math.max(70, Math.min(y + 16, window.innerHeight - 170))
      };
      this.selectedRoomCard = room;
    },
    showSelectedRoomDetail() {
      const room = this.selectedRoomCard;
      if (!room) return;
      this.roomId = room.id;
      this.isDrawerNew = true;
      this.selectedRoomCard = null;
    },
    enterSelectedRoom() {
      const room = this.selectedRoomCard;
      if (!room) return;
      const {resolveRoomMapUrlByRoomId} = require('@/utils/demoRoomMapUrl');
      if (!resolveRoomMapUrlByRoomId(room.id)) return this.$message.warning('该房间暂无底图，请在房间管理上传。');
      this.selectedRoomCard = null;
      this.$router.push({name: 'RoomView', query: {roomId: room.id, roomName: room.name}});
    },
    async handleRoomDetail(item, e) {
      if (this.isDemo) {this.openRoomCard(item, e); return;}
      if (time) {
        time = clearTimeout(time);
      }
      if (!item.isEdit) {
        return this.$message.error(this.$t('dataV.noLookRule'));
      } else {
        // e.evt.cancelBubble = true;
        // const res = await getDepartment();
        // this.departments = res.code ? res.items.list : this.$message.error(res.message);
        // const roomRes = await getRoomDetail({id: item.id});
        // this.room = roomRes.code ? roomRes.items : this.$message.error(roomRes.message);
        this.roomId = item.id;
        if(item.openTwoSystem){
          this.isDrawerNew = true;
        }else{
          this.isDrawer = true;
        }
      }
    },
    detectZoom(e) {
      this.hoverRoom = null;
      const ev = e || window.event;
      elementKonva = document.getElementsByClassName("konvajs-content")[0];
      let down = true;
      down = ev.wheelDelta ? ev.wheelDelta < 0 : ev.detail > 0;
      if (down) {
        if (scal <= 0.8) {
          return scal = 0.8;
        } else {
          scal = (parseFloat(scal) - 0.01).toFixed(2);
        }
        elementKonva.style.transform = "translateX(-50%) translateY(-50%) scale(" + scal + ")";
      } else {
        if (scal >= 1.2) {
          return false;
        }
        scal = (parseFloat(scal) + 0.01).toFixed(2);
        elementKonva.style.transform = "translateX(-50%) translateY(-50%) scale(" + scal + ")";
      }
      this.scal = scal;
      if (ev.preventDefault) {
        ev.preventDefault();
      }
      return false;
    },
    getDistance(start, stop) {
      // Math.hypot()计算参数的平方根
      return Math.hypot(stop.x - start.x, stop.y - start.y);
    },
  },
  beforeDestroy() {
    this.$nextTick(() => {
      if(this.$route.name != 'FloorDesigner' && this.$route.name != 'RoomDataV' && this.$route.name != 'FloorDataV' && this.$route.name != 'RoomView'){
        localStorage.removeItem("floor");
      }
    })
    // localStorage.removeItem("floor");
    clearInterval(timeIn);
    timeIn = "";
  }
};
</script>
<style lang="less" scoped>
.room-card-close {
  position: absolute;
  top: -12px;
  right: -12px;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  line-height: 0;
}
.demo-room-tooltip {
  position: fixed;
  z-index: 20;
  pointer-events: none;
  box-sizing: border-box;
  width: 270px;
  max-height: 153px;
  overflow: hidden;
  padding: 14px 16px;
  border: 1px solid #537f94;
  border-radius: 6px;
  background: rgba(12, 34, 49, 0.97);
  color: #d5e9f0;
  font-size: 14px;
  line-height: 1.7;
  box-shadow: 0 6px 24px #06172480;
  strong { display: block; color: #87d6ed; overflow-wrap: anywhere; }
  small { color: #8faab7; }
}
@import "./index.less";

.right-bg {
  width: 200px;
  height: 100%;
  position: absolute;
  right: 0;
  top: 0;
  background: initial; /* 针对不支持渐变的浏览器 */
  background: -webkit-linear-gradient(left, #082d4700, #00243eb5, #00243e);
  background: -o-linear-gradient(right, #082d4700, #00243eb5, #00243e);
  background: -moz-linear-gradient(right, #082d4700, #00243eb5, #00243e);
  background: linear-gradient(to right, #082d4700, #00243eb5, #00243e);

  .right-btn {
    position: absolute;
    right: 3%;
    bottom: 10%;


    .floor-btn {
      position: relative;
      padding: 14% 44px 10% 0;

      &::after {
        content: "";
        width: 2px;
        height: 100%;
        position: absolute;
        top: 0;
        right: 44px;
        background-color: #ffffff4d;
        background: -webkit-linear-gradient(#ffffff24, #ffffff4d);
        background: -o-linear-gradient(#ffffff24, #ffffff4d);
        background: -moz-linear-gradient(#ffffff24, #ffffff4d);
        background: linear-gradient(#ffffff24, #ffffff4d);
      }

      .time {
        position: relative;

        .el-button {
          min-width: 108px;
          width: 100%;
          height: 54px;
          line-height: 20px;
          background-color: initial !important;
          border: none;
          color: #ffffffde !important;
          font-size: 16px;
          margin: 0 0 1% 0;
          padding-left: 10px;
          padding-right: 35px;
          text-align: right;

          &:hover {
            background-image: url(../../assets/centerControl/floor-btn-active.png);
            background-size: 100% 100%;
            color: #fff !important;

            &::after {
              width: 0;
            }

            &::before {
              content: "";
              width: 20px;
              height: 20px;
              background-image: url(../../assets/centerControl/floor-btn-circular.png);
              background-size: contain;
              position: absolute;
              bottom: -8px;
              right: -8px;
            }
          }
        }

        .dotted-line {
          width: 24px;
          height: 2px;
          background-image: url(../../assets/centerControl/dottedLine.png);
          background-size: 100% 100%;
          position: absolute;
          top: 50%;
          right: 0;
          transform: translateY(-50%);
        }

        .is-active {
          background-image: url(../../assets/centerControl/floor-btn-active.png);
          background-size: 100% 100%;
          color: #fff !important;

          &::after {
            width: 0;
          }

          &::before {
            content: "";
            width: 20px;
            height: 20px;
            background-image: url(../../assets/centerControl/floor-btn-circular.png);
            background-size: contain;
            position: absolute;
            bottom: -8px;
            right: -8px;
          }
        }
      }

    }

    .icon {
      text-align: right;
      cursor: pointer;

      img {
        width: 90px;
      }
    }

    .building-btn {
      position: absolute;
      bottom: 16px;
      right: 100px;
      display: flex;

      .el-button {
        min-width: 100px;
        height: 40px;
        background-image: url(../../assets/centerControl/building-btn.png);
        background-size: 100% 100%;
        background-repeat: no-repeat;
        background-color: initial !important;
        color: #fff !important;
        border: none;
        border-radius: 0;

        &:hover,
        &.active {
          color: #0FEAFE !important;
        }
      }
    }
  }
}

.right-ring {
  width: 40px;
  height: 40px;
  line-height: 50px;
  text-align: center;
  border-radius: 50%;
  background: #074c62;
  cursor: pointer;
  position: absolute;
  right: -0.5%;
  top: 50%;
  z-index: 3000;
  color: #5eacc5;
  transform: rotate(90deg);
  -moz-transform: rotate(90deg);
  -webkit-transform: rotate(90deg);

  &.up-left {
    line-height: 40px;
    transform: rotate(-90deg);
    -moz-transform: rotate(-90deg);
    -webkit-transform: rotate(-90deg);
  }
}
.designerLayout .designerHeader {
  margin-right: 80px;
}
.dropdown-btn {
  width: 40px;
  height: 40px;
  margin: 0 16px;
  background: #074c62;
  border-radius: 200% 200% 50% 50%;
  text-align: center;
  line-height: 40px;
  color: #70d8ff;
  position: absolute;
  right: 20px;
  top: 20px;
  cursor: pointer;
  z-index: 1000;
  .icon-dropdown {
    font-size: 10px;
  }
  &::after {
    content: "";
    width: 2px;
    height: 40px;
    background: #074c62;
    position: absolute;
    top: -20px;
    right: 20px;
  }
}
</style>
