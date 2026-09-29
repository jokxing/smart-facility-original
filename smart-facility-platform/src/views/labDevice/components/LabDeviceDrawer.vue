<template>
    <el-drawer
        :before-close="handleClose"
        :modal="false"
        :visible.sync="isDrawer"
        :with-header="false"
        size="70%">
        <div class="LabDevice-drawer detail-container" v-if="isDrawer" v-loading="loading">
            <div class="detail-padding">
                <drawer-nav :name="detail.name" @handle="handleClose"/>
                <el-row v-if="detail.standbyPowerFlag" type="flex" justify="center">
                    <el-alert
                        style="width: 60%"
                        :title="$t('labDevice.newLine') + (detail.status ===1 ? $t('labDevice.runing') : $t('labDevice.unruning')) +'，' + $t('labDevice.newO')+(detail.status ===1 ? $t('labDevice.runing') : $t('labDevice.unruning')) + useTime(detail.currentRunDuration)[0]+ $t('labDevice.host')+useTime(detail.currentRunDuration)[1]+ $t('common.minute1')"
                        :type="detail.status === 1 ? 'success' : 'info'"
                        center
                        :closable="false"
                        effect="dark">
                    </el-alert>
                </el-row>

                <div class="detail-handle margin-center clearfix">
                    <div>
                        <div v-if="detail.types != 2 && detail.detailType == 1" class="status">
                            {{ $t('labDevice.runStatus') }}
                            <span
                                v-if="detail.status != 4"
                                :style="{ backgroundColor: getStatusColor(detail.status, LABSTATUS) }"
                                class="dot">
                            </span>
                            <span>({{ statusText(detail.status, LABSTATUS) }})</span>
                        </div>
                        <div v-if="detail.types != 2 && detail.detailType == 1" class="status">
                            {{ $t('labDevice.paramStatus') }}
                            <span
                                v-if="detail.bingStatus && detail.bingStatus != 4"
                                class="dot"
                                :class="getSenorStatus(detail.bingStatus)[2]">
                            </span>
                            <span>({{ detail.bingStatus && getSenorStatus(detail.bingStatus)[0] }})</span>
                        </div>
                    </div>

                    <div>
<!--                        <el-button-->
<!--                            v-if="isLimit"-->
<!--                            class="margin-small-right"-->
<!--                            icon="icon-add-to"-->
<!--                            @click="$refs.sensorTable.open(0, 2, detail)"> {{ $t('labDevice.addSensor') }}-->
<!--                        </el-button>-->
                        <el-button @click="handleProbeNameEdit" icon="icon-edit"> {{
                                $t('labDevice.sensorEdit')
                            }}
                        </el-button>
                        <el-button
                            v-if="isStandbyPower"
                            @click="$refs.StandbyPower.open(0, detail.bindingDeviceId)">{{ $t('other.runParam') }}
                        </el-button>
                        <el-button
                            v-if="isLimit"
                            class="margin-small-right"
                            icon="icon-Audible-alarm"
                            @click="$refs.AdvancedAlarmSet.open({id: detail.id, type:2, name:detail.name})">
                            {{ $t('hardware.alarmSystem') }}
                        </el-button>
                        <el-button class="margin-small-right" type="primary" icon="icon-reserve"
                                   @click="handleIsFullcalendar">&nbsp;{{ $t('labDevice.addOrder') }}
                        </el-button>
                        <el-button class="margin-small-right" :disabled="detail.status === 3"
                                   @click="handleMaintenance">{{ $t('labDevice.addMaintenance') }}
                        </el-button>
                    </div>
                </div>

                <el-descriptions :title="$t('common.basicInformation')">
                    <template #extra>
                        <el-button type="primary" class="icon-edit" @click="handleEdit(detail)">&nbsp;{{
                                $t('common.edit')
                            }}
                        </el-button>
                        <el-button @click="$refs.addWarehous.open(2, detail.id)">{{
                                $t('labDevice.assetDetail')
                            }}
                        </el-button>
                    </template>
                </el-descriptions>
                <div class="layout-row">
                    <div style="margin-right: 24px">
                        <div
                            class="pic"
                            v-if="detail"
                            :style="{ backgroundImage: `url(${
                                detail.logoUrl ? BASE_URL + detail.logoUrl : defaultImage
                            })` }">
                            <span v-if="!detail.logoUrl">{{ $t('labDevice.notImg') }}</span>
                        </div>
                    </div>
                    <div>
                        <el-descriptions :column="3">
                            <el-descriptions-item :label="$t('labDevice.labDeviceNo')">{{
                                    detail.no || $t('common.notMessage')
                                }}
                            </el-descriptions-item>
                            <el-descriptions-item :label="$t('labDevice.paramStatus')">
                                <span v-if="detail.bingStatus"
                                      :class="{ 'abnormal': detail.bingStatus == -1 || detail.bingStatus == 2 }">
                                    {{ getSenorStatus(detail.bingStatus)[0] }}
                                </span>
                                <span v-else>{{$t('common.notMessage')}}</span>
                            </el-descriptions-item>
                            <el-descriptions-item :label="$t('labDevice.brand')">
                                {{ detail.brand || $t('common.notMessage') }}
                            </el-descriptions-item>
                            <el-descriptions-item :label="$t('common.owningDepartment')">
                                {{ detail.departmentName || $t('common.notMessage') }}
                            </el-descriptions-item>
                            <el-descriptions-item :label="$t('common.principal')">
                                {{ detail.managerName || $t('common.notMessage') }}
                            </el-descriptions-item>
                            <el-descriptions-item :label="$t('labDevice.price1')">{{
                                    detail.price || 0
                                }}{{ $t('labDevice.yuan') }}
                            </el-descriptions-item>
                            <el-descriptions-item :label="$t('labDevice.model')">
                                {{ detail.model || $t('common.notMessage') }}
                            </el-descriptions-item>
                            <el-descriptions-item :label="$t('labDevice.labDeviceType')">{{
                                    detail.typeName || $t('common.notMessage')
                                }}
                            </el-descriptions-item>
                            <el-descriptions-item :label="$t('common.owningRoom')">
                                {{ detail.roomName || $t('common.notMessage') }}
                            </el-descriptions-item>
                            <el-descriptions-item :label="$t('common.createName')">
                                {{ detail.userName || $t('common.notMessage') }}
                            </el-descriptions-item>
                            <el-descriptions-item :label="$t('common.creatDate')">{{ $options.filters['localToUtc'](detail.createDate) || $t('common.notMessage') }}</el-descriptions-item>

                            <el-descriptions-item :label="$t('common.companyName')">
                                {{ detail.companyName || $t('common.notMessage') }}
                            </el-descriptions-item>
                            <el-descriptions-item :label="$t('labDevice.labDeviceBuyDate')">
                                {{ detail.buyDate || $t('common.notMessage') }}
                            </el-descriptions-item>
                            <el-descriptions-item :label="$t('labDevice.nextMaintenanceDate')">
                                {{ detail.nextMaintenanceDate || $t('common.notMessage') }}
                            </el-descriptions-item>
                            <el-descriptions-item :label="$t('labDevice.labDeviceGrade')">
                                {{ detail.gradeName || $t('common.notMessage') }}
                            </el-descriptions-item>
                            <el-descriptions-item :label="$t('hardware.labelNo')">{{ detail.labelNo || $t('common.notMessage') }}</el-descriptions-item>
                            <el-descriptions-item :label="$t('labDevice.monitorStatus')">
                                <span :class="{'abnormal': detail.monitorStatus === 3}">{{
                                        statusText(detail.monitorStatus, ASSETTAGSTATUS) || $t('common.notMessage')
                                    }}</span>
                                <el-link type="primary" v-if="detail.labelId" :underline="false"
                                         @click="handleUnbindLabel"> &nbsp;&nbsp;{{ $t('common.unBind') }}
                                </el-link>
                            </el-descriptions-item>
                            <el-descriptions-item :label="$t('labDevice.labQrCode')">
                                <span v-if="!detail.qrUrl">{{ $t('common.notMessage') }}</span>
                                <div v-else class="qrcode">
                                    <img :src="BASE_URL + detail.qrUrl" width="100" style="vertical-align: text-top;">
                                    <div class="cover-qrcodeNo"></div>
                                </div>
                            </el-descriptions-item>
                        </el-descriptions>
                    </div>
                </div>

                <el-row v-if="detail">
                    <el-popover
                        placement="right"
                        width="550"
                        trigger="click"
                        @show="showBindHardwareTable = true"
                        @hide="showBindHardwareTable = false">
                        <BindHardwareTable v-if="showBindHardwareTable" :type="2" :id="detail.id"/>
                        <el-button slot="reference">{{ $t('labDevice.bindDevice') }}</el-button>
                    </el-popover>
                </el-row>
            </div>

            <div class="detail-padding-nocolor"><!-- 这个div要始终显示 -->
                <!-- <el-descriptions :title="'最新状态 （ 检测时间：' + (sensors[0].monitorSensorTime ? sensors[0].monitorSensorTime : '') +' )'"> -->
                <el-descriptions :title="$t('hardware.newStatus')">
                    <template slot="extra">

                        <el-button @click="getProbeIndex" icon="icon-reset"> {{
                                $t('hardware.reset')
                            }}
                        </el-button>
                    </template>
                </el-descriptions>
                <div class="new-state" v-if="sensors.length > 0">
                    <el-row :gutter="20">
                        <el-col v-for="(item, index) in sensors" :key="index" :span="8">
                            <MonitorSensor v-if="!item.deleteFlag" :sensors="item"/>
                        </el-col>
                    </el-row>
                </div>
            </div>

            <MonitorInfo class="detail-padding" v-if="sensors.length > 0 && detail" :objId="detail.id"
                         :sensors="sensors" :type="2"/>

<!--            <div class="detail-padding flex charts">-->
<!--                <div class="bg">-->
<!--                    <div class="title">{{ $t('labDevice.dataSearch') }}：</div>-->
<!--                    <div>-->
<!--                        <el-checkbox-group v-model="checkList">-->
<!--                            <el-checkbox :label="1">{{ $t('labDevice.softwareRate') }}</el-checkbox>-->
<!--                            <el-checkbox :disabled="true" :label="2">{{ $t('labDevice.deviceRate') }}</el-checkbox>-->
<!--                            <el-checkbox :label="3">{{ $t('labDevice.smartRate') }}</el-checkbox>-->
<!--                        </el-checkbox-group>-->
<!--                    </div>-->
<!--                </div>-->
<!--            </div>-->
<!--            <div class="detail-padding">-->
<!--                <div class="charts">-->
<!--                    <div class="title">{{ $t('labDevice.userStatusStat') }}</div>-->
<!--                    <chart-dimension-->
<!--                        class="margin-center"-->
<!--                        :type="useCountItems.dateType"-->
<!--                        :interval="useCountItems.periodType"-->
<!--                        :interval-type.sync="usageSelectsLeft"-->
<!--                        :dimension-type="dataType"-->
<!--                        :mini="'mini'"-->
<!--                        @handle="handleDateType($event, 1, useCountItems)"-->
<!--                        @change="handleInterval($event, 1, useCountItems)"-->
<!--                        @handleTime="handleTime($event, 1, useCountItems)">-->
<!--                        <template #left><span class="margin-small-right">{{ $t('labDevice.userStatusRateSet') }}</span>-->
<!--                        </template>-->
<!--                    </chart-dimension>-->
<!--                    <div class="use-rate" v-for="(item, index) in useCountChart">-->
<!--                        <div class="use-rate-type">{{ item.name }}</div>-->
<!--                        <div class="use-ul margin-center">-->
<!--                            <div class="use-type-li">-->
<!--                                <div class="use-li-title">{{ $t('labDevice.useNum') }}</div>-->
<!--                                <div class="ring">-->
<!--                                    <span class="num-color">{{ item.useCount }}</span>-->
<!--                                </div>-->
<!--                                <div class="icon-img">-->
<!--                                    <img src="../../../assets/labdevice/icon-next.png" alt="">-->
<!--                                </div>-->
<!--                            </div>-->
<!--                            <div class="use-type-li">-->
<!--                                <div class="use-li-title">{{ $t('labDevice.runDurationHMS') }}</div>-->
<!--                                <div class="ring">-->
<!--                                    <div class="">-->
<!--                                        <span class="num-color">{{ useTime(item.useTime)[0] }} : </span>-->
<!--                                        <span class="num-color">{{ useTime(item.useTime)[1] }}</span>-->
<!--                                    </div>-->
<!--                                </div>-->
<!--                                <div class="icon-img">-->
<!--                                    <img src="../../../assets/labdevice/icon-time.png" alt="">-->
<!--                                </div>-->
<!--                            </div>-->
<!--                            <div class="use-type-li">-->
<!--                                <div class="use-li-title">{{ $t('labDevice.compositeRate') }}</div>-->
<!--                                <div>-->
<!--                                    <span class="num-color">{{ item.useRate }}%</span>-->
<!--                                </div>-->
<!--                                <div class="blockOut">-->
<!--                                    <div class="progress rotate1" :style="styleTransform(item.useRate)"></div>-->
<!--                                </div>-->
<!--                                &lt;!&ndash;                                <el-progress type="circle" :stroke-width="20" :percentage="item.useRate"></el-progress>&ndash;&gt;-->
<!--                            </div>-->
<!--                            <div class="use-type-li">-->
<!--                                <div class="use-li-title">{{ $t('labDevice.powerSum') }}</div>-->
<!--                                <div class="ring use-ring2">-->
<!--                                    <div>-->
<!--                                        <div v-if="item.name === $t('other.smartSocket')">{{ item.power }} kw▪h</div>-->

<!--                                    </div>-->
<!--                                    <img v-if="item.name === $t('other.smartSocket')" src="../../../assets/systemImages/power.png"-->
<!--                                         alt="">-->
<!--                                    <img class="not-img" v-if="item.name !== $t('other.smartSocket') && lang !== 'en'"  src="../../../assets/systemImages/powerNot.png" alt="">-->
<!--                                    <img class="not-img" v-if="item.name !== $t('other.smartSocket') && lang === 'en'"  src="../../../assets/systemImages/powerNot1.png" alt="">-->
<!--                                </div>-->
<!--                            </div>-->
<!--                        </div>-->

<!--                    </div>-->
<!--                </div>-->
<!--                <div class="charts margin-center flex">-->
<!--                    <div class="title">{{ $t('labDevice.timeIntervalRate') }}</div>-->
<!--                    <el-tooltip class="item" effect="light" placement="bottom-end">-->
<!--                        <div slot="content">{{ $t('labDevice.timeIntervalMessage')}} <br/>{{ $t('labDevice.timeIntervalMessage1')}}<br/>{{ $t('labDevice.timeIntervalMessage2')}}-->
<!--                        </div>-->
<!--                        <el-button type="text" class="el-icon-info"></el-button>-->
<!--                    </el-tooltip>-->
<!--                </div>-->
<!--                <chart-dimension-->
<!--                    class="margin-center"-->
<!--                    :type="timeIntervalItems.dateType"-->
<!--                    :interval="timeIntervalItems.periodType"-->
<!--                    :interval-type.sync="useCountSelectLeft"-->
<!--                    :mini="'mini'"-->
<!--                    :dimension-type="[{INTERVAL: 2, LABEL: $t('common.week')},{INTERVAL: 3, LABEL: $t('common.month')},]"-->
<!--                    @handle="handleDateType($event, 2, timeIntervalItems)"-->
<!--                    @change="handleInterval($event, 2, timeIntervalItems)"-->
<!--                    @handleTime="handleTime($event, 2, timeIntervalItems)">-->
<!--                    <template #left><span class="margin-small-right">{{ $t('labDevice.userStatusRateSet') }}</span>-->
<!--                    </template>-->
<!--                    <template #right>-->
<!--                        <el-button class="icon-reset mini" @click="handleReset(1)">&nbsp;{{ $t('labDevice.reset') }}</el-button>-->
<!--                    </template>-->
<!--                </chart-dimension>-->
<!--                <histogram-chart-->
<!--                    :type="-1"-->
<!--                    :legend-show="true"-->
<!--                    :colors="['#3078F0', '#D9B480']"-->
<!--                    :height="'400px'" :data-charts="timeIntervalChart"/>-->
<!--            </div>-->
<!--            <div class="charts detail-padding">-->
<!--                <div class="title">{{ $t('labDevice.useDayCountItems') }}</div>-->
<!--                <chart-dimension-->
<!--                    class="margin-center"-->
<!--                    :type="useDayCountItems.dateType"-->
<!--                    :interval="useDayCountItems.periodType"-->
<!--                    :interval-type.sync="usageSelectsLeft"-->
<!--                    :mini="'mini'"-->
<!--                    :dimension-type="[{INTERVAL: 3, LABEL: $t('common.month')},]"-->
<!--                    @handle="handleDateType($event, 3, useDayCountItems)"-->
<!--                    @change="handleInterval($event, 3, useDayCountItems)"-->
<!--                    @handleTime="handleTime($event, 3, useDayCountItems)">-->
<!--                    <template #left><span class="margin-small-right">{{ $t('labDevice.userStatusRateSet') }}</span>-->
<!--                    </template>-->
<!--                    <template #right>-->
<!--                        <el-button class="icon-reset mini" @click="handleReset(2)">&nbsp;{{ $t('labDevice.reset') }}</el-button>-->
<!--                    </template>-->
<!--                </chart-dimension>-->
<!--                <histogram-chart-->
<!--                    :height="'400px'"-->
<!--                    :is-data-zoom="true"-->
<!--                    :is-toolbox="true"-->
<!--                    :type="-1"-->
<!--                    :legend-show="true"-->
<!--                    :is-mark-link="true"-->
<!--                    :obj="useDayCountItems1"-->
<!--                    :colors="['#3078F0', '#D9B480']"-->
<!--                    :data-charts="useDayCountChart"/>-->
<!--            </div>-->
            <TagPane
                ref="tagPane"
                class="detail-padding"
                v-if="detail"
                :id="detail.id"
                :no="detail.no"
                :type="2"
                @handle="handleTagPane"/>

        </div>
        <Fullcalendar
            v-if="isFullcalendar"
            :isBanPastTime="true"
            :id="detail.id"
            @goIsFullcalendar="handleIsFullcalendar"
            @handleSetDate="handleSetDate(1,$event)"/>
        <AdvancedAlarmSet ref="AdvancedAlarmSet" @handle="getDetail"/>
        <ReservationModal ref="reservationModal" v-if="detail" :detail="detail" @handle="handleReservation"/>
        <MaintenanceModal ref="maintenanceModal" @handle="$refs.tagPane.getList()"/>
        <ProbeNameEdit
            ref="probeNameEdit"
            @handle="getDetail"
            @handleSensorTable="handleSensorTable"/>
        <AddWarehous ref="addWarehous"/>
        <SensorTable
            ref="sensorTable"
            @handle="getDetail"
            @handleProbeNameEdit="$refs.probeNameEdit.handleSensorChange(1)"/>
        <use-ran-high-search ref="UseRanHighSearch" @handle="handleHigthSearch"/>
        <search-time-frame ref="SearchTimeFrame" @handle="handleTimeFrame"/>
        <StandbyPower ref="StandbyPower"/>
        <Modal v-if="modalVisible" :type="4" @handle="afterUpdateGetDetail"/>
    </el-drawer>
</template>

<script>
import HistogramChart from "@/components/HistogramChart";
import DrawerNav from "@c/DrawerNav/index";
import MonitorSensor from "@c/MonitorSensor";
import MonitorInfo from "@c/MonitorInfo";
import TagPane from "./TagPane";
import Fullcalendar from "@/components/Fullcalendar";
import ReservationModal from "./ReservationModal";
import MaintenanceModal from "./MaintenanceModal";
import ProbeNameEdit from "@/components/ProbeNameEditNew";
import SensorTable from "@c/SensorTable";
import AdvancedAlarmSet from "@/views/AdvancedAlarmSet/index";
import BindHardwareTable from "@c/BindHardwareTable";
import Modal from "@/views/labDevice/modal";
import {
    getInstrumentDetail,
    getInstrumentUnbind,
    getStatisticEquipmentUse,
    postInstrumentTimeIntervalStatistics,
    postInstrumentUseCountStatistics,
    postInstrumentUseDayCountStatistics,
    postStatisticEquipmentUsePort
} from "@/api/labDevice"
import {BASE_URL, ASSETTAGSTATUS, LABSTATUS, TIME_FORMAT} from "@/utils/constant";
import {getSenorStatus, statusText, getStatusColor} from "@/utils/methods";
import {getOpenMonitorFlag, getMonitorFlag} from "@/api/monitorIndicator";
import LineChart from "@/components/LineChart"
import ChartDimension from "@/components/ChartDimension";
import store from "@/store";
import AddWarehous from "@/views/assetProcess/components/AddWarehous";
import moment from "moment";
import UseRanHighSearch from "@c/UseRanHighSearch";
import mixin from "@/utils/mixin";
import StandbyPower from "@/views/smartSocket/components/StandbyPower";
import SearchTimeFrame from "@/views/labDevice/components/SearchTimeFrame";
import i18n from "@/i18n";
import {mapMutations, mapState} from "vuex";

const p = [i18n.t('labDevice.softwareRate'), i18n.t('labDevice.deviceRate'), i18n.t('labDevice.smartRate')]
const searchParam = {
    instrumentId: "",
    periodType: 1,
    queryTypes: [1,3],
    beginTime: "",
    dateType: 3,
    endTime: "",
    periodBeginTime: "",
    periodEndTime: "",
}
export default {
    components: {
        Modal,
        SearchTimeFrame,
        DrawerNav,
        MonitorSensor,
        MonitorInfo,
        TagPane,
        AddWarehous,
        Fullcalendar,
        ReservationModal,
        UseRanHighSearch,
        StandbyPower,
        MaintenanceModal,
        ProbeNameEdit,
        SensorTable,
        AdvancedAlarmSet,
        HistogramChart,
        BindHardwareTable,
        ChartDimension,
        LineChart
    },
    props: {
        id: {
            type: Number | String,
            default: null
        },
        isDrawer: {
            type: Boolean,
            default: false
        }
    },
    data() {
        const _this = this;
        return {
            ASSETTAGSTATUS,
            LABSTATUS,
            getSenorStatus,
            statusText,
            getStatusColor,
            isLimit: JSON.parse(localStorage.getItem('USERINFO')).roleId <= 4,
            loading: false,
            isFullcalendar: false,
            isStandbyPower: false,
            detail: "",
            defaultImage: require("../../../assets/systemImages/equipment.png"),
            BASE_URL,
            sensors: [],
            sensorsItem: {},
            bindingDeviceId: [],
            sensorsFlag: [],
            showBindHardwareTable: false,
            statisticUse: {
                instrumentId: "",
                queryType: 1,// 1 设备使用率排行，2 日使用率排行，3 平均日使用率排行
                beginTime: "",
                endTime: "",
                dateType: 1, // 1 今日，2 本周，3 本月
                periodBeginTime: "",//时间段开始
                periodEndTime: "",// 时间段结束
                periodType: 1 // 1 工作日，2 自然日
            },
            timeIntervalItems: JSON.parse(JSON.stringify(searchParam)), //  时段
            useCountItems: JSON.parse(JSON.stringify(searchParam)), // 设备状态
            useDayCountItems: JSON.parse(JSON.stringify(searchParam)), //日使用
            timeIntervalChart: {
                loading: false,
                columns: ["name"],
                rows: [],
            },
            useCountChart: [],
            useDayCountChart: {
                loading: false,
                columns: ["name"],
                rows: [],
            },
            dataType: [
                {INTERVAL: 1, LABEL: _this.$t('common.day')},
                {INTERVAL: 2, LABEL: _this.$t('common.week')},
                {INTERVAL: 3, LABEL: _this.$t('common.month'), type: 'text'},
            ],
            usageSelectsLeft: [
                {index: 1, label: _this.$t('common.workday')},
                {index: 2, label: _this.$t('common.naturalDay')},
                {index: 3, label: _this.$t('common.timeInterval'), type: 'text'},
            ],
            useCountSelectLeft: [
                {index: 1, label: _this.$t('common.workday')},
                {index: 2, label: _this.$t('common.naturalDay')},
            ],
            dataCharts: {
                columns: ["lineName", "data"],
                rows: []
            },
            chartsLoading: false,
            checkList: [],
            eqiupmentAlarmData: {
                loading: false,
                columns: ["label", "data1", "data2", "data3"],
                rows: [],
                formatter: "%"
            },
            timeFlag: 1,
            useDayCountItems1: {},
            lang: "zh"
        }
    },
    watch: {
        isDrawer(val) {
            if (val) {
                this.lang = localStorage.getItem("lang")
                this.statisticUse.instrumentId = this.id;
                this.timeIntervalItems.instrumentId = this.id;
                this.useCountItems.instrumentId = this.id;
                this.useDayCountItems.instrumentId = this.id;
                this.useCountItems.dateType = 3;
                this.timeIntervalItems.dateType = 3;
                this.useDayCountItems.dateType = 3;
                this.checkList = this.timeIntervalItems.queryTypes;
                let arr = [];
                this.checkList.map(item => {
                    this.timeIntervalChart.columns.push(p[item - 1]);
                    this.useDayCountChart.columns.push(p[item - 1]);
                })
                this.timeIntervalChart.columns = [...new Set(this.timeIntervalChart.columns)]
                this.useDayCountChart.columns = [...new Set(this.useDayCountChart.columns)]
                this.getDetail();
                // this.handleUseDayCount();
                // this.handleUseCount();
                // this.handleTimeInterval();
            } else {
                this.detail = "";
                this.sensors = [];
                this.sensorsItem = {};
                this.checkList = [];
                this.timeIntervalItems.queryTypes = [1,3];
                this.useCountItems.queryTypes = [1,3];
                this.useDayCountItems.queryTypes = [1,3];
                this.statisticUse = {
                    instrumentId: "",
                    queryType: 1,// 1 设备使用率排行，2 日使用率排行，3 平均日使用率排行
                    beginTime: "",
                    endTime: "",
                    dateType: 1, // 1 今日，2 本周，3 本月
                    periodBeginTime: "",//时间段开始
                    periodEndTime: "",// 时间段结束
                    periodType: 1 // 1 工作日，2 自然日
                }
            }
        },
        checkList: {
            handler(newObj, oldObj) {
                if (!newObj.length) {
                    this.timeIntervalItems.queryTypes = oldObj;
                    this.checkList = oldObj;
                    return
                }
                this.timeIntervalItems.queryTypes = newObj;
                this.useCountItems.queryTypes = newObj;
                this.useDayCountItems.queryTypes = newObj;
                let arr = [];
                newObj.map(item => {
                    this.timeIntervalChart.columns.push(p[item - 1]);
                    this.useDayCountChart.columns.push(p[item - 1]);
                })
                this.timeIntervalChart.columns = [...new Set(this.timeIntervalChart.columns)]
                this.useDayCountChart.columns = [...new Set(this.useDayCountChart.columns)]
                // this.handleUseDayCount();
                // this.handleUseCount();
                // this.handleTimeInterval();
            },
            deep: true,
        }
    },
    computed: {
        ...mapState('lab', {
            modalVisible: 'modalVisible',
        }),
        useTime() {
            return function (value) {
                let h = Math.floor(value / (60 * 60));
                let ms = value % (60 * 60);
                let m = Math.floor(ms / 60);
                let timeStr = [];
                if (h) {
                    timeStr[0] = h;
                } else {
                    timeStr[0] = 0;
                }
                if (m) {
                    timeStr[1] = m;
                } else {
                    timeStr[1] = 0;
                }
                if (!timeStr.length) {
                    timeStr = [];
                }
                return timeStr
            }
        }
    },
    methods: {
        handleEdit(record) {
            this.handleEditModal(record)
        },
        ...mapMutations('lab', {
            handleEditModal: 'EDITMODAL',
        }),
        handleReset(type) {
            if (type === 1) {
                this.timeIntervalItems.dateType = 3;
                this.timeIntervalItems.periodType = 1;
                this.timeIntervalItems.endTime = "";
                this.timeIntervalItems.beginTime = "";
                this.handleTimeInterval();
            }
            if (type === 2) {
                this.useDayCountItems.dateType = 3;
                this.useDayCountItems.periodType = 1;
                this.useDayCountItems.endTime = "";
                this.useDayCountItems.beginTime = "";
                this.handleUseDayCount();
            }
        },
        // 使用率重置
        handleUseRanKingReset() {
            this.statisticUse = {
                queryType: 1,// 1 设备使用率排行，2 日使用率排行，3 平均日使用率排行
                beginTime: "",
                endTime: "",
                dateType: 1, // 1 今日，2 本周，3 本月
                periodBeginTime: "",//时间段开始
                periodEndTime: "",// 时间段结束
                periodType: 1 // 1 工作日，2 自然日
            }
            this.statisticUse.instrumentId = this.id;
            this.handleGetChartsData();
        },
        // 高级查询
        handleHigthSearch(item) {
            // this.useCountItems.periodBeginTime = obj.periodBeginTime;
            // this.useCountItems.periodEndTime = obj.periodEndTime;
            // this.useCountItems.periodType = obj.periodType;
            // this.handleUseCount();
            if (this.timeFlag === 1) {
                this.useCountItems.periodBeginTime = item.periodBeginTime;
                this.useCountItems.periodType = item.periodType;
                this.useCountItems.periodEndTime = item.periodEndTime;
                this.handleUseCount();
            }
            if (this.timeFlag === 3) {
                this.useDayCountItems.periodBeginTime = item.periodBeginTime;
                this.useDayCountItems.periodType = item.periodType;
                this.useDayCountItems.periodEndTime = item.periodEndTime;
                console.log(this.useDayCountItems)
                this.handleUseDayCount();
            }
        },
        afterUpdateGetDetail() {
            if (this.isDrawer) {
                this.getDetail();
            }
        },
        // 获取详情
        getDetail() {
            this.detail = "";
            this.loading = true;
            getInstrumentDetail({id: this.id}).then(res => {
                this.loading = false;
                if (res.code === 1) {
                    this.detail = res.items;
                    this.getProbeIndex();
                    this.getProbeIndexFlag();
                    store.commit('setThingDetail', this.detail);
                    // if (this.detail["bindingDeviceId"]) {
                    //     this.handleGetChartsData();
                    // }
                }
            })
        },
        // 获取探头指标
        getProbeIndex() {
            // objType 2设备，3房间
            var data = {
                objId: this.detail.id,
                objType: 2,
            };
            this.sensors = [];
            this.isStandbyPower = false;
            getOpenMonitorFlag(data).then(res => {
                if (res.code === 1) {
                    this.sensors = res.items.list;
                    this.sensorsItem['isBind'] = res.items.isBind;
                    this.sensorsItem['type'] = res.items.type;
                    this.bindingDeviceId = res.items.bindingDeviceId

                    for (var i = 0; i < this.sensors.length; i++) {
                        if (this.sensors[i].monitorSensorCatId === 21) {
                            this.isStandbyPower = true;
                        }
                    }
                }
            })
        },
        getProbeIndexFlag() {
            // objType 2设备，3房间
            var data = {
                objId: this.detail.id,
                objType: 2,
            };
            this.sensorsFlag = []
            getMonitorFlag(data).then(res => {
                if (res.code === 1) {
                    this.sensorsFlag = res.items;
                    store.commit('setSensorsFlag', this.sensorsFlag)
                }
            })
        },
        // 探头名称编辑
        handleProbeNameEdit() {
            this.$refs.probeNameEdit.open(this.detail, 2)
        },
        // 探头名称编辑-更换
        handleSensorTable(row) {
            this.$refs.sensorTable.open(1, 2, row)
        },
        // 新增预约
        handleIsFullcalendar() {
            this.isFullcalendar = !this.isFullcalendar
        },
        // 选好的预约时间
        handleSetDate(index, item) {
            this.$refs.reservationModal.open(index, item)
        },
        // 新增/更改预约成功
        handleReservation() {
            this.isFullcalendar = false;
            this.$refs.tagPane.getList();
        },
        // 申请维保
        handleMaintenance() {
            this.$refs.maintenanceModal.open(this.detail)
        },
        // 解绑标签
        handleUnbindLabel() {
            this.$confirm(this.$t('labDevice.unBindTagAndLadDevice'), this.$t('common.hint'), {
                confirmButtonText: this.$t('common.confirm'),
                cancelButtonText: this.$t('common.cancel'),
                type: 'warning'
            }).then(() => {
                getInstrumentUnbind({instrumentId: this.id}).then(res => {
                    if (res.code) {
                        if (res.code === 1) {
                            this.$message.success(this.$t('common.unBindSuccess'));
                            this.getDetail(this.id)
                        } else {
                            this.$message.error(res.message)
                        }
                    } else {
                        this.$message.error(res.message)
                    }
                })
            }).catch(() => {
            });
        },
        // tag
        handleTagPane(activeName, row) {
            if (activeName === '1') {
                this.handleSetDate(2, row)
            }
        },
        // 关闭详情页
        handleClose() {
            this.$emit("update:isDrawer", false);
        },
        handleGetChartsData() {
            this.dataCharts.rows = [];
            this.chartsLoading = true;
            getStatisticEquipmentUse(this.statisticUse).then(res => {
                this.chartsLoading = false;
                if (res.code) {
                    this.dataCharts.rows = res.items;
                } else {
                    this.$message.error(res.message)
                }
            }).catch(e => {
                this.chartsLoading = false;
            })
        },
        handleDateType(value, type, item) {
            item.dateType = value;
            item.beginTime = "";
            item.endTime = "";
            this.handleSwitch(type);
        },
        handleSwitch(type) {
            switch (type) {
                case 1:
                    this.handleUseCount();
                    break
                case 2:
                    this.handleTimeInterval();
                    break
                case 3:
                    this.handleUseDayCount();
                    break
            }
        },
        handleInterval(value, type, item) {
            console.log(type)
            if (value === 3) {
                this.timeFlag = type;
                this.$refs.UseRanHighSearch.open({start: item.periodBeginTime, end: item.periodEndTime, type: item.periodType});
                return
            }
            item.periodType = value;

            if (value !== 3) {
                item.periodEndTime = "";
                item.periodBeginTime = "";
            }
            this.handleSwitch(type);
        },
        handleTimeFrame(item) {
            console.log(item)
            if (this.timeFlag === 1) {
                this.useCountItems.periodBeginTime = item.start;
                this.useCountItems.periodType = item.periodType;
                this.useCountItems.periodEndTime = item.end;
                this.handleUseCount();
            }
            if (this.timeFlag === 3) {
                this.useDayCountItems.periodBeginTime = item.start;
                this.useDayCountItems.periodType = item.periodType;
                this.useDayCountItems.periodEndTime = item.end;
                console.log(this.useDayCountItems)
                this.handleUseDayCount();
            }
        },
        handleTime(arr, type, item) {
            if (!arr) {
                item.dateType = 3;
                item.beginTime = "";
                item.endTime = "";
            } else {
                item.dateType = null;
                item.beginTime = moment(arr[0]).format(TIME_FORMAT);
                item.endTime = moment(arr[1]).format(TIME_FORMAT);
            }
            this.handleSwitch(type);
        },
        handleTimeInterval() {
            delete this.timeIntervalItems.periodBeginTime;
            delete this.timeIntervalItems.periodEndTime;
            postInstrumentTimeIntervalStatistics(this.timeIntervalItems).then(res => {
                if (res.code) {
                    this.timeIntervalChart.rows = [];
                    res.items.map(item => {
                        const obj = {};
                        obj['name'] = item.name;
                        if (item.hasOwnProperty("data1")) {
                            obj[i18n.t('labDevice.softwareRate')] = item.data1;
                        }
                        if (item.hasOwnProperty("data2")) {
                            obj[i18n.t('labDevice.deviceRate')] = item.data2;
                        }
                        if (item.hasOwnProperty("data3")) {
                            obj[i18n.t('labDevice.smartRate')] = item.data3;
                        }
                        this.timeIntervalChart.rows.push(obj);
                    })
                }
            })
        },
        handleUseDayCount() {
            postInstrumentUseDayCountStatistics(this.useDayCountItems).then(res => {
                if (res.code) {
                    this.useDayCountChart.rows = [];
                    res.items.map(item => {
                        const obj = {};
                        obj['name'] = item.name;
                        if (item.hasOwnProperty("data1")) {
                            obj[i18n.t('labDevice.softwareRate')] = item.data1;
                        }
                        if (item.hasOwnProperty("data2")) {
                            obj[i18n.t('labDevice.deviceRate')] = item.data2;
                        }
                        if (item.hasOwnProperty("data3")) {
                            obj[i18n.t('labDevice.smartRate')] = item.data3;
                        }
                        this.useDayCountItems1[item.name] = item;
                        this.useDayCountChart.rows.push(obj);
                    })
                    console.log(this.useDayCountItems1)
                }
            })
        },
        handleUseCount() {
            postInstrumentUseCountStatistics(this.useCountItems).then(res => {
                if (res.code) {
                    this.useCountChart = res.items;
                }
            })
        },
        handleExport() {
            new Promise(resolve => {
                this.$message.warning(this.$t('common.exportMessage'));
                setTimeout(() => {
                    resolve();
                }, 1500)
            }).then(() => {
                postStatisticEquipmentUsePort(this.statisticUse).then(res => {
                    const data = moment(new Date()).format("YYYYMMDDHHmmss");
                    mixin.methods.download(
                        res,
                        decodeURIComponent(this.$t('labDevice.useRateExport') + data, "UTF-8")
                    )
                })
            })
        },
        styleTransform(deg) {
            let val = 0;
            if (deg > 75) {
                val = ((deg - 75) * 1.8).toFixed(1)
            }
            if (deg < 75) {
                val = (deg * 1.8 + (-135)).toFixed(1);
            }
            return "transform: rotate(" + val + "deg)";
        }
    },
}
</script>

<style lang="less" scoped>
.LabDevice-drawer {
    /deep/ .el-descriptions-item__container {
        position: relative;
        line-height: 26px;
        align-items: center;

        .qrcode {
            position: relative;

            .cover-qrcodeNo {
                width: 300px;
                height: 19px;
                background-color: #fff;
                position: absolute;
                bottom: 0;
                right: 0;
            }
        }
    }

    /deep/ .el-descriptions-item__label {
        width: 100px;
    }

    /deep/ .el-descriptions-row {
        td:first-child {
            width: 320px;
        }

        td:nth-child(2) {
            width: 420px;
            padding-right: 10px;
        }
    }

    .status {
        margin-right: 22px;
        height: 20px;
        line-height: 20px;
        display: inline-block;

        .dot {
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background-color: #000;
            margin-right: 5px;
            vertical-align: bottom;
            display: inline-block;
        }

        .abnormal {
            background-color: red;
        }
    }

    .pic {
        width: 180px;
        height: 160px;
        background-position: center center;
        background-size: contain;
        background-repeat: no-repeat;

        span {
            color: #fff;
            float: right;
            margin-right: 20px;
            margin-top: 14px;
            font-size: 12px;
        }
    }
}

.usage-rate {
    width: 150px;
}

.icon-reset {
    margin-left: 10px;
}

.charts {
    .title {
        font-size: 18px;
        font-weight: bold;
    }
}

.bg {
    width: 100%;
    height: 80px;
    padding: 20px 20px;
    background: #F9FBFF;
    border-radius: 8px;
    display: flex;
    align-items: center;

    .mr {
        margin-right: 20px;
    }
}

.use-rate {

    .use-rate-type {
        font-size: 16px;
        font-weight: bold;
        color: #3F51B5;
        margin-top: 16px;
        position: relative;
        margin-left: 10px;
    }

    .use-rate-type::before {
        content: "";
        width: 5px;
        height: 24px;
        background: #3F51B5;
        position: absolute;
        left: -10px;
        border-radius: 5px;
    }

    .use-ul {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .use-type-li {
            width: 310px;
            height: 100px;
            background: #F9FBFF;
            border-radius: 8px;
            padding: 20px;
            position: relative;

            .use-li-title {
                font-size: 16px;
                margin-bottom: 16px;
            }

            .num-color {
                font-size: 28px;
                font-weight: bold;
                color: #5352DC;
                line-height: 30px;
            }

            .icon-img {
                position: absolute;
                top: 20px;
                right: 20px;

                img {
                    width: 60px;
                    height: 60px;
                }
            }
        }

        .ring {
            color: #5352DC
        }

        .progress {
            width: 100px;
            height: 100px;
            border-left: 20px solid #6060E2;
            border-top: 20px solid #6060E2;
            border-right: 20px solid #C9CAF9;
            border-bottom: 20px solid #C9CAF9;
            border-radius: 50%;
            box-sizing: border-box;
            position: absolute;
            top: 40%;
            transition: all ease 0.8s;
        }

        //.progress.rotate1 {
        //    transform: rotate(-135deg);
        //}
        .blockOut {
            width: 130px;
            height: 84px;
            position: absolute;
            top: 10px;
            right: 0px;
            z-index: 3300;
            overflow: hidden;
        }

        .use-time {
            width: 135px;
            height: 135px;
            border: 15px dashed #19ECFF;
            border-radius: 50% 50%;
            margin: 16px auto;
            animation: fa-spin 24s infinite linear;
        }

        /deep/ .el-progress-circle {
            width: 135px !important;
            height: 135px !important;
        }

        @keyframes fa-spin {
            0% {
                -webkit-transform: rotate(0deg);
                transform: rotate(0deg)
            }

            100% {
                -webkit-transform: rotate(359deg);
                transform: rotate(359deg)
            }

        }

        .use-ring {
            width: 135px;
            height: 135px;
            border: 15px solid #10B89B;
            border-radius: 50% 50%;
            line-height: 105px;
            margin: 16px auto;
        }

        .use-ring2 {
            font-size: 16px;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;

            img {
                width: 146px;
                height: 33px;
            }

            .not-img {
                width: 92px;
                height: 71px;
                position: absolute;
                top: 10px;
                right: 50px;
            }

            .mt20 {
                margin-top: 30px;
            }
        }
    }
}

.mini {
    height: 30px !important;
    padding: 8px !important;
    font-size: 14px;
}
</style>