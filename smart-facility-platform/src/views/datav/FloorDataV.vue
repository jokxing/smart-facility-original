<template>
  <dv-full-screen-container v-if="isContainer" :class="{ 'adaptationScreen': isAdaptationScreen }">
    <dv-loading v-if="isLoading">Loading...</dv-loading>
    <div v-else class="dv-full">
      <div class="floor-title">
        <div class="left">
          <button @click="showAnalysis =! showAnalysis">{{ showAnalysis ? $t('dataV.CloseAnalysis'): $t('dataV.showAnalysis') }}</button>

          <el-popover
              popper-class="dataV-popover"
              placement="bottom-start"
              width="400"
              trigger="click"
              v-if="!isDemo"
              v-model="departmentVisible"
              @show="isDatavSelectTree = true"
              @hide="closeDepartmentVisible">
            <div class="body">
              <div class="close" @click="closeDepartmentVisible"></div>
              <h5>{{ $t('dataV.depChange') }}</h5>
                <el-cascader
                    :options="departmentOptions"
                    ref="cascade"
                    :props="{
                                value: 'id',
                                label: 'name',
                                children: 'subDivisions',
                                multiple: true,
                                checkStrictly: false
                                }"
                    collapse-tags
                    popper-class="dataV-select"
                    @visible-change="handleBlur($event)"
                    @change="changeDepartment"
                    @remove-tag="removeTag"
                    clearable></el-cascader>
<!--              <datavSelectTree v-if="isDatavSelectTree" @getDepartmentId="getDepartmentId" />-->
              <div class="btn">
                <el-button @click="closeDepartmentVisible">{{ $t('common.cancel') }}</el-button>
                <el-button @click="departmentSubmit">{{ $t('common.confirm') }}</el-button>
              </div>
            </div>
            <button slot="reference">{{ $t('dataV.depChange') }}</button>
          </el-popover>

          <el-popover
              v-if="!isDemo"
              popper-class="dataV-popover room-popover"
              placement="bottom-start"
              width="610"
              trigger="click"
              v-model="roomVisible"
              @show="handleShowSetting">
            <div class="body">
              <div class="close" @click="closeRoomVisible"></div>
              <h5>{{ $t('labDevice.roomScreen') }}</h5>
              <floor-select-tree :popperClass="'dataV-select'" :data="rooms" :id.sync="roomId" :select-tree-value.sync="roomId" @change="handleQuery"/>
              <div class="setting-checkbox" v-loading="roomSelectLoading" element-loading-text="loading..." element-loading-background="rgb(30 42 70 / 60%)">
                <el-row>
                  <el-checkbox :indeterminate="isIndeterminate" v-model="roomChecked" v-if="this.floors.length > 0" @change="handleCheckAllChange">
                      {{ $t('common.all') }}
                  </el-checkbox>
                </el-row>
                <el-checkbox-group v-model="checkList" @change="handleCheckedCitiesChange">
                  <el-row>
                    <el-col v-for="(item, index) in floors" :key="index" :span="8">
                      <el-checkbox :label="item.id">{{ item.name }}</el-checkbox>
                    </el-col>
                  </el-row>
                </el-checkbox-group>
              </div>
              <div class="btn">
                <el-button @click="closeRoomVisible">{{ $t('common.cancel') }}</el-button>
                <el-button @click="handleCheckBoxList">{{ $t('common.confirm') }}</el-button>
              </div>
            </div>
            <button slot="reference">{{ $t('labDevice.roomScreen') }}</button>
          </el-popover>

            <el-popover
                popper-class="dataV-popover"
                placement="bottom-start"
                width="400"
                trigger="click"
                v-if="!isDemo"
                v-model="deviceVisible"
                @show="handleShowDeviceSelect">
                <div class="body">
                    <div class="close" @click="closeDeviceVisible"></div>
                    <h5>{{ $t('common.relatedHardware') }}</h5>
                    <div v-loading="deviceSelectLoading"
                         element-loading-text="loading..." element-loading-background="rgb(30 42 70 / 60%)">
                        <el-select
                            v-model="objTypes"
                            filterable
                            popper-class="dataV-select"
                            clearable
                            collapse-tags
                            multiple>
                            <el-option
                                v-for="item in equipmentTypeOptions"
                                :key="item.code"
                                :label="item.name"
                                :value="item.code">
                            </el-option>
                        </el-select>
                    </div>
                    <div class="btn">
                        <el-button @click="closeDeviceVisible">{{ $t('common.cancel') }}</el-button>
                        <el-button @click="handleEquipmentTypeSubmit">{{ $t('common.confirm') }}</el-button>
                    </div>
                </div>
                <button slot="reference">{{ $t('common.relatedHardware') }}</button>
            </el-popover>
        </div>

        <h3>
          <span @click="handleStatistic">{{ $t('dataV.roomDataV1') }}</span>
        </h3>

        <div class="right">
          <div class="voice" @click="handleVoice">
            <el-button type="text" :icon="isVoice ? 'icon-laba001hover' : 'icon-guanbiyuyin'">
              {{ isVoice ? $t('dataV.isVoice') : $t('dataV.isNotVoice') }}
            </el-button>
          </div>
          <div class="date margin-small-right">
            {{ date }}
          </div>
            <button class="right-button" @click="scroll">{{ isScroll ? $t('dataV.isNotScroll') : $t('dataV.isScroll')}}</button>

            <div class="back" @click="handleBack">
            <img src="../../assets/dataV/icon-back.png"> {{ $t('common.back') }}</div>
          </div>
        </div>
      <div class="message-container" v-show="showAnalysis">
        <div class="message bg-one">
          <h4>{{ $t('common.basicInformation') }}</h4>
          <div class="message-top">
            <dl>
              <dt>{{ $t('common.name') }}：</dt>
              <dd>{{ floorMessage.roomName }}</dd>
            </dl>
            <dl>
              <dt>{{ $t('common.companyName') }}：</dt>
              <dd>{{ floorMessage.companyName }}</dd>
            </dl>
            <dl>
              <dt>{{ $t('room.owningFloor') }}：</dt>
              <dd>{{ floorMessage.floorName }}</dd>
            </dl>
            <dl>
              <dt>{{ $t('dataV.buildingName') }}：</dt>
              <dd>{{ floorMessage.buildingName }}</dd>
            </dl>
            <dl>
              <dt>{{ $t('dataV.gardenName') }}：</dt>
              <dd>{{ floorMessage.gardenName }}</dd>
            </dl>
          </div>
        </div>
        <div class="statistic-analysis bg-one">
          <h4>{{ $t('dataV.roomStat1') }}</h4>
          <div class="items">
            <span class="not-monitored">{{ $t('labDevice.noMonitor') }}：{{ total - (normal + alarmTotal + offlineCount) }}</span>
            <span @click="handleStatistic">{{ $t('labDevice.monitor') }}：{{ normal + alarmTotal + offlineCount }}</span>
            <span>{{ $t('room.roomSum') }}：{{ total }}</span>
          </div>
          <div class="state">
            <div class="state-item normal" @click="handleStatistic('status', 1)">
              <p>{{ $t('dataV.normalRoom') }}</p>
              <div class="num">
                <h3>{{ normal }} <span>{{ $t('common.individual') }}</span></h3>
              </div>
              <div class="img">
                <i class="icon-normal1"></i>
              </div>
            </div>
            <div class="state-item abnormal"  @click="handleStatistic('status', 2)">
              <p>{{ $t('dataV.alarmRoom') }}</p>
              <div class="num">
                <h3>{{ alarmTotal }} <span>{{ $t('common.individual') }}</span></h3>
              </div>
              <div class="img">
                <i class="icon-alarm1"></i>
              </div>
            </div>
            <div class="state-item offline" @click="handleStatistic('status', -100)">
              <p>{{ $t('dataV.offLineRoom') }}</p>
              <div class="num">
                <h3>{{ offlineCount }} <span>{{ $t('common.individual') }}</span></h3>
              </div>
              <div class="img">
                <i class="icon-offline"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="abnormal-analysis bg-two">
          <h4>{{ $t('dataV.alarmStatRank') }}</h4>
          <AlarmThingStatistics :type="11" />
        </div>

        <div class="room-alarm-analysis bg-three">
          <h4>{{ $t('dataV.roomAlarm') }}</h4>
          <div class="state">
            <div class="no-data" v-if="!alarmCount">
              <img src="../../assets/dataV/no-data.png">
            </div>
            <div
                v-for="(item, index) in alarmCount"
                :key="index"
                class="list"
                @click="handleStatistic('type', item.type)">
              <div class="text">{{ item.name }}{{ $t('common.abnormal') }}</div>
              <div class="number abnormal">{{ item.count }} <span>{{ $t('common.individual') }}</span></div>
            </div>
          </div>
        </div>
      </div>

      <div class="status-container">
        <dv-loading v-if="isStatusLoading">Loading...</dv-loading>
        <div v-else>
          <div v-if="array.length" class="block-container" ref="blocContainer">
            <div v-for="item in array" :key="item.id" class="status-card" :class="{ 'abnormalBg' : item.senorStatus === 2, 'offLineBg' : item.senorStatus === -100 }">
              <h5>{{ item.name }}</h5>
              <div class="sensors">
                <div class="item" v-for="sensors in item.data" :key="sensors.id" :class="{ 'textCenter': deviceId[sensors.monitorSensorCatId]}">
                  <div :class="sensors.activateFlag === 1 ? 'abnormal' : 'normal'" class="value">
                    <span v-if="dataZoom[sensors.monitorSensorCatId]">
                      <div v-if="sensors.signalSwitchStatus === 1">{{ $t('common.close') }}</div>
                      <div v-else>{{ sensors.activateFlag === 1 ? dataZoom[sensors.monitorSensorCatId][1] : dataZoom[sensors.monitorSensorCatId][2] }}</div>
                    </span>
                    <span v-else>
                      <div v-if="sensors.signalSwitchStatus === 1">{{ $t('common.close') }}</div>
                      <div v-else>
                        <span>{{ sensors.monitorSensorVal }}</span>
                        <span>{{ sensors.unit }}</span>
                      </div>
                    </span>
                  </div>
                  <div class="alarm-scope">
                    {{ sensors.sensorAlias }}
                    <span v-if="!deviceId[sensors.monitorSensorCatId] && sensors.normalMax">
                      （{{ sensors.normalMin + " ~ " + sensors.normalMax }}）
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty">{{ $t('common.notMessage1') }}</div>
        </div>
      </div>
    </div>
  </dv-full-screen-container>
</template>

<script>
import "@/plugins/dataV";
import AlarmThingStatistics from './components/AlarmThingStatistics'
import ScaleBox from "@/components/ScaleBox"
import {getMapFloorRoomList, getMapFloorRoomListV1, putShowRoomBatch} from "@/api/dataV";
import datavSelectTree from "./components/datavSelectTree"
import FloorSelectTree from "@c/FloorSelectTree";
import {getMapGardenList} from "@/api/mapSet";
import {DEVICE_ID, DATAZOOM} from "@/utils/constant";
import moment from "moment";
import {getEquipmentBindEquipmentType} from "@/api/labDevice";

export default {
  name: "FloorDataV",
  data() {
    return {
      isDemo: process.env.VUE_APP_DEMO === 'true',
      isContainer: true,
      // 部门
      departmentVisible: false,
      isDatavSelectTree: false,
      setDepartmentId: "",
      departmentId: null,
      // 房间
      roomVisible: false,
      isIndeterminate: true,
      roomChecked: false,
      roomSelectLoading: false,
      // 硬件类型
      deviceId: DEVICE_ID,
      dataZoom: DATAZOOM,

      isAdaptationScreen: false,
      sensorType: 0,
      app: "",
      isLoading: false,
      date: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
      dateSet: null,
      showAnalysis: true,
      allArray: [],
      array: [],
      total: null,
      alarmTotal: 0,
      offlineCount: 0,
      checkList: [],
      normal: 0,
      isStatusLoading: false,
      isSetting: false,
      floorMessage: {},
      roomId: "0",
      isRoomId: null,
      type: null,
      typeData: null,
      floors: [],
      rooms: [],
      alarmCount: [],
      timeSet: null,
      // 自动滚动
      isScroll: false,
      scrollSet: null,
      // 语音播放
      isVoice: true,
      synth: null,
      voiceMsg: null,
      synthSet: null,
      speakNum: 0,
        departments: [],
        departmentOptions: [],
        deviceVisible: false,
        objTypes: [],
        equipmentTypeOptions: [],
        deviceSelectLoading: false,
    }
  },
  components: {
    AlarmThingStatistics,
    datavSelectTree,
    FloorSelectTree,
    ScaleBox,
  },
    created() {
        this.departmentOptions = this.getTreeData(this.$store.state.departments);
    },
  mounted() {
    this.app = document.getElementById("app");
    this.app.style.background = "#040c1f";
    this.app.style.overflow = "hidden";
    //用户分辨率100%为false，其他为true
    if(screen.width < 1550){
      this.isAdaptationScreen = true
    };
    this.isLoading = true;
    const floorId = this.$route.query.floorId;
    this.roomId = floorId;
    this.handleSynth();
    this.handleInit();
    this.handleGetEquipmentTypeList();
  },
  methods: {
      handleGetEquipmentTypeList() {
          getEquipmentBindEquipmentType({objType: 3}).then((res) => {
              if (res.code && res.items.length) {
                  this.equipmentTypeOptions = res.items
              }
          })
      },
      closeDeviceVisible() {
          this.deviceVisible = false;
          this.objTypes = [];
      },
      handleShowDeviceSelect() {
          this.deviceVisible = true;
      },
      removeTag(e) {
          const val = e[e.length - 1];
          this.departments.splice(this.departments.indexOf(val), 1);
      },
      changeDepartment(e) {
          // 判断是否为数组，且长度为0
          if (e.length === 0) {
              this.departments = [];
          }
      },
      handleBlur() {
          const node = this.$refs.cascade.getCheckedNodes();
          const array = [];
          node.map((item) => {
              if (item?.parent?.indeterminate) {
                  array.push(item.parent.value);
              }
              array.push(item.value);
          })
          this.departments = array;
      },
      getTreeData(departments) {
          for (let i = 0; i < departments.length; i++) {
              const item = departments[i];
              if (item['subDivisions'] && item.subDivisions.length < 1) {
                  item.subDivisions = undefined;
              } else {
                  item['subDivisions'] && this.getTreeData(item.subDivisions);
              }
          }
          return departments;
      },
    // 返回
    handleBack() {
      this.isContainer = false;
      this.$router.back();
      clearInterval(this.timeSet);
      clearInterval(this.synthSet);
      this.speakNum = 0
    },
    // 初始化
    handleInit() {
      this.isStatusLoading = true;
      this.handleFloorScreeList();
      this.timeSet = setInterval(() => {
        this.handleFloorScreeList();
      }, 15000);
      this.dateSet = setInterval(() => {
        this.date = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
      },1000)
    },
    // 初始化请求
    handleFloorScreeList() {
      var data = {};
      if(!this.isRoomId){
        if(this.$route.query.floorId){
          data = {
            floorId: this.$route.query.floorId
          }
        }
      }else{
        data = {
          floorId: this.isRoomId
        }
      }
      if(this.typeData){
        data[Object.keys(this.typeData)] = this.typeData[Object.keys(this.typeData)]
      };
      if(this.departments.length > 0){
        data['departmentIds'] = this.departments
      }
        if (this.objTypes.length > 0) {
            data["objTypes"] = this.objTypes;
        }
      this.allArray = [];
      getMapFloorRoomListV1(data).then(res => {
        if (res.code) {
          this.array = [];
          if(res.items.roomList){
            this.array = res.items.roomList
          }
          if(res.items.roomData){
            this.allArray = res.items.roomData;
          }
          let floor = res.items.floorDetail;
          this.floorMessage = {
            roomName: this.isDemo ? [floor.buildingName, floor.floorName].filter(Boolean).join(' · ') : floor.roomName,
            buildingName: floor.buildingName && floor.buildingName,
            companyName: floor["companyName"] && floor.companyName,
            departmentName: floor["departmentName"] && floor.departmentName,
            floorName: floor["floorName"] && floor.floorName,
            gardenName: floor["gardenName"] && floor.gardenName,
            userName: floor["userName"] && floor.userName
          };
          var alarmCounts = res.items.alarmCount;
          this.alarmCount = alarmCounts;
          if(res.items.roomCount){
            const {alarmCount, normalCount, offlineCount, status, total} = res.items.roomCount;
            this.total = total;
            this.normal = normalCount;
            this.alarmTotal = alarmCount;
            this.offlineCount = offlineCount;

            if(this.alarmTotal > 0 && this.offlineCount > 0){
              if(this.speakNum === 0){
                this.handleSpeak(this.$t('dataV.voiceMsg1') + this.alarmTotal + this.$t('dataV.voiceMsg2') + this.$t('dataV.voiceMsg1') + this.offlineCount + this.$t('dataV.voiceMsg3'));
                this.handleSpeak(this.$t('dataV.voiceMsg1') + this.alarmTotal + this.$t('dataV.voiceMsg2') + this.$t('dataV.voiceMsg1') + this.offlineCount + this.$t('dataV.voiceMsg3'));
                this.handleSpeak(this.$t('dataV.voiceMsg1') + this.alarmTotal + this.$t('dataV.voiceMsg2') + this.$t('dataV.voiceMsg1') + this.offlineCount + this.$t('dataV.voiceMsg3'));
                this.handleSpeak(this.$t('dataV.voiceMsg1') + this.alarmTotal + this.$t('dataV.voiceMsg2') + this.$t('dataV.voiceMsg1') + this.offlineCount + this.$t('dataV.voiceMsg3'));
                this.handleSpeak(this.$t('dataV.voiceMsg1') + this.alarmTotal + this.$t('dataV.voiceMsg2') + this.$t('dataV.voiceMsg1') + this.offlineCount + this.$t('dataV.voiceMsg3'));
              }
              this.speakNum++
            }else{
              if(this.alarmTotal > 0){
                if(this.speakNum === 0){
                  this.handleSpeak(this.$t('dataV.voiceMsg1') + this.alarmTotal + this.$t('dataV.voiceMsg2'));
                  this.handleSpeak(this.$t('dataV.voiceMsg1') + this.alarmTotal + this.$t('dataV.voiceMsg2'));
                  this.handleSpeak(this.$t('dataV.voiceMsg1') + this.alarmTotal + this.$t('dataV.voiceMsg2'));
                  this.handleSpeak(this.$t('dataV.voiceMsg1') + this.alarmTotal + this.$t('dataV.voiceMsg2'));
                  this.handleSpeak(this.$t('dataV.voiceMsg1') + this.alarmTotal + this.$t('dataV.voiceMsg2'));
                }
                this.speakNum++
              }
              if(this.offlineCount > 0){
                if(this.speakNum === 0){
                  this.handleSpeak(this.$t('dataV.voiceMsg1') + this.offlineCount + this.$t('dataV.voiceMsg3'));
                  this.handleSpeak(this.$t('dataV.voiceMsg1') + this.offlineCount + this.$t('dataV.voiceMsg3'));
                  this.handleSpeak(this.$t('dataV.voiceMsg1') + this.offlineCount + this.$t('dataV.voiceMsg3'));
                  this.handleSpeak(this.$t('dataV.voiceMsg1') + this.offlineCount + this.$t('dataV.voiceMsg3'));
                  this.handleSpeak(this.$t('dataV.voiceMsg1') + this.offlineCount + this.$t('dataV.voiceMsg3'));
                }
                this.speakNum++
              }
            }
          }
        } else {
          this.$message.error(res.message);
          clearInterval(this.timeSet);
        }
        this.isStatusLoading = this.isLoading = false;
      })
    },
    // 语音播放
    handleSynth() {
      this.synth = window.speechSynthesis;
      this.voiceMsg = new SpeechSynthesisUtterance();
      var _this = this;
      this.synthSet = setInterval(() => {
        if(_this.alarmTotal > 0 && _this.offlineCount > 0){
          _this.handleSpeak(_this.$t('dataV.voiceMsg1') + _this.alarmTotal + _this.$t('dataV.voiceMsg2') + _this.$t('dataV.voiceMsg1') + 6 + _this.$t('dataV.voiceMsg3'));
          _this.handleSpeak(_this.$t('dataV.voiceMsg1') + _this.alarmTotal + _this.$t('dataV.voiceMsg2') + _this.$t('dataV.voiceMsg1') + 6 + _this.$t('dataV.voiceMsg3'));
          _this.handleSpeak(_this.$t('dataV.voiceMsg1') + _this.alarmTotal + _this.$t('dataV.voiceMsg2') + _this.$t('dataV.voiceMsg1') + 6 + _this.$t('dataV.voiceMsg3'));
          _this.handleSpeak(_this.$t('dataV.voiceMsg1') + _this.alarmTotal + _this.$t('dataV.voiceMsg2') + _this.$t('dataV.voiceMsg1') + 6 + _this.$t('dataV.voiceMsg3'));
          _this.handleSpeak(_this.$t('dataV.voiceMsg1') + _this.alarmTotal + _this.$t('dataV.voiceMsg2') + _this.$t('dataV.voiceMsg1') + 6 + _this.$t('dataV.voiceMsg3'));
        }else{
          if(_this.alarmTotal > 0){
            _this.handleSpeak(_this.$t('dataV.voiceMsg1') + _this.alarmTotal + _this.$t('dataV.voiceMsg2'));
            _this.handleSpeak(_this.$t('dataV.voiceMsg1') + _this.alarmTotal + _this.$t('dataV.voiceMsg2'));
            _this.handleSpeak(_this.$t('dataV.voiceMsg1') + _this.alarmTotal + _this.$t('dataV.voiceMsg2'));
            _this.handleSpeak(_this.$t('dataV.voiceMsg1') + _this.alarmTotal + _this.$t('dataV.voiceMsg2'));
            _this.handleSpeak(_this.$t('dataV.voiceMsg1') + _this.alarmTotal + _this.$t('dataV.voiceMsg2'));
          }
          if(_this.offlineCount > 0){
            _this.handleSpeak(_this.$t('dataV.voiceMsg1') + _this.offlineCount + _this.$t('dataV.voiceMsg3'));
            _this.handleSpeak(_this.$t('dataV.voiceMsg1') + _this.offlineCount + _this.$t('dataV.voiceMsg3'));
            _this.handleSpeak(_this.$t('dataV.voiceMsg1') + _this.offlineCount + _this.$t('dataV.voiceMsg3'));
            _this.handleSpeak(_this.$t('dataV.voiceMsg1') + _this.offlineCount + _this.$t('dataV.voiceMsg3'));
            _this.handleSpeak(_this.$t('dataV.voiceMsg1') + _this.offlineCount + _this.$t('dataV.voiceMsg3'));
          }
        }
      },6000)
    },
    // 语音播报的函数
    handleSpeak(text) {
      const lang = localStorage.getItem("lang")
      this.voiceMsg.text = text;     // 语音内容
      this.voiceMsg.lang = lang;  // 使用的语言:中文
      this.voiceMsg.volume = 1;      // 声音音量
      this.voiceMsg.rate = lang === 'en' ? 0.8 : 1;        // 语速
      this.voiceMsg.pitch = lang === 'en' ? 1 : 2;       // 音高
      this.synth.speak(this.voiceMsg);    // 播放
    },
    // 开启/关闭语音播报
    handleVoice() {
      this.isVoice =! this.isVoice;
      if(this.isVoice){
        this.handleSynth()
      }else{
        clearTimeout(this.synthSet);
          const lang = localStorage.getItem("lang")
          this.synthSet = null;
        this.voiceMsg.text = "";
        this.voiceMsg.lang = lang;
        this.synth.cancel(this.voiceMsg);
      }
    },
    // 统计分析和报警分析点击事件
    handleStatistic(key, index){
      if (this.isDemo && this.typeData && key && this.typeData[key] === index) {
        key = undefined;
      }
      if(key && index !== undefined){
        var data = {}
        data[key] = index;
        this.typeData = data;
      }else{
        this.typeData = undefined
      }
      this.clearTimer();
      this.handleInit()
    },
    // 关闭部门筛选
    closeDepartmentVisible() {
      this.departmentVisible = false;
      this.isDatavSelectTree = false;
    },
    // 赋值部门选中的ID
    getDepartmentId (id){
      this.setDepartmentId = id
    },
    // 部门筛选-确认
    departmentSubmit () {
      this.isScroll = false;
      clearInterval(this.scrollSet);
      this.scrollSet = null;
      if(this.array.length > 0){
        this.$refs.blocContainer.scrollTop = 0;
      }
      this.clearTimer();
      this.departmentVisible = false;
      this.departmentId = this.setDepartmentId;
      this.handleInit()
    },
      handleEquipmentTypeSubmit() {
          this.deviceVisible = false;
          clearInterval(this.scrollSet);
          this.scrollSet = null;
          this.clearTimer();
          this.handleInit();
      },
    // 点击房间筛选
    handleShowSetting() {
      if (!this.$store.state.level) {
        this.roomId = "";
        return false;
      };
      if(this.isRoomId){
        this.roomId = this.isRoomId
      };
      this.rooms = [];
      this.checkList = [];
      this.floors = [];
      this.allArray.map(item => {
        if (item.screenShowFlag) {
          this.checkList.push(item.id);
        }
      })

      var floors = [];
      floors = JSON.parse(JSON.stringify(this.allArray));
      floors.map((item,index) => {
        if(item.screenShowFlag == 1){
          floors.unshift(floors.splice(index, 1)[0]);
        }
      })
      this.floors = floors;
      this.roomChecked = this.checkList.length === this.floors.length;
      this.isIndeterminate = this.checkList.length > 0 && this.checkList.length < this.floors.length;

      this.isSetting = !this.isSetting;
      getMapGardenList().then(res => {
        if (res.code) {
          for (const item of res.items) {
            let grandpa = {
              key: item.gardenId,
              id: item.gardenId,
              name: item.gardenName,
              subDivisions: [],
            };
            for (const element of item.subDivisions) {
              let father = {
                key: element.id,
                id: element.id,
                name: element.name,
                subDivisions: [],
              };
              grandpa.subDivisions.push(father);
              for (const sun of element.subDivisions) {
                let grandson = {
                  key: sun.id,
                  id: sun.id,
                  name: sun.name,
                };
                father.subDivisions.push(grandson);
              }
            }
            this.rooms.push(grandpa);
          }
        } else {
          this.$message.error(res.message);
        }
      })
    },
    // 房间全部打勾
    handleCheckAllChange(item) {
      if (!item) {
        this.checkList = [];
      } else {
        this.floors.map(item => {
          this.checkList.push(item.id);
        })
      }
      this.isIndeterminate = false
    },
    handleCheckedCitiesChange(value) {
      let checkedCount = value.length;
      this.roomChecked = checkedCount === this.floors.length;
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.floors.length;
    },
    // 房间筛选确认
    handleCheckBoxList() {
      if (this.isDemo) return this.$message.info('演示为只读，暂不支持保存展示房间');
      this.isScroll = false;
      clearInterval(this.scrollSet);
      this.scrollSet = null;
      if(this.array.length > 0){
        this.$refs.blocContainer.scrollTop = 0;
      }

      if (!this.checkList.length) {
        return this.$message.error(this.$t('dataV.atLeastRoom'));
      }

      this.isRoomId = this.roomId;

      this.roomVisible = false;
      this.isStatusLoading = true;
      putShowRoomBatch({
        isShow: 1,
        roomIds: this.checkList
      }).then(res => {
        if (res.code) {
          this.checkList = [];
          this.rooms = [];
          this.$message.success(this.$t('common.operateSuccess'));
          this.clearTimer();
          this.handleInit();
        } else {
          this.$message.error(res.message);
        }
      })
    },
    // 房间筛选-园区列表选择
    handleQuery() {
      this.floors = [];
      this.checkList = [];
      this.roomSelectLoading = true;
      getMapFloorRoomListV1({floorId: this.roomId}).then(res => {
        this.roomSelectLoading = false;
        if (res.code) {
          let roomData = res.items.roomData;
          var roomFlagLength = 0;
          if(res.items.roomData){
            roomData.map(item => {
              let obj = {name: item.name, id: item.id, screenShowFlag: item.screenShowFlag};
              this.floors.push(obj);
              if(item.screenShowFlag == 1){
                this.checkList.push(item.id)
              }
            })
            if(this.checkList.length > 0){
              for(var i = 0; i < roomData.length; i++){
                if(roomData[i].screenShowFlag){
                  roomFlagLength++
                }
              }
              this.roomChecked = roomFlagLength === this.floors.length;
              this.isIndeterminate = roomFlagLength > 0 && roomFlagLength < this.floors.length
            }else{
              this.roomChecked = false;
              this.isIndeterminate = false
            }
          }
        } else {
          this.$message.error(res.message);
        }
      })
    },
    // 关闭房间筛选
    closeRoomVisible() {
      this.roomVisible = false;
      this.rooms = []
    },
    // 清除定时器
    clearTimer() {
      clearInterval(this.timeSet);
      this.timeSet = null;
    },
    // 自动滚动
    scroll() {
      if(this.array.length > 0){
        this.isScroll =! this.isScroll
        if(this.isScroll){
          this.$nextTick(() => {
            const divData = this.$refs.blocContainer
            this.scrollSet = setInterval(() => {
              divData.scrollTop += 1
              if (divData.clientHeight + divData.scrollTop + 1 > divData.scrollHeight) {
                divData.scrollTop = 0
              }
            }, 30)
          })
        }else{
          clearInterval(this.scrollSet);
          this.scrollSet = null
        }
      }
    },
  },
  beforeDestroy() {
    setTimeout(function(){
      app.style.overflow = "";
      app.style.background = "";
    },500)
    clearInterval(this.timeSet);
    clearInterval(this.scrollSet);
    clearInterval(this.dateSet);
    this.speakNum = 0;

    // 停止播报
    clearInterval(this.synthSet);
    this.voiceMsg.text = "";
    this.voiceMsg.lang = "zh-CN";
    this.synth.cancel(this.voiceMsg);
  }
}
</script>

<style lang="less">
@import "./dataVpopover.less";
</style>
<style lang="less" scoped>
@import "./index.less";
</style>
