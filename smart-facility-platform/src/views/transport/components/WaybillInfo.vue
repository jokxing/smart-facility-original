<template>
    <el-drawer
        :before-close="handleClose"
        :modal="false"
        :visible.sync="isDrawer"
        :with-header="false"
        size="70%">

        <div v-if="isDrawer" class="detail-container" v-loading="loading">

            <!--   标题     -->
            <div class="detail-padding">
                <div class="clearfix ng-binding ">
                    ▍ {{ obj.name }}
                    <el-button type="text" @click="handleClose">
                        <i class="el-icon-close"/>
                    </el-button>
                </div>
                <!--        &lt;!&ndash;     全局按钮     &ndash;&gt;-->
                <!--        <el-row justify="end" type="flex" class="margin-small">-->
                <!--        </el-row>-->
            </div>

            <!-- 运单进度 -->
            <div class="detail-padding-nocolor">

                <el-descriptions :column="1" :title="$t('transport.transportPlan')"/>

                <el-steps
                    :active="details.state+1"
                    finish-status="finish"
                    process-status="wait">
                    <el-step :title="$t('transport.createTransport')">
                        <template #description>
                            {{ details.createDate }}
                        </template>
                    </el-step>
                    <el-step :title="$t('transport.carLoader')">
                        <template #description>
                            {{ details.loadingTime }}
                        </template>
                    </el-step>
                    <el-step :title="$t('transport.go')">
                        <template #description>
                            {{ details.beginTime }}
                        </template>
                    </el-step>
                    <el-step :title="$t('transport.delivery')">
                        <template #description>
                            {{ details.completeTime }}
                        </template>
                    </el-step>
                </el-steps>

            </div>

            <!-- 基本信息 -->
            <div class="detail-padding">
                <el-descriptions :column="3" :title="$t('common.basicInformation')">
                    <template slot="extra">
                        <el-button
                            class="icon-edit"
                            :disabled="details.state!==undefined && details.state > 0"
                            @click="handleEdit">
                            {{ $t('common.edit') }}
                        </el-button>
                    </template>

                    <el-descriptions-item :label="$t('transport.transportNo')">{{
                            details.transportNo
                        }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('transport.professionNo')">{{
                            details.professionNo
                        }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('common.createName')">{{
                            details.createUserName
                        }}
                    </el-descriptions-item>

                    <el-descriptions-item :label="$t('transport.carBoard')">

                        {{ details.carBoard }}
                        &nbsp;
                        <el-button
                            type="text"
                            :disabled="details.state!==0"
                            style="padding: 0;"
                            @click="handleSetCar">
                            <template v-if="details.carId">
                                {{ $t('labDevice.change') }} >
                            </template>
                            <template v-else>
                                {{ $t('transport.allocationChillCar') }} >
                            </template>
                        </el-button>

                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('transport.brandName')">{{
                            details.brandName
                        }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('transport.modelName')">{{
                            details.modelName
                        }}
                    </el-descriptions-item>

                    <el-descriptions-item :label="$t('transport.driverName')">
                        <template v-if="details.carId">
                            {{ details.driverName }}
                            &nbsp;
<!--                            <el-button-->
<!--                                type="text"-->
<!--                                style="padding: 0;"-->
<!--                                :disabled="details.state == 3"-->
<!--                                @click="handleSetDriver">-->
<!--                                {{ $t('labDevice.change') }} >-->
<!--                            </el-button>-->
                        </template>
                        <template v-else>
                            <span style="color: darkgray">{{ $t('transport.notChillCar') }}</span>
                        </template>
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('transport.driverTel')">{{
                            details.driverTel
                        }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('common.creatDate')">{{
                            details.createDate | localToUtc
                        }}
                    </el-descriptions-item>

                    <el-descriptions-item :label="$t('transport.consigner')">{{
                            details.deliverName
                        }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('route.deliverUnit')">{{
                            details.deliverUnits
                        }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('transport.consignerAddress')">{{
                            details.deliverAddress
                        }}
                    </el-descriptions-item>

                    <el-descriptions-item :label="$t('transport.consignee')">{{
                            details.receiveName
                        }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('route.receiptUnit')">{{
                            details.receiveUnits
                        }}
                    </el-descriptions-item>
                    <el-descriptions-item :label="$t('transport.consigneeAddress')">{{
                            details.receiveAddress
                        }}
                    </el-descriptions-item>

                </el-descriptions>
            </div>

            <!-- 最新状态 -->
            <div class="detail-padding-nocolor" v-loading="stateLoading">
                <el-descriptions :column="4" :title="$t('hardware.newStatus')">
                    <template slot="extra">
                        <el-button :disabled="[2,3].includes(details.state)"
                                   icon="icon-Audible-alarm"
                                   @click="$refs.AdvancedAlarmSet.open({...obj})">
                            {{ $t('hardware.alarmSystem') }}
                        </el-button>
                        <el-button
                            icon="icon-reset"
                            @click="getNewStates">
                            {{ $t('hardware.reset') }}
                        </el-button>
                    </template>
                </el-descriptions>
                <div class="new-state" v-if="Array.isArray(newSensors) && newSensors.length > 0">
                    <el-row :gutter="20">
                        <el-col v-for="(item, index) in newSensors" :key="index" :sm="8" :xl="8">
                            <MonitorSensor v-if="!item.deleteFlag" :sensors="item"/>
                        </el-col>
                    </el-row>
                </div>
            </div>
            <!-- 运输清单 -->
            <div class="detail-padding">
                <el-descriptions :column="1" :title="$t('transport.transportList')">
                    <template slot="extra">
                        <el-button
                            class="icon-edit"
                            :disabled="details.state!==undefined && details.state > 0"
                            @click="handleEditSample">
                            {{ $t('transport.editTransportList') }}
                        </el-button>
                    </template>
                </el-descriptions>
                <el-table
                    row-key="sampleId"
                    :data="details.sampleInfos"
                    max-height="260"
                    border
                    stripe>
                    <el-table-column label="#" type="index" width="60"/>
                    <el-table-column :label="$t('transport.productNo')" prop="sampleNo" min-width="80"/>
                    <el-table-column :label="$t('transport.productName')" prop="sampleName" min-width="100"/>
                    <el-table-column :label="$t('common.num')" prop="amount" min-width="60"/>
                    <el-table-column :label="$t('transport.unit')" prop="unitName" min-width="60"/>
                    <el-table-column :label="$t('labDevice.specification')" prop="specification" min-width="80"/>
                    <el-table-column :label="$t('transport.productionBatch')" prop="productionBatch" min-width="100"/>
                </el-table>
            </div>
            <MonitorInfo
                class="detail-padding"
                v-if="sensors.length > 0"
                :objId="obj.id"
                :sensors="sensors"
                :type="obj.type"/>

            <!-- GPS坐标数据 -->
            <div class="detail-padding" v-if="details.carId">
                <el-descriptions :column="1" :title="$t('transport.GPS')">
                    <template slot="extra">
                        <el-button
                            v-for="item in dataType"
                            :key="item.INTERVAL"
                            :class="gpsQuery.dateType === item.INTERVAL && 'is-active'"
                            :disabled="gpsInfosLoading"
                            @click="handleCutTime(item.INTERVAL)">
                            {{ item.LABEL }}
                        </el-button>
                        <el-button @click="handleCustom" :disabled="gpsInfosLoading">
                            {{ gpsQuery.dateType ? $t('common.custom') : $t('common.cancelCustom') }}
                        </el-button>
                        <el-date-picker
                            :disabled="gpsInfosLoading"
                            v-show="!gpsQuery.dateType"
                            v-model="gpsQueryTimeRange"
                            ref="datePicker"
                            type="datetimerange"
                            :range-separator="$t('common.most')"
                            :start-placeholder="$t('common.startDate')"
                            :end-placeholder="$t('common.endDate')"
                            @change="handleSelectedTime">
                        </el-date-picker>
                        <el-button
                            :disabled="gpsInfosLoading"
                            class="el-icon-refresh"
                            @click="handleResetGPSQuery">
                            {{ $t('labDevice.reset') }}
                        </el-button>
                        <el-select
                            :disabled="gpsInfosLoading"
                            v-model="gpsQuery.historyTimeInterval"
                            class="select-change1"
                            filterable
                            @change="getGpsInfos"
                            :placeholder="$t('common.placeholder')">
                            <el-option
                                v-for="(item) in timeInterval"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id">
                            </el-option>
                        </el-select>
                        <el-button
                            :disabled="gpsInfosExportDisabled"
                            :loading="gpsInfosExportDisabled"
                            @click="handleExportGPSInfos">
                            {{ $t('common.export') }}
                        </el-button>
                    </template>
                </el-descriptions>

                <el-table
                    :data="gpsInfos"
                    max-height="260"
                    border
                    stripe>
                    <el-table-column type="index" label="#" align="center" width="80"/>
                    <el-table-column prop="createDate" :label="$t('transport.updateDate')" align="center"/>
                    <el-table-column :label="$t('transport.coord')" align="center">
                        <template v-slot="{row}">
                            （{{ row.longitude }}，{{ row.latitude }}）
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
        <create-way-bill ref="createWayBill" @updated="edited"/>
        <select-car-dialog ref="selectCarDialog"/>
        <SelectDriverDialog ref="selectDriverDialog" :dialogTitle="$t('transport.changeDriver1')"/>
        <AdvancedAlarmSet ref="AdvancedAlarmSet" @handle="getDetail"/>
    </el-drawer>
</template>

<script>

import CreateWayBill from "@/views/transport/components/CreateWayBill";
import SelectCarDialog from "@/views/transport/components/SelectCarDialog";
import SelectDriverDialog from "@/views/transport/components/SelectDriverDialog"
import AdvancedAlarmSet from "@/views/AdvancedAlarmSet/index";
import MonitorSensor from "@c/MonitorSensor";
import MonitorInfo from "@c/MonitorInfo";
import {HISTORYTIMEINTERVAL, TIME_DIMENSION} from "@/utils/constant";

import {
    allocateTransportOrderCar,
    changeTransportOrderDriver, exportTransportOrderGPS,
    getTransportOrderGPS,
    infoTransportOrder
} from "@/api/transport";
import {getMonitorFlag, getOpenMonitorFlag} from "@/api/monitorIndicator";
import store from "@/store";
import moment from "moment";
import mixin from "@/utils/mixin";

function defaultGPSQuery(objId) {
    return {
        dateType: 1,
        beginTime: null,
        endTime: null,
        objSensorId: null,
        historyTimeInterval: 1,
        type: 6,//运单
        objId,

        pageNum: 1,
        pageSize: 10,
    };
}

export default {
    name: "WaybillInfo",
    components: {
        CreateWayBill,
        SelectCarDialog,
        SelectDriverDialog,
        AdvancedAlarmSet,
        MonitorSensor,
        MonitorInfo
    },
    emits: ['updatedInfo'],
    data() {
        const _this = this;
        return {
            dataType: [
                {INTERVAL: 1, LABEL: _this.$t('common.day2')},
                {INTERVAL: 2, LABEL: _this.$t('common.week')},
                {INTERVAL: 3, LABEL: _this.$t('common.month')},
            ],
            obj: {
                id: null,
                type: 6, // 运单
                name: '',
                no: ''
            },
            isDrawer: false,
            loading: false,

            // 基本信息
            details: {},

            // 最新状态
            newSensors: [],
            sensors: [],
            stateLoading: false,

            // 历史记录的探头列表
            sensorsFlag: [],
            // gps坐标数据
            gpsInfos: [],
            gpsTotal: 0,
            gpsInfosLoading: false,
            // gps筛选条件
            gpsQuery: defaultGPSQuery(),
            gpsQueryTimeRange: null,
            // 条件选项
            dimensions: TIME_DIMENSION,
            timeInterval: HISTORYTIMEINTERVAL,

            gpsInfosExportDisabled: false,
        }
    },
    methods: {
        open(obj) {
            this.obj = {type: 6, ...obj};
            this.isDrawer = true;
            this.gpsQuery = defaultGPSQuery(obj.id);
            this.getDetail();
        },
        getDetail() {
            this.loading = true;
            infoTransportOrder(this.obj.id).then(res => {
                if (res.code === 1) {
                    this.details = res.items;
                    this.newSensors = this.details.sensors;
                    this.sensors = [];
                    this.details.sensors.map(item => {
                        if (item.monitorSensorCatId !== 12) {
                            this.sensors.push(item)
                        }
                    })
                    this.getGpsInfos();
                    this.getProbeIndexFlag();
                    // store.commit('setThingDetail', this.detail)
                }
            }).finally(() => {
                this.loading = false;
            })
        },

        handleEdit() {
            this.$refs.createWayBill.open(1, this.details, 1);
        },
        edited() {
            this.getDetail();
            this.$emit('updatedInfo');
        },

        // 更换冷藏车
        handleSetCar() {
            this.$refs.selectCarDialog.openSelect(selectedCar => {
                allocateTransportOrderCar({
                    carId: selectedCar.id,
                    driverId: selectedCar.driverId,
                    orderIds: [this.details.id],
                }).then(res => {
                    if (res.code) {
                        this.$message.success(this.$t('transport.changeChillCarSuccess'));
                        this.getDetail();
                        this.$emit('updatedInfo');
                    } else {
                        this.$message.error(res.message);
                    }
                }).catch(res => {
                    this.$message.error(res.message);
                })
            })
        },

        // 更换司机
        handleSetDriver() {
            this.$refs.selectDriverDialog.openSelect(driverId => {
                changeTransportOrderDriver({
                    driverId,
                    orderId: this.details.id,
                }).then(res => {
                    if (res.code) {
                        this.$message.success(this.$t('transport.changeDriverSuccess'));
                        this.getDetail();
                        this.$emit('updatedInfo');
                    } else {
                        this.$message.error(res.message);
                    }
                }).catch(res => {
                    this.$message.error(res.message);
                })
            });
        },

        // 获取最新监测状态
        getNewStates() {
            var data = {
                objId: this.obj.id,
                objType: this.obj.type,
            };
            this.stateLoading = true;

            getOpenMonitorFlag(data).then(res => {
                if (res.code === 1) {
                    this.newSensors = res.items.list;
                }
            }).finally(() => {
                this.stateLoading = false;
            })
        },

        handleEditSample() {
            this.$refs.createWayBill.open(1, this.details, 2);
        },


        getProbeIndexFlag() {
            var data = {
                objId: this.obj.id,
                objType: this.obj.type,
            };
            this.sensorsFlag = []
            getOpenMonitorFlag(data).then(res => {
                if (res.code === 1) {
                    this.sensorsFlag = res.items;
                    store.commit('setSensorsFlag', this.sensorsFlag);
                }
            })
        },

        // 点击内置的时间段按钮
        handleCutTime(index) {
            this.gpsQuery.dateType = index;
            this.gpsQueryTimeRange = null;
            this.handleSelectedTime();
        },

        // 选择时间后触发
        handleSelectedTime() {
            if (this.gpsQueryTimeRange) {
                this.gpsQuery.beginTime = this.gpsQueryTimeRange[0];
                this.gpsQuery.endTime = this.gpsQueryTimeRange[1];
            } else {
                this.gpsQuery.beginTime = null;
                this.gpsQuery.endTime = null;
            }

            this.getGpsInfos();
        },

        // 点击自定义按钮
        handleCustom() {
            if (this.gpsQuery.dateType) {
                this.gpsQuery.dateType = null;
                this.gpsQueryTimeRange = null;
            } else {
                this.gpsQuery.dateType = 1;
                this.gpsQueryTimeRange = null;
            }
            this.handleSelectedTime();
        },

        // 重设GPS列表筛选条件
        handleResetGPSQuery() {
            this.gpsQuery = defaultGPSQuery(this.obj.id);
            this.getGpsInfos();
        },

        // 获取GPS坐标列表
        getGpsInfos() {
            this.gpsInfosLoading = true;
            getTransportOrderGPS(this.gpsQuery).then(res => {
                if (res.code) {
                    this.gpsInfos = res.items.list;
                }
                // console.log('gpss',res)
            }).catch(res => {

            }).finally(() => {
                this.gpsInfosLoading = false;
            })
        },

        // 导出
        handleExportGPSInfos() {
            this.gpsInfosExportDisabled = true;
            new Promise(resolve => {
                this.$message.warning(this.$t('common.exportMessage'));
                setTimeout(() => {
                    resolve();
                }, 1500)
            }).then(() => {
                exportTransportOrderGPS(this.gpsQuery).then(res => {
                    const data = moment(new Date()).format("YYYYMMDDHHmmss");
                    mixin.methods.download(
                        res,
                        decodeURIComponent(this.$t('transport.GPSExport') + data, "UTF-8")
                    )
                }).finally(() => {
                    this.gpsInfosExportDisabled = false;
                });
            }).catch(() => {
                this.gpsInfosExportDisabled = false;
            });
        },

        handleClose() {
            this.isDrawer = false;
            this.details = {};
            this.sensors = [];
        },
    },
}
</script>

<style lang="less" scoped>

@import "../../../style/variable";

.ng-binding {
    font-size: 20px;
    font-weight: @fwbold;
    color: @subjectColor;
}

.is-active {
    background: @subjectColor !important;
    color: @white !important;
}

/deep/ .select-change1 {
    width: 100px !important;
    margin-left: 10px;
}

.el-button {
    margin-left: 10px;
}

.el-range-editor--medium.el-input__inner {
    width: 360px;
    margin-left: 10px;
}

.el-date-editor {
    &.is-active {
        background: #F4F4F9 !important
    }
}
</style>