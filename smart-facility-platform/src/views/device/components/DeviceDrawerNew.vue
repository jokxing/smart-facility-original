<template>
    <el-drawer
        :before-close="handleClose"
        :modal="false"
        :visible.sync="isDrawer"
        :withHeader="false"
        size="70%"
        v-loading.fullscreen.lock="fullscreenLoading">
        <div v-if="isDrawer">
            <div class="detail-container" v-loading="loading">
                <div class="detail-padding">
                    <DrawerNav :is-width="false" :deviceName="device.no" :name="device.name" :type="1" @handle="handleClose"/>

                    <div class="detail-handle clearfix" v-if="$store.state.level">
                        <div>
                            <el-switch
                                v-model="closeSoundLightAlarm"
                                :disabled="device.status === 0"
                                class="margin-small-right"
                                :inactive-text="$t('hardware.acousticOptic')"
                                @change="handleAcoustoOpticAlarm">
                            </el-switch>
                            <el-switch
                                v-model="closeSystemAlarm"
                                :inactive-text="$t('hardware.alarmPlatform')"
                                @change="handlePlatformAlarm">
                            </el-switch>
                        </div>
                        <div style="margin-right: -10px">
                            <el-button v-if="titleType != 10" @click="handleBatchUpdateUseStatus($refs.changeUseStatus)">{{ $t('hardware.fixUseStatus') }}</el-button>
                            <el-button @click="handleDropdownMenu('UpdateExportTime')">
                                {{ $t('hardware.exportTime') }}
                            </el-button>
                            <el-button @click="handleDropdownMenu('UpdateAlarmTime')">
                                {{ $t('hardware.alarmTime') }}
                            </el-button>
                            <el-tooltip v-if="isOpenTwoSystem && isBinding" effect="dark" :content="$t('hardware.isOpenTwoSystem')" placement="top">
                                <el-button class="margin-small-right button-disabled">{{ $t('hardware.alarmRules1') }}</el-button>
                            </el-tooltip>
                            <el-button v-else class="margin-small-right" @click="handleDropdownMenu('UpdateAlarmRules')">{{ $t('hardware.alarmRules1') }}</el-button>
                        </div>
                    </div>

                    <el-descriptions :title="$t('common.basicInformation')">
                        <template v-if="$store.state.level" slot="extra">
                            <el-button
                                v-if="device.wifiFlag"
                                :disabled="device.status === 0"
                                @click="handleDropdownMenu('NetworkConfiguration')">
                                {{ $t('hardware.networkConfiguration') }}
                            </el-button>
                            <el-tooltip v-if="isOpenTwoSystem && isBinding" effect="dark"
                                        :content="$t('hardware.isOpenTwoSystem')" placement="top">
                                <el-button
                                    v-if="titleType === 10"
                                    class="button-disabled">
                                    {{ $t('other.runParam') }}
                                </el-button>
                            </el-tooltip>
                            <el-button
                                v-if="titleType === 10 && !(isOpenTwoSystem && isBinding)"
                                @click="handleDropdownMenu('StandbyPower')">
                                {{ $t('other.runParam') }}
                            </el-button>
                            <el-button
                                class="icon-information"
                                @click="handleDropdownMenu('ReturnCommand')">
                                &nbsp;{{ $t('hardware.returnCommand') }}
                            </el-button>
                            <el-button
                                type="primary"
                                class="icon-edit"
                                @click="handleDropdownMenu('UpdateDepartment')">
                                &nbsp;{{ $t('common.edit') }}
                            </el-button>
                        </template>
                    </el-descriptions>
                    <div class="layout-row">
                        <div style="margin-right: 24px">
                            <device-status-garden
                                :status.sync="device.status"/>
                        </div>
                        <div>
                            <el-descriptions :column="3">
                                <el-descriptions-item :label="$t('hardware.devciceNo')">
                                    {{ device.no }}
                                </el-descriptions-item>
                                <el-descriptions-item :label="$t('common.creatDate')">
                                    {{ device.createDate | localToUtc }}
                                </el-descriptions-item>
                                <el-descriptions-item :label="$t('common.owningDepartment')">
                                    {{ device.departmentName }}
                                </el-descriptions-item>
                                <el-descriptions-item :label="$t('hardware.alarmTime')">
                                    {{ device.alarmInterval + " " + $t('common.minute') }}
                                </el-descriptions-item>
                                <el-descriptions-item :label="$t('hardware.exportTime')">
                                    {{ device.reportingInterval + " " + $t('common.minute') }}
                                </el-descriptions-item>
                                <el-descriptions-item :label="$t('hardware.signalStrength1')">
                                    <div v-html="handleSignalStateFilter(device.signalStrength)"/>
                                </el-descriptions-item>
                                <el-descriptions-item v-if="titleType === 10" :label="$t('other.powerStatus')">
                                    {{ (device["standPower"] ? device.standPower : 0) + "W" }}
                                </el-descriptions-item>
                                <el-descriptions-item v-if="device.panId" label="PanId">
                                    {{ device.panId }}
                                </el-descriptions-item>
                                <el-descriptions-item v-if="titleType !== 10" :label="$t('hardware.kwh')">
                                    {{ device.battery + " V" }}
                                </el-descriptions-item>
                                <template v-for="(item, index) in sensors">
                                    <el-descriptions-item
                                        :key="index"
                                        :label="item['sensorType'] ? item.sensorType.name : ''">
                                        <span :class="handleColor(item)" v-text="handleSensor(item)"></span>
                                    </el-descriptions-item>
                                </template>

                            </el-descriptions>
                            <el-descriptions v-if="showUser">
                                <el-descriptions-item :label="$t('hardware.users')">
                                    <span v-for="(item, index) in equipmentUsers" :key="item.id">
                                        <span>{{ item.userName }}</span>
                                        <span v-if="index !== equipmentUsers.length - 1" class="margin-small">/</span>
                                    </span>
                                </el-descriptions-item>
                            </el-descriptions>
                        </div>
                    </div>

                    <DeviceBindRelationship :id="id" @handle="handleBinding"/>
                </div>

                <div class="detail-padding-nocolor" v-if="sensors.length > 0">
                    <el-descriptions :title="newTitleTime">
                        <template slot="extra">
                            <el-button @click="getDetail" class="icon-reset">&nbsp;{{
                                    $t('hardware.reset')
                                }}
                            </el-button>
                        </template>
                    </el-descriptions>
                    <div class="new-state">
                        <el-row :gutter="20">
                            <el-col v-for="(item, index) in sensors" :key="index" :span="8">
                                <hardware-state :data="item"/>
                            </el-col>
                        </el-row>
                    </div>
                </div>

                <MonitorInfo class="detail-padding" v-if="monitorSensors.length > 0" :objId="device.id"
                             :sensors="monitorSensors" :type="1"/>


                <div class="detail-padding-nocolor">
                    <el-descriptions :title="$t('hardware.users')">
                        <template slot="extra">
                            <el-tooltip v-if="isOpenTwoSystem && isBinding" effect="dark"
                                        :content="$t('hardware.isOpenTwoSystem')" placement="top">
                                <el-button class="icon-staff-settings button-disabled" type="primary">
                                    {{ $t('common.addPrincipal') }}
                                </el-button>
                            </el-tooltip>
                            <el-button v-else class="icon-staff-settings" type="primary"
                                       @click="$refs.SetPrincipal.open(0, device.id)">
                                {{ $t('common.addPrincipal') }}
                            </el-button>
                        </template>
                    </el-descriptions>
                    <principal-table :total="principalTotal" :items="principalItems" :equipment-users="equipmentUsers"
                                     :loading.sync="principalLoading"/>
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
                    <HistoryAlarmRecord v-if="device" :type="1" :id="device.id" />
                   <!-- <HistoryAlarmRecord v-if="sensorsFlag.length > 0" :type="1" :id="device.id" /> -->
                </div>
                <div class="detail-padding-nocolor" v-if="device.equipmentTypeCode != 10">
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
                        <el-table-column slot="beforeChangeStatus" width="100" :label="$t('hardware.afterStatus')">
                            <template v-slot="{row}">
                                <span v-if="row.beforeChangeStatus">
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
            </div>

            <UpdateExportTime ref="UpdateExportTime" @handle="getDetail"/>
            <UpdateAlarmTime ref="UpdateAlarmTime" @handle="getDetail"/>
            <UpdateAlarmRules ref="UpdateAlarmRules" @handle="getDetail"/>
            <network-configuration ref="NetworkConfiguration" @handle="getDetail"/>
            <StandbyPower ref="StandbyPower" @handle="getDetail"/>
            <return-command ref="ReturnCommand"/>
            <change-use-status ref="changeUseStatus" @handle="getDetail"/>
            <UpdateDepartment ref="UpdateDepartment" @getList="getDetail"/>
            <SetPrincipal ref="SetPrincipal" @handle="handleEquipmentUsers"/>
        </div>
    </el-drawer>
</template>

<script>
    import DrawerNav from "@c/DrawerNav";
    import UpdateExportTime from "./UpdateExportTime";
    import UpdateAlarmTime from "./UpdateAlarmTime";
    import UpdateAlarmRules from "@/views/device/components/UpdateAlarmRules";
    import NetworkConfiguration from "./NetworkConfiguration";
    import StandbyPower from "@/views/smartSocket/components/StandbyPower";
    import ReturnCommand from "@/views/device/components/ReturnCommand";
    import UpdateDepartment from "@/views/device/components/UpdateDepartment";
    import DeviceStatusGarden from "@c/DeviceStatusGarden";
    import DeviceBindRelationship from "./DeviceBindRelationship";
    import HardwareState from "@c/HardwareState/index";
    import MonitorInfo from "@c/MonitorInfo";
    import PrincipalTable from "@c/PrincipalTable/index";
    import Pagination from "@c/Pagination/index";
    import HistoryAlarmRecord from "@/components/HistoryAlarmRecord/index.vue";
    import SetPrincipal from "@c/SetPrincipal/index";
    import { signalStateFilter } from "@/utils/methods";
    import {DATAZOOM, DEVICE_USE_STATUS, STATUS_VALUE} from "@/utils/constant";
    import SelfTable from "@c/Table";
    import {
        getDeviceDetail, getUseStatusQuery,
        updateAlarmLight,
        updateCloseAlarmSystem,
    } from "@/api/device";
    import { getDeviceMonitorFlag, getDeviceSingleMonitorFlag, getIsAlarmRuleOpenTwoSystem } from "@/api/monitorIndicator";
    import { getEquipmentUserList } from "@/api/user";
    import store from "@/store";
    import ChangeUseStatus from "@/views/device/components/changeUseStatus";

    export default {
        components: {
            DrawerNav,
            SelfTable,
            ChangeUseStatus,
            UpdateExportTime,
            UpdateAlarmTime,
            UpdateAlarmRules,
            NetworkConfiguration,
            StandbyPower,
            ReturnCommand,
            UpdateDepartment,
            DeviceStatusGarden,
            DeviceBindRelationship,
            HardwareState,
            MonitorInfo,
            PrincipalTable,
            Pagination,
            HistoryAlarmRecord,
            SetPrincipal
        },
        props: {
            id: {
                type: Number | String,
                default: null
            },
            isDrawer: {
                type: Boolean,
                default: false
            },
            titleType: {
                type: Number,
                default: 0,
          },
          showUser: {
            type: Boolean,
            default: true
        },
        showDepartment: {
            type: Boolean,
            default: true
        },
        hideSensorsTypes: {
            type: Array,
            default: () => []
          }
        },
        data() {
            const _this = this;
            return {
                loading: false,
                fullscreenLoading: false,
                device: "",
                closeSoundLightAlarm: false,
                closeSystemAlarm: false,
                isOpenTwoSystem: false,
                deviceId: null,
                isBinding: false,
                equipmentUsers: [],
                sensors: [],
                sensorsFlag: [],
                monitorSensors: [],
                dataZoom: DATAZOOM,
                principalItems: {
                    pageSize: 10,
                    pageNum: 1,
                },
                principalTotal: 0,
                principalLoading: false,
                // 其他详情页
                roomDrawer: false,
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
                        slot: "beforeChangeStatus",
                        width: 100
                    },
                    {
                        title: _this.$t('hardware.afterStatus'),
                        dataIndex: "afterChangeStatus",
                        slot: "afterChangeStatus",
                        width: 100
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
            }
        },
        watch: {
            isDrawer(val){
                if(val){
                    this.getDetail();
                }else{
                    this.device = "";
                    this.sensors = [];
                    this.sensorsFlag = [];
                    this.monitorSensors = []
                }
            },
        },
        computed: {
            newTitleTime() {
                if (this.device["reportDate"]) {
                    return this.$t('hardware.newStatus') +"("+ this.$t('hardware.detectionDate') +"):" + this.$options.filters['localToUtc'](this.device.reportDate) + " ）";
                } else {
                    return this.$t('hardware.newStatus') +"("+ this.$t('hardware.detectionDate') +")";
                }
            },
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
            getDetail() {
                this.loading = true;
                getDeviceDetail({deviceId: this.id}).then(res => {
                    this.loading = false;
                    if(res.code === 1){
                        this.device = res.items;
                        this.useItems.id = this.device.id;
                        this.closeSoundLightAlarm = !this.device.closeSoundLightAlarm;
                        this.closeSystemAlarm = !this.device.closeSystemAlarm;
                        store.commit('setThingDetail', this.device)

                        let lastName = "";
                        this.sensors = [];
                        res.items.sensors.map((item) => {
                            if (item["sensorType"]) {
                                if (lastName === item.sensorType.name) {
                                    item.sensorType.name = lastName + "2";
                                }
                              lastName = item.sensorType.name;
                              if (!this.hideSensorsTypes.includes(item.type)) {
                                this.sensors.push(item);
                              }
                            }
                        });
                        this.getIsAlarmRule();
                        this.handleEquipmentUsers();
                        this.getDeviceSingleMonitor();
                        this.getDeviceMonitor();
                        if (this.device.equipmentTypeCode != 10) {
                            this.handleGetUseStatusList();
                        }
                    }
                })
            },
            // 获取该智能硬件是否在2.0系统上，为true限制报警规则，为false不限制
            getIsAlarmRule() {
                getIsAlarmRuleOpenTwoSystem({equipmentId: this.device.id}).then(res => {
                    if(res.code === 1){
                        this.isOpenTwoSystem = res.items
                    }
                })
            },
            getDeviceSingleMonitor() {
                this.monitorSensors = [];
                getDeviceSingleMonitorFlag({equipmentId: this.device.id}).then(res => {
                    if(res.code === 1){
                        res.items.map(item => {
                            if (!this.hideSensorsTypes.includes(item.sensorId * 1)) {
                                this.monitorSensors.push(item);
                            }
                        })
                    }
                })
            },
            getDeviceMonitor(){
                this.sensorsFlag = [];
                getDeviceMonitorFlag({equipmentId: this.device.id}).then(res => {
                    if(res.code === 1){
                        res.items.map(item => {
                            if (!this.hideSensorsTypes.includes(item.monitorSensorId * 1)) {
                                this.sensorsFlag.push(item);
                            }
                        })
                        store.commit('setDeviceSensorsFlag', this.sensorsFlag)
                    }
                })
            },
            handleColor(item) {
                // if (item.hasOwnProperty("switchStatus") && item.switchStatus === ALERTOR_STATUS.NEW) {
                //     return "offline";
                // }
                if (item.status === STATUS_VALUE.NORMAL || item.status == 0) {
                    return "normal";
                }
                return "abnormal";
            },
            // 获取负责人
            handleEquipmentUsers() {
                this.principalLoading = true;
                getEquipmentUserList({
                    pageNum: this.principalItems.pageNum,
                    pageSize: this.principalItems.pageSize,
                    equipmentId: this.device.id,
                    equipmentType: "DEVICE",
                }).then((res) => {
                    this.principalLoading = false;
                    this.equipmentUsers = res.items.list;
                    this.principalTotal = res.items.total;
                });
            },
            // 声光报警
            handleAcoustoOpticAlarm() {
                this.fullscreenLoading = true;
                updateAlarmLight({
                    id: this.device.id,
                    closeSoundLightAlarm: this.closeSoundLightAlarm ? 0 : 1,
                }).then((res) => {
                    this.fullscreenLoading = false;
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
                });
            },
            // 平台报警
            handlePlatformAlarm() {
                this.fullscreenLoading = true;
                updateCloseAlarmSystem({
                    id: this.device.id,
                    closeSystemAlarm: this.closeSystemAlarm ? 0 : 1,
                }).then((res) => {
                    this.fullscreenLoading = false;
                    if (res.code) {
                        this.$message({
                            type: "success",
                            message: this.$t('common.operateSuccess'),
                            duration: 2000
                        });
                    } else {
                        this.$message.error(res.message);
                        this.closeSystemAlarm = !this.closeSystemAlarm;
                    }
                });
            },
            // 右上角修改按钮
            handleDropdownMenu(e) {
                if (e == "StandbyPower") {
                    this.$refs[e].open(0, this.device.id);
                } else {
                    this.$refs[e].open(0, this.device);
                }
            },
            // 信号
            handleSignalStateFilter(data) {
                return signalStateFilter(data, "dBm", -82, -72, 0);
            },
            handleBinding(val){
                this.isBinding = val
            },
            handleClose() {
                this.$emit("update:isDrawer", false)
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
        }
    }
</script>

<style lang="less" scoped>
.button-disabled {
    cursor: no-drop;
}
</style>
