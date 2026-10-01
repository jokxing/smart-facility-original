<template>
    <el-drawer
        :before-close="handleClose"
        :modal="false"
        :visible.sync="isDrawer"
        :withHeader="false"
        size="70%">
        <div v-if="isDrawer" class="room-drawer detail-container" v-loading="loading">
            <div class="detail-padding">
                <DrawerNav :is-width="false" :name="detail.name" @handle="handleClose"/>
                <el-row v-if="!isDemo" justify="end" type="flex">
<!--                    <el-button -->
<!--                        v-if="isLimit"-->
<!--                        class="margin-small-right" -->
<!--                        icon="icon-add-to" -->
<!--                        @click="$refs.sensorTable.open(0, 3, detail)"> {{ $t('labDevice.addSensor') }}</el-button>-->
                    <el-button @click="handleProbeNameEdit" icon="icon-edit"> {{ $t('labDevice.sensorEdit') }}</el-button>
                    <el-button
                        v-if="isLimit"
                        class="margin-small-right" 
                        icon="icon-Audible-alarm" 
                        @click="$refs.AdvancedAlarmSet.open({id: detail.id, type:3, name:detail.name})"> {{ $t('hardware.alarmSystem') }}</el-button>
                    <el-button class="margin-small-right" type="primary" icon="icon-add-to" @click="$refs.ReportCreate.open({id: detail.id, name: detail.name})">
                        {{ $t('room.addTemplate') }}</el-button>
                </el-row>

                <el-descriptions :column="3" :title="$t('common.basicInformation')"/>
                <div class="layout-row">
                    <div style="margin-right: 24px">
                        <DetailStatusGarden :status.sync="detail.senorStatus" :arr="senorStatus" />
                        <!-- <div class="room-circular">{{ detail.name }}</div> -->
                    </div>
                    <div>
                        <el-descriptions :column="3">
                            <el-descriptions-item :label="$t('common.no')">{{ detail.no }}</el-descriptions-item>
                            <el-descriptions-item :label="$t('room.owningFloor')">{{ detail.floorName }}</el-descriptions-item>
                            <el-descriptions-item :label="$t('labDevice.sensorStatus')">
                                {{ statusText(detail.senorStatus, MONITORSTATUS) }}
                            </el-descriptions-item>
                            <el-descriptions-item :label="$t('common.owningDepartment')">{{ detail.departmentName }}</el-descriptions-item>
                            <el-descriptions-item :label="$t('common.creatDate')">{{ detail.createDate | localToUtc }}</el-descriptions-item>
                            <el-descriptions-item :label="$t('room.newReportClass')" labelClassName="label-big">
                                <span>{{ detail.status | levelFilter }}</span>
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

                <el-row v-if="detail && !isDemo">
                    <el-popover
                        placement="right"
                        width="550"
                        trigger="click"
                        @show="showBindHardwareTable = true"
                        @hide="showBindHardwareTable = false">
                        <BindHardwareTable v-if="showBindHardwareTable" :type="3" :id="detail.id" />
                        <el-button slot="reference">{{ $t('labDevice.bindDevice') }}</el-button>
                    </el-popover>
                </el-row>
            </div>

            <div class="detail-padding-nocolor" ><!-- 这个div要始终显示 -->
                <el-descriptions :title="$t('hardware.newStatus')">
                    <template slot="extra">
                        <el-button @click="getProbeIndex" icon="icon-reset">{{ $t('hardware.reset') }}</el-button>
                    </template>
                </el-descriptions>
                <div class="new-state" v-if="sensors.length > 0">
                    <el-row :gutter="20">
                        <el-col v-for="(item, index) in sensors" :key="index" :span="8">
                            <MonitorSensor v-if="!item.deleteFlag" :sensors="item" :type="3" />
                        </el-col>
                    </el-row>
                </div>
            </div>

            <MonitorInfo class="detail-padding" v-if="sensors.length > 0 && detail" :objId="detail.id" :sensors="sensors" :type="3" />

            <div class="detail-padding-nocolor">
                <MonitorEquipment v-if="detail" :id="detail.id" />
            </div>

            <TagPane 
                ref="tagPane" 
                class="detail-padding" 
                v-if="detail && !isDemo" 
                :id="detail.id" 
                :type="3"
                :no="detail.no"
                @handlePreviewReport="handlePreviewReport" />
        </div>
        
        <AdvancedAlarmSet ref="AdvancedAlarmSet" @handle="getDetail" />
        <ReportCreate ref="ReportCreate" :reportDrawer.sync="reportDrawer"/>
        <ReportEdit
            v-if="reportDrawer"
            :is-drawer.sync="reportDrawer"
            :preview.sync="isPreview"
            :row.sync="reportObject"
            @handle="handleTagPaneList()"/>

        <ProbeNameEdit
            ref="probeNameEdit"
            @handle="getDetail"
            @handleSensorTable="handleSensorTable" />
        <SensorTable
            ref="sensorTable" 
            @handle="getDetail" 
            @handleProbeNameEdit="$refs.probeNameEdit.handleSensorChange(1)" />
    </el-drawer>
</template>

<script>
    import DrawerNav from "@c/DrawerNav"
    import DetailStatusGarden from "@c/DetailStatusGarden";
    import ReportCreate from "@/views/room/components/ReportCreate";
    import MonitorSensor from "@c/MonitorSensor";
    import MonitorInfo from "@c/MonitorInfo";
    import MonitorEquipment from "./MonitorEquipment";
    import TagPane from "./TagPane";
    import ProbeNameEdit from "@/components/ProbeNameEditNew";
    import ReportEdit from "@/views/room/components/ReportEdit";
    import SensorTable from "@c/SensorTable";
    import AdvancedAlarmSet from "@/views/AdvancedAlarmSet/index";
    import BindHardwareTable from "@c/BindHardwareTable";
    import { getRoomDetail } from "@/api/room";
    import {getThingsUserList} from "@/api/user";
    import { getOpenMonitorFlag, getMonitorFlag } from "@/api/monitorIndicator";
    import { MONITORSTATUS } from "@/utils/constant";
    import { statusText, statusColor } from "@/utils/methods";
    import store from "@/store";
    export default {
        components: {
            DrawerNav,
            DetailStatusGarden,
            ReportCreate,
            MonitorSensor,
            MonitorInfo,
            MonitorEquipment,
            TagPane,
            ProbeNameEdit,
            ReportEdit,
            SensorTable,
            AdvancedAlarmSet,
            BindHardwareTable
        },
        props: {
            roomId: {
                type: Number | String,
                default: null
            },
            isDrawer: {
                type: Boolean,
                default: false
            },
        },
        data() {
            return {
                isDemo: process.env.VUE_APP_DEMO === 'true',
                MONITORSTATUS,
                statusText,
                statusColor,
                senorStatus: MONITORSTATUS,
                isLimit: JSON.parse(localStorage.getItem('USERINFO')).roleId <= 4,
                loading: false,
                reportDrawer: false,
                isPreview: false,
                reportObject: {},
                detail: "",
                equipmentUsers: [],
                sensors: [],
                sensorsFlag: [],
                showBindHardwareTable: false,
            }
        },
        watch: {
            isDrawer(val){
                if(val){
                    this.getDetail()
                }else{
                    this.detail = "";
                    this.sensors = [];
                }
            },
        },
        mounted() {
            for(var i = 0; i < this.senorStatus.length; i++){
                if(this.senorStatus[i].code === 4){
                    this.senorStatus[i].label = this.$t('labDevice.noMonitor'),
                    this.senorStatus[i].value = "blueColor"
                }
            }
        },
        methods: {
            getDetail() {
                this.loading = true;
                getRoomDetail({id: this.roomId}).then(res => {
                    this.loading = false;
                    if(res.code === 1){
                        this.detail = res.items;
                        this.handleEquipmentUsers();
                        this.getProbeIndex();
                        this.getProbeIndexFlag();
                        store.commit('setThingDetail', this.detail)
                    }
                })
            },
            // 负责人
            handleEquipmentUsers() {
                getThingsUserList(
                    {
                        pageSize: 10,
                        pageNum: 1,
                        thingId: this.detail.id
                    }
                ).then(res => {
                    if(res.code === 1){
                        this.equipmentUsers = res.items.list
                    }
                })
            },
            handleShowSlash(index) {
                return index !== this.equipmentUsers.length - 1;
            },
            // 获取探头指标
            getProbeIndex() {
                var data = {
                    objId: this.detail.id,
                    objType: 3,
                };
                this.sensors = [];
                getOpenMonitorFlag(data).then(res => {
                    if(res.code === 1){
                        this.sensors = res.items.list;
                    }
                })
            },
            getProbeIndexFlag() {
                var data = {
                    objId: this.detail.id,
                    objType: 3,
                };
                this.sensorsFlag = []
                getMonitorFlag(data).then(res => {
                    if(res.code === 1){
                        this.sensorsFlag = res.items;
                        store.commit('setSensorsFlag', this.sensorsFlag)
                    }
                })
            },
            // 探头名称编辑
            handleProbeNameEdit() {
                this.$refs.probeNameEdit.open(this.detail, 3)
            },
            // 探头名称编辑-更换
            handleSensorTable(row) {
                this.$refs.sensorTable.open(1, 2, row)
            },
            // 更新tag数据
            handleTagPaneList() {
                this.$refs.tagPane.getList()
            },
            // 拉起巡查报告
            handlePreviewReport(row) {
                this.reportDrawer = true;
                this.reportObject = row;
            },
            handleClose() {
                this.$emit("update:isDrawer", false)
            },
        }
    }
</script>

<style lang="less" scoped>
    .room-drawer{
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
        /deep/ .el-descriptions-item__container{
            align-items: center;
        }
    }
</style>