<template>
    <dv-full-screen-container v-if="isContainer" :class="{ 'adaptationScreen': isAdaptationScreen }">
        <dv-loading v-if="isLoading">Loading...</dv-loading>
        <div v-else class="dv-full">
            <div class="floor-title">
                <div class="left">
                    <button @click="showAnalysis =! showAnalysis">
                        {{ showAnalysis ? $t('dataV.CloseAnalysis') : $t('dataV.showAnalysis') }}
                    </button>

                    <el-popover
                        popper-class="dataV-popover"
                        placement="bottom-start"
                        width="400"
                        trigger="click"
                        v-if="!isDemo"
                        v-model="departmentVisible"
                        @show="isDatavSelectTree = true">
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
<!--                            <datavSelectTree v-if="isDatavSelectTree" @getDepartmentId="getDepartmentId"/>-->
                            <div class="btn">
                                <el-button @click="closeDepartmentVisible">{{ $t('common.cancel') }}</el-button>
                                <el-button @click="departmentSubmit">{{ $t('common.confirm') }}</el-button>
                            </div>
                        </div>
                        <button slot="reference">{{ $t('dataV.depChange') }}</button>
                    </el-popover>

                    <el-popover
                        popper-class="dataV-popover room-popover"
                        placement="bottom-start"
                        width="610"
                        trigger="click"
                        :disabled="isDemo"
                        v-model="roomVisible"
                        @show="handleShowRoomSelect">
                        <div class="body">
                            <div class="close" @click="closeRoomVisible"></div>
                            <h5>{{ $t('labDevice.roomScreen') }}</h5>
                            <floor-select-tree :popperClass="'dataV-select'" :data="rooms" :id.sync="roomId"
                                               :select-tree-value.sync="selectTreeValue" @change="handleQuery(1)"/>
                            <div class="setting-checkbox" v-loading="roomSelectLoading"
                                 element-loading-text="loading..." element-loading-background="rgb(30 42 70 / 60%)">
                                <el-row>
                                    <el-checkbox v-if="this.checkRooms.length > 0" :indeterminate="isIndeterminate"
                                                 v-model="roomChecked" @change="handleCheckAllChange">
                                        {{ $t('common.all') }}
                                    </el-checkbox>
                                </el-row>
                                <el-checkbox-group v-model="checkList" @change="handleCheckedCitiesChange">
                                    <el-row>
                                        <el-col v-for="(item, index) in checkRooms" :key="index" :span="8">
                                            <el-checkbox :key="item.id" :label="item.id">{{ item.name }}</el-checkbox>
                                        </el-col>
                                    </el-row>
                                </el-checkbox-group>
                            </div>
                            <div class="btn">
                                <el-button @click="closeRoomVisible">{{ $t('common.cancel') }}</el-button>
                                <el-button @click="handleCheckBoxList">{{ $t('common.confirm') }}</el-button>
                            </div>
                        </div>
                        <button slot="reference" :disabled="isDemo" :title="isDemo ? '演示房间筛选弹层尚未接入' : ''">{{ $t('labDevice.roomScreen') }}</button>
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
                    <span @click="handleType">{{ $t('dataV.labDeviceDataV1') }}</span>
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
                    <button class="right-button" @click="scroll">{{ isScroll ? $t('dataV.isNotScroll') : $t('dataV.isScroll') }}</button>
                    <div class="back" @click="handleBack">
                        <img src="../../assets/dataV/icon-back.png"> {{ $t('common.back') }}
                    </div>
                </div>

            </div>
            <div class="message-container" v-show="showAnalysis">
                <div class="message bg-one">
                    <h4>{{ $t('common.basicInformation') }}</h4>
                    <div class="message-top">
                        <dl>
                            <dt>{{ $t('common.name') }}：</dt>
                            <dd>{{ roomDetail ? roomDetail.roomName : "" }}</dd>
                        </dl>
                        <dl>
                            <dt>{{ $t('common.companyName') }}：</dt>
                            <dd>{{ roomDetail ? roomDetail.companyName : "" }}</dd>
                        </dl>
                        <dl>
                            <dt>{{ $t('room.owningFloor') }}：</dt>
                            <dd>{{ roomDetail ? roomDetail.floorName : "" }}</dd>
                        </dl>
                        <dl>
                            <dt>{{ $t('dataV.buildingName') }}：</dt>
                            <dd>{{ roomDetail ? roomDetail.buildingName : "" }}</dd>
                        </dl>
                        <dl>
                            <dt>{{ $t('dataV.gardenName') }}：</dt>
                            <dd>{{ roomDetail ? roomDetail.gardenName : "" }}</dd>
                        </dl>
                    </div>
                </div>

                <div class="statistic-analysis bg-one">
                    <h4>{{ $t('dataV.labDeviceStat1') }}</h4>
                    <div class="items">
                        <span class="not-monitored">{{
                                $t('labDevice.noMonitor')
                            }}：{{ instrumentCount.notMonitorCount ? instrumentCount.notMonitorCount : 0 }}</span>
                        <span @click="handleType">{{
                                $t('labDevice.monitor')
                            }}：{{ instrumentCount.monitorTotal ? instrumentCount.monitorTotal : 0 }}</span>
                        <span @click="handleType">{{
                                $t('labDevice.labDeviceSum')
                            }}：{{ instrumentCount.total ? instrumentCount.total : 0 }}</span>
                    </div>
                    <div class="state">
                        <div class="state-item normal" :class="{'screen-filter-active': typeData && typeData.status === 1}" @click="handleType('type', 1)">
                            <p>{{ $t('dataV.normalDevice') }}</p>
                            <div class="num">
                                <h3>{{ instrumentCount.normalCount ? instrumentCount.normalCount : 0 }}
                                    <span>{{ $t('common.individual') }}</span></h3>
                            </div>
                            <div class="img">
                                <i class="icon-normal1"></i>
                                <!--                <img src="../../assets/dataV/icon-normal.png" >-->
                            </div>
                        </div>
                        <div class="state-item abnormal" :class="{'screen-filter-active': typeData && typeData.status === 2}" @click="handleType('type', 2)">
                            <p>{{ $t('dataV.alarmDevice') }}</p>
                            <div class="num">
                                <h3>{{ instrumentCount.alarmCount ? instrumentCount.alarmCount : 0 }}
                                    <span>{{ $t('common.individual') }}</span></h3>
                            </div>
                            <div class="img">
                                <i class="icon-alarm1"></i>
                            </div>
                        </div>
                        <div class="state-item offline" :class="{'screen-filter-active': typeData && typeData.status === -100}" @click="handleType('type', -100)">
                            <p>{{ $t('dataV.offLineDevice') }}</p>
                            <div class="num">
                                <h3>{{ instrumentCount.offlineCount ? instrumentCount.offlineCount : 0 }}
                                    <span>{{ $t('common.individual') }}</span></h3>
                            </div>
                            <div class="img">
                                <i class="icon-offline"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="abnormal-analysis bg-two">
                    <h4>{{ $t('dataV.alarmStatRank') }}</h4>
                    <AlarmThingStatistics :type="4"/>
                </div>

                <div class="alarm-analysis bg-three">
                    <h4>{{ $t('dataV.labDeviceStatus') }}</h4>
                    <div class="state">
                        <div class="room-total run" @click="handleType('runStatus',1)">
                            <div class="text">{{ $t('labDevice.runing') }}</div>
                            <div class="number normal">
                                {{ instrumentCount.runCount ? instrumentCount.runCount : 0 }}
                                <span>{{ $t('common.individual') }}</span>
                            </div>
                        </div>
                        <div class="room-total standby" @click="handleType('runStatus',2)">
                            <div class="text">{{ $t('labDevice.standbyPower') }}</div>
                            <div class="number abnormal">
                                {{ instrumentCount.standbyCount ? instrumentCount.standbyCount : 0 }}
                                <span>{{ $t('common.individual') }}</span>
                            </div>
                        </div>
                        <div class="room-total shutdown" @click="handleType('runStatus',0)">
                            <div class="text">{{ $t('labDevice.standbyOff') }}</div>
                            <div class="number offline">
                                {{ instrumentCount.shutdownCount ? instrumentCount.shutdownCount : 0 }}
                                <span>{{ $t('common.individual') }}</span>
                            </div>
                        </div>
                        <div class="room-total" @click="handleType('runStatus',3)">
                            <div class="text">{{ $t('labDevice.maintained') }}</div>
                            <div class="number">
                                {{ instrumentCount.maintainCount ? instrumentCount.maintainCount : 0 }}
                                <span>{{ $t('common.individual') }}</span>
                            </div>
                        </div>
                        <div class="room-total notMonitor">
                            <div class="text">{{ $t('labDevice.noMonitor') }}</div>
                            <div class="number">
                                {{ instrumentCount.notMonitorCount ? instrumentCount.notMonitorCount : 0 }}
                                <span>{{ $t('common.individual') }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="status-container">
                <dv-loading v-if="isStatusLoading">Loading...</dv-loading>
                <div v-else>
                    <div v-if="array.length" class="block-container" ref="blocContainer">
                        <div v-for="item in array" :key="item.id" class="status-card"
                             :class="{ 'abnormalBg' : item.senorStatus === 2, 'offLineBg' : item.senorStatus === -100 }">
                            <h5>{{ item.name }}</h5>
                            <div class="sensors">
                                <div class="item" v-for="sensors in item.data" :key="sensors.id"
                                     :class="{ 'textCenter': deviceId[sensors.monitorSensorCatId]}">
                                    <div :class="sensors.activateFlag === 1 ? 'abnormal' : 'normal'" class="value">
                                        <span v-if="dataZoom[sensors.monitorSensorCatId]">
                                          <div v-if="sensors.signalSwitchStatus === 1">{{ $t('common.close') }}</div>
                                          <div v-else>
                                            {{
                                                  sensors.activateFlag === 1 ? dataZoom[sensors.monitorSensorCatId][1] : dataZoom[sensors.monitorSensorCatId][2]
                                              }}
                                          </div>
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
import {getMapFloorRoomList, getMapFloorRoomListV1, getMapRoomScreen, getMapRoomScreenV1} from "@/api/dataV";
import datavSelectTree from "./components/datavSelectTree"
import {getRoomDetail, getRoomSelectList} from "@/api/room";
import FloorSelectTree from "@c/FloorSelectTree";
import {getMapGardenList} from "@/api/mapSet";
import {DEVICE_ID, DATAZOOM} from "@/utils/constant";
import moment from "moment";
import {getEquipmentBindEquipmentType} from "@/api/labDevice";

let app;
export default {
    name: "RoomDataV",
    components: {
        AlarmThingStatistics,
        ScaleBox,
        datavSelectTree,
        FloorSelectTree,
    },
    inject: ["reload"],
    data() {
        return {
            isDemo: process.env.VUE_APP_DEMO === 'true',
            options: {},
            isContainer: true,
            // 部门
            departmentVisible: false,
            isDatavSelectTree: false,
            isAdaptationScreen: false,
            setDepartmentId: "",
            departmentId: null,
            // 房间
            roomVisible: false,
            isIndeterminate: true,
            roomSelectLoading: true,
            roomChecked: true,
            // 硬件类型
            deviceId: DEVICE_ID,
            dataZoom: DATAZOOM,

            isLoading: false,
            showAnalysis: true,
            date: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
            dateSet: null,
            array: [],
            name: "",
            checkList: [],
            checkLists: [],
            nameArr: [],
            total: null,
            alarmTotal: 0,
            offLine: 0,
            normal: 0,
            isStatusLoading: false,
            open: false,
            equipments: [],
            roomId: null,
            isRoomId: null,
            selectTreeValue: "0",
            instrumentCount: {},
            roomDetail: {},
            rooms: [],
            checkRooms: [],
            width: "",
            buildingId: null,
            typeData: null,
            timeSet: null,
            ids: null,
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
        };
    },
    created() {
        this.departmentOptions = this.getTreeData(this.$store.state.departments);
    },
    mounted() {
        app = document.getElementById("app");
        app.style.background = "#040c1f";
        app.style.overflow = "hidden";
        //用户分辨率100%为false，其他为true
        if (screen.width < 1550) {
            this.isAdaptationScreen = true;
        };

        this.isLoading = true;

        var roomId;
        if (this.$route.query.roomId) {
            roomId = this.$route.query.roomId;
            roomId && this.handleGetRoomDetail(roomId);
        };
        if (this.$route.query.floorId) {
            roomId = this.$route.query.floorId;
            this.selectTreeValue = roomId
        };
        roomId && (this.roomId = roomId);
        this.buildingId = this.$route.query.buildingId;
        this.handleSynth();
        this.handleInit();
        this.handleGetEquipmentTypeList();

    },
    methods: {
        handleGetEquipmentTypeList() {
            getEquipmentBindEquipmentType({objType: 2}).then((res) => {
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
        getTreeData(departments = this.$store.state.departments) {
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
            this.clearTimer();
            clearInterval(this.synthSet);
            this.speakNum = 0
        },
        // 初始化
        handleInit() {
            this.getMapRoomScreenList();
            this.isStatusLoading = true;
            this.timeSet = setInterval(() => {
                this.$nextTick(() => {
                    this.getMapRoomScreenList();
                });
            }, 15000);
            this.dateSet = setInterval(() => {
                this.date = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
            }, 1000)
        },
        handleGetRoomDetail(roomId) {
            getRoomDetail({id: roomId}).then(res => {
                if (res.code) {
                    this.roomDetail = res.items;
                } else {
                    this.$message.error(res.message);
                }
            })
        },
        // 初始化请求
        getMapRoomScreenList(ids) {
            var data = {}
            if (ids) {
                this.ids = ids;
                data['roomIds'] = ids;
            } else {
                if (this.roomId) {
                    if (this.$route.query.roomId) {
                        data['roomIds'] = this.roomId
                    }
                    if (this.$route.query.floorId) {
                        data['floorId'] = this.roomId
                    }
                }
                if (this.buildingId) {
                    data["buildingId"] = this.buildingId
                }
            }
            if (this.typeData) {
                data[Object.keys(this.typeData)] = this.typeData[Object.keys(this.typeData)]
            }
            if (this.departments.length > 0) {
                data["departmentIds"] = this.departments;
            }
            if (this.objTypes.length > 0) {
                data["objTypes"] = this.objTypes;
            }
            getMapRoomScreenV1(data).then(res => {
                this.isStatusLoading = this.isLoading = false;
                if (res.code) {
                    this.array = [];
                    const {instrumentCount, instrumentList, roomDetail} = res.items;
                    this.instrumentCount = instrumentCount || {};
                    this.roomDetail = roomDetail;

                    if (this.instrumentCount.alarmCount > 0 && this.instrumentCount.offlineCount > 0) {
                        if (this.speakNum === 0) {
                            this.handleSpeak(this.$t('dataV.voiceMsg1') + this.instrumentCount.alarmCount + this.$t('dataV.voiceMsg4') + this.$t('dataV.voiceMsg1') + this.instrumentCount.offlineCount + this.$t('dataV.voiceMsg5'));
                            this.handleSpeak(this.$t('dataV.voiceMsg1') + this.instrumentCount.alarmCount + this.$t('dataV.voiceMsg4') + this.$t('dataV.voiceMsg1') + this.instrumentCount.offlineCount + this.$t('dataV.voiceMsg5'));
                            this.handleSpeak(this.$t('dataV.voiceMsg1') + this.instrumentCount.alarmCount + this.$t('dataV.voiceMsg4') + this.$t('dataV.voiceMsg1') + this.instrumentCount.offlineCount + this.$t('dataV.voiceMsg5'));
                            this.handleSpeak(this.$t('dataV.voiceMsg1') + this.instrumentCount.alarmCount + this.$t('dataV.voiceMsg4') + this.$t('dataV.voiceMsg1') + this.instrumentCount.offlineCount + this.$t('dataV.voiceMsg5'));
                            this.handleSpeak(this.$t('dataV.voiceMsg1') + this.instrumentCount.alarmCount + this.$t('dataV.voiceMsg4') + this.$t('dataV.voiceMsg1') + this.instrumentCount.offlineCount + this.$t('dataV.voiceMsg5'));
                        }
                        this.speakNum++
                    } else {
                        if (this.instrumentCount.alarmCount > 0) {
                            if (this.speakNum === 0) {
                                this.handleSpeak(this.$t('dataV.voiceMsg1') + this.instrumentCount.alarmCount + this.$t('dataV.voiceMsg5'));
                                this.handleSpeak(this.$t('dataV.voiceMsg1') + this.instrumentCount.alarmCount + this.$t('dataV.voiceMsg5'));
                                this.handleSpeak(this.$t('dataV.voiceMsg1') + this.instrumentCount.alarmCount + this.$t('dataV.voiceMsg5'));
                                this.handleSpeak(this.$t('dataV.voiceMsg1') + this.instrumentCount.alarmCount + this.$t('dataV.voiceMsg5'));
                                this.handleSpeak(this.$t('dataV.voiceMsg1') + this.instrumentCount.alarmCount + this.$t('dataV.voiceMsg5'));
                            }
                            this.speakNum++
                        }
                        if (this.instrumentCount.offlineCount > 0) {
                            if (this.speakNum === 0) {
                                this.handleSpeak(this.$t('dataV.voiceMsg1') + this.instrumentCount.offlineCount + this.$t('dataV.voiceMsg5'));
                                this.handleSpeak(this.$t('dataV.voiceMsg1') + this.instrumentCount.offlineCount + this.$t('dataV.voiceMsg5'));
                                this.handleSpeak(this.$t('dataV.voiceMsg1') + this.instrumentCount.offlineCount + this.$t('dataV.voiceMsg5'));
                                this.handleSpeak(this.$t('dataV.voiceMsg1') + this.instrumentCount.offlineCount + this.$t('dataV.voiceMsg5'));
                                this.handleSpeak(this.$t('dataV.voiceMsg1') + this.instrumentCount.offlineCount + this.$t('dataV.voiceMsg5'));
                            }
                            this.speakNum++
                        }
                    }

                    if (instrumentList) {
                        this.array = instrumentList
                        // instrumentList.map(item => {
                        //   let obj = {name: item.name, id: item.id, dataName: "", type:"", statusBg: item.type, sensors: []};
                        //   if (item["data"]) {
                        //     item.data.map(data => {
                        //       obj.dataName = data.name;
                        //       obj.type = data.type;
                        //       obj.sensors.push(...data.sensors);
                        //       if(data.type == 8){
                        //         obj.sensors.push(
                        //             {
                        //               isCircuitBreaker: true,
                        //               powerFailure: data.powerFailure
                        //             }
                        //         )
                        //       }
                        //     })
                        //     this.array.push(obj)
                        //   }
                        // })
                    }
                } else {
                    this.$message.error(res.message);
                    this.clearTimer()
                }
            })
        },
        // 语音播放
        handleSynth() {
            this.synth = window.speechSynthesis;
            this.voiceMsg = new SpeechSynthesisUtterance();
            var _this = this;
            this.synthSet = setInterval(() => {
                if (_this.instrumentCount.alarmCount > 0 && _this.instrumentCount.offlineCount > 0) {
                    _this.handleSpeak(_this.$t('dataV.voiceMsg1') + _this.instrumentCount.alarmCount + _this.$t('dataV.voiceMsg4') + _this.$t('dataV.voiceMsg1') + _this.instrumentCount.offlineCount + this.$t('dataV.voiceMsg5'));
                    _this.handleSpeak(_this.$t('dataV.voiceMsg1') + _this.instrumentCount.alarmCount + _this.$t('dataV.voiceMsg4') + _this.$t('dataV.voiceMsg1') + _this.instrumentCount.offlineCount + this.$t('dataV.voiceMsg5'));
                    _this.handleSpeak(_this.$t('dataV.voiceMsg1') + _this.instrumentCount.alarmCount + _this.$t('dataV.voiceMsg4') + _this.$t('dataV.voiceMsg1') + _this.instrumentCount.offlineCount + this.$t('dataV.voiceMsg5'));
                    _this.handleSpeak(_this.$t('dataV.voiceMsg1') + _this.instrumentCount.alarmCount + _this.$t('dataV.voiceMsg4') + _this.$t('dataV.voiceMsg1') + _this.instrumentCount.offlineCount + this.$t('dataV.voiceMsg5'));
                    _this.handleSpeak(_this.$t('dataV.voiceMsg1') + _this.instrumentCount.alarmCount + _this.$t('dataV.voiceMsg4') + _this.$t('dataV.voiceMsg1') + _this.instrumentCount.offlineCount + this.$t('dataV.voiceMsg5'));
                } else {
                    if (_this.instrumentCount.alarmCount > 0) {
                        _this.handleSpeak(_this.$t('dataV.voiceMsg1') + _this.instrumentCount.alarmCount + _this.$t('dataV.voiceMsg4'));
                        _this.handleSpeak(_this.$t('dataV.voiceMsg1') + _this.instrumentCount.alarmCount + _this.$t('dataV.voiceMsg4'));
                        _this.handleSpeak(_this.$t('dataV.voiceMsg1') + _this.instrumentCount.alarmCount + _this.$t('dataV.voiceMsg4'));
                        _this.handleSpeak(_this.$t('dataV.voiceMsg1') + _this.instrumentCount.alarmCount + _this.$t('dataV.voiceMsg4'));
                        _this.handleSpeak(_this.$t('dataV.voiceMsg1') + _this.instrumentCount.alarmCount + _this.$t('dataV.voiceMsg4'));
                    }
                    if (_this.instrumentCount.offlineCount > 0) {
                        _this.handleSpeak(_this.$t('dataV.voiceMsg1') + _this.instrumentCount.offlineCount + _this.$t('dataV.voiceMsg5'));
                        _this.handleSpeak(_this.$t('dataV.voiceMsg1') + _this.instrumentCount.offlineCount + _this.$t('dataV.voiceMsg5'));
                        _this.handleSpeak(_this.$t('dataV.voiceMsg1') + _this.instrumentCount.offlineCount + _this.$t('dataV.voiceMsg5'));
                        _this.handleSpeak(_this.$t('dataV.voiceMsg1') + _this.instrumentCount.offlineCount + _this.$t('dataV.voiceMsg5'));
                        _this.handleSpeak(_this.$t('dataV.voiceMsg1') + _this.instrumentCount.offlineCount + _this.$t('dataV.voiceMsg5'));
                    }
                }
            }, 60000)
        },
        // 语音播报的函数
        handleSpeak(text) {
            const lang = localStorage.getItem("lang")
            this.voiceMsg.text = text;     // 语音内容
            this.voiceMsg.lang = lang;  // 使用的语言:中文
            this.voiceMsg.volume = 1;      // 声音音量
            this.voiceMsg.rate = lang === 'en' ? 0.8 : 1;        // 语速
            this.voiceMsg.pitch = lang === 'en' ? 1 : 2;
            this.synth.speak(this.voiceMsg);    // 播放
        },
        // 开启/关闭语音播报
        handleVoice() {
            this.isVoice = !this.isVoice;
            if (this.isVoice) {
                this.handleSynth()
            } else {
                clearTimeout(this.synthSet);
                const lang = localStorage.getItem("lang")
                this.synthSet = null;
                this.voiceMsg.text = "";
                this.voiceMsg.lang = lang;
                this.synth.cancel(this.voiceMsg);
            }
        },
        // 统计和状态分析筛选
        handleType(key, index) {
            const filterKey = this.isDemo && key === 'type' ? 'status' : key;
            if (this.isDemo && this.typeData && filterKey && this.typeData[filterKey] === index) {
                key = undefined;
            }
            if (key && index !== undefined) {
                var data = {}
                data[this.isDemo && key === 'type' ? 'status' : key] = index;
                this.typeData = data;
            } else {
                this.typeData = undefined
            }
            this.clearTimer();
            this.handleInit()
        },
        // 关闭部门筛选
        closeDepartmentVisible() {
            this.departmentVisible = false;
            this.departments = [];
            this.isDatavSelectTree = false;
        },
        // 赋值部门选中的ID
        getDepartmentId(id) {
            this.setDepartmentId = id
        },
        // 部门筛选-确认
        departmentSubmit() {
            this.isScroll = false;
            clearInterval(this.scrollSet);
            this.scrollSet = null;
            if (this.array.length > 0) {
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
        handleShowRoomSelect() {
            var _this = this;
            this.rooms = [];
            this.checkRooms = [];
            this.checkList = this.checkLists;
            this.handleMapGardenList();
            if (!this.$route.query.floorId) {
                this.handleShowSetting();
                if (this.roomId) {
                    if (this.roomId != this.isRoomId) {
                        this.selectTreeValue = this.isRoomId + ""
                        this.roomId = this.isRoomId;
                    }
                    ;
                    setTimeout(function () {
                        _this.handleQuery()
                    }, 200)
                } else {
                    if (this.isRoomId) {
                        this.selectTreeValue = this.isRoomId + ""
                        this.roomId = this.isRoomId;
                    }
                    ;
                    setTimeout(function () {
                        _this.handleQuery()
                    }, 200)
                }
            } else {
                this.handleQuery()
            }
            if (!this.ids) {
                this.roomChecked = true;
            }
        },
        handleCheckedCitiesChange(value) {
            let checkedCount = value.length;
            this.roomChecked = checkedCount === this.checkRooms.length;
            this.isIndeterminate = checkedCount > 0 && checkedCount < this.checkRooms.length;
        },
        // 关闭房间筛选
        closeRoomVisible() {
            this.roomVisible = false;
        },
        // 房间筛选-园区列表
        handleMapGardenList() {
            if (!this.$store.state.level) {
                this.roomId = "";
                return false;
            }

            this.checkRooms = JSON.parse(JSON.stringify(this.array));
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
        // 房间筛选-园区列表选择
        handleQuery(index) {
            // console.log("roomId:" + this.roomId)
            this.roomSelectLoading = true;
            if (index) {
                this.roomChecked = false;
            }
            getMapFloorRoomListV1({floorId: this.roomId}).then(res => {
                this.roomSelectLoading = false;
                if (res.code) {
                    this.checkRooms = [];
                    if (res.items.roomData) {
                        // 判断上一次勾选的长度和返回长度，相等就显示全部勾选状态
                        if (this.ids && (this.ids.length == res.items.roomData.length)) {
                            this.roomChecked = true;
                        }
                        //
                        res.items.roomData.map(item => {
                            let obj = {name: item.name, id: item.id, screenShowFlag: item.screenShowFlag};
                            this.checkRooms.push(obj);
                            if (this.ids) {
                                if (this.roomId != this.isRoomId) {
                                    this.checkList = [];
                                } else {
                                    this.checkList = this.ids;
                                }
                                this.checkRooms.map((item, index) => {
                                    for (var i = 0; i < this.ids.length; i++) {
                                        if (item.id == this.ids[i]) {
                                            this.checkRooms.unshift(this.checkRooms.splice(index, 1)[0]);
                                        }
                                    }
                                })
                            } else {
                                if (!this.roomChecked) {
                                    this.checkList = []
                                } else {
                                    if (this.$route.query.floorId) {
                                        this.checkRooms.map(item => {
                                            this.checkList.push(item.id)
                                        })
                                    }
                                }
                            }
                        })
                    }
                } else {
                    this.$message.error(res.message);
                }
            })
        },
        // 房间列表
        async handleShowSetting() {
            if (!this.$store.state.level) {
                this.roomId = "";
                return false;
            }
            // var rooms = [{id: 0, name: "全部"}];
            var rooms = [];
            await getRoomSelectList().then(res => {
                if (!this.roomId) {
                    this.roomSelectLoading = false;
                    this.checkRooms = rooms;
                }
                if (res.code) {
                    rooms.push(...res.items);
                } else {
                    this.$message.error(res.message);
                }
            })

            if (!this.roomId) {
                if (this.checkList.length) {
                    if (this.ids) {
                        this.checkList = this.ids;
                        this.checkRooms.map((item, index) => {
                            for (var i = 0; i < this.ids.length; i++) {
                                if (item.id == this.ids[i]) {
                                    this.checkRooms.unshift(this.checkRooms.splice(index, 1)[0]);
                                }
                            }
                        })
                    }
                    // this.array.map(item => {
                    //   this.checkList.push(item.id);
                    // })
                } else {
                    rooms.map(item => {
                        this.checkList.push(item.id);
                    })
                }

                this.roomChecked = this.checkList.length === this.checkRooms.length;
                this.isIndeterminate = this.checkList.length > 0 && this.checkList.length < this.checkRooms.length;
            } else {
                this.checkList = [];
                this.checkList.push(Number(this.roomId));
            }
        },
        // 房间全部打勾
        handleCheckAllChange(item) {
            this.checkList = [];
            if (item) {
                this.checkRooms.map(item => {
                    this.checkList.push(item.id);
                })
            }
            this.isIndeterminate = false
        },
        // 房间筛选确认
        handleCheckBoxList() {
            this.isScroll = false;
            if (this.array.length > 0) {
                this.$refs.blocContainer.scrollTop = 0;
            }

            if (!this.checkList.length) {
                return this.$message.error(this.$t('dataV.atLeastRoom'));
            }
            this.clearTimer();
            this.isRoomId = this.roomId;
            this.roomVisible = false;
            this.rooms = []
            this.isStatusLoading = true;
            var checkList = this.checkList;
            this.checkLists = JSON.parse(JSON.stringify(checkList));
            this.getMapRoomScreenList(checkList);
            var _this = this;
            this.timeSet = setInterval(() => {
                this.$nextTick(() => {
                    this.getMapRoomScreenList(_this.checkLists);
                })
            }, 15000);
            this.$message.success("操作成功");
        },
        // 清除定时器
        clearTimer() {
            clearInterval(this.timeSet);
            this.timeSet = null;
        },
        // 自动滚动
        scroll() {
            if (this.array.length > 0) {
                this.isScroll = !this.isScroll
                if (this.isScroll) {
                    this.$nextTick(() => {
                        const divData = this.$refs.blocContainer
                        this.scrollSet = setInterval(() => {
                            divData.scrollTop += 1
                            if (divData.clientHeight + divData.scrollTop + 1 > divData.scrollHeight) {
                                divData.scrollTop = 0
                            }
                        }, 30)
                    })
                } else {
                    clearInterval(this.scrollSet);
                    this.scrollSet = null
                }
            }
        },
    },
    beforeDestroy() {
        setTimeout(function () {
            app.style.overflow = "";
            app.style.background = "";
        }, 500)
        clearInterval(this.timeSet);
        clearInterval(this.scrollSet);
        clearInterval(this.dateSet);
        this.speakNum = 0;

        // 停止播报
        clearInterval(this.synthSet);
        this.voiceMsg.text = "";
        this.voiceMsg.lang = "zh-CN";
        this.synth.cancel(this.voiceMsg);
    },
};
</script>

<style lang="less">
@import "./dataVpopover.less";
</style>
<style lang="less" scoped>
@import "./index.less";
.screen-filter-active { outline:2px solid #71e6ff; outline-offset:-2px; box-shadow:inset 0 0 24px #71e6ff40; }
.screen-filter-active.abnormal { outline-color:#ff7a86; box-shadow:inset 0 0 24px #ff7a864d; }
</style>
