<template>
    <div class="sticky-head">
        <el-table
            ref="table"
            :data="device"
            :default-sort="{order: 'descending'}"
            :row-key="getRowKey"
            stripe
            border
            @selection-change="handleSelectionChange"
            @sort-change="sortChange">
            <slot name="checked"></slot>
            <el-table-column fixed label="#" type="index" width="70px">
                <template v-slot="scope">
            <span v-if="`${total !== 0}`">{{
                    (items.pageNum - 1) * items.pageSize + scope.$index + 1
                }}</span>
                </template>
            </el-table-column>
            <el-table-column fixed :label="$t('hardware.device1')" min-width="130" prop="name" sortable>
                <template v-slot="scope">
                    <a @click="handleShowDrawer(scope.row)">
                        {{ scope.row.name }}
                    </a>
                </template>
            </el-table-column>
            <el-table-column fixed :label="$t('hardware.devciceNo')" :title="$t('hardware.devciceNo')" min-width="120"
                             prop="no" sortable>
                <template v-slot="scope">
                    <a @click="handleShowDrawer(scope.row)">
                        {{ scope.row.no }}
                    </a>
                </template>
            </el-table-column>
            <el-table-column :label="$t('hardware.value')" min-width="210">
                <template v-slot="scope">
                    <hardwareValue :data="scope.row"/>
                </template>
            </el-table-column>
            <el-table-column :label="$t('common.owningDepartment')" min-width="120" prop="departmentName" sortable/>
            <el-table-column v-if="!type" :label="$t('hardware.association')">
                <template v-slot="scope">
                    <div>
                        <div v-if="scope.row.relevancyName">{{ scope.row.relevancyName }}</div>
                        <div v-else>{{ $t('hardware.notAssociation') }}</div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column :label="$t('hardware.status')" :min-width="170">
                <template v-slot="scope">
                    <div v-if="(scope.row.equipmentTypeCode == 0 || scope.row.equipmentTypeCode == 10)">
                        <device-signal :data="scope.row"/>
                        <div>{{ $t('hardware.kwh') }}：&nbsp;{{ scope.row.battery }} V</div>
                        <div :class="scope.row.detectFlag ? 'abnormal' : ''">
                            {{ scope.row.detectFlag ? $t('hardware.detected') : "" }}
                        </div>
                    </div>
                    <span v-else :class="alarmType(scope.row).status ? '' : 'abnormal'">
              {{ alarmType(scope.row).str }}
          </span>
                </template>
            </el-table-column>

            <el-table-column :label="$t('hardware.owningGateway')" min-width="100" prop="gatewayName">
                <template v-slot="scope">
                    <div>{{ scope.row.gatewayName }}</div>
                    <div v-if="scope.row['panId']">PanId: {{ scope.row.panId }}</div>
                </template>
            </el-table-column>
            <el-table-column :label="$t('common.creatDate')" width="160" prop="createDate" sortable>
                <template v-slot="scope">
                    {{ scope.row.createDate | localToUtc }}
                </template>
            </el-table-column>
            <el-table-column v-if="!type" :label="$t('labDevice.useStatus')" min-width="100">
                <template v-slot="scope">
                    <span :class="deviceUseStatus[scope.row.useStatus].className">{{
                            deviceUseStatus[scope.row.useStatus].str
                        }}</span>
                </template>
            </el-table-column>
            <!--            <el-table-column :label="$t('common.owningDepartment')" min-width="120" prop="departmentName" sortable/>-->
            <el-table-column :label="$t('hardware.isOnLine')" v-if="type" min-width="80">
                <template v-slot="scope">
            <span :class="scope.row.status === $STATUS.OFFLINE ? 'abnormal' : 'normal'">
              {{ onLineStatus(scope.row.status) }}
            </span>
                </template>
            </el-table-column>
            <slot name="handle"></slot>
        </el-table>
        <device-drawer :id.sync="deviceId" :is-drawer.sync="deviceDrawer"/>
        <DeviceDrawerNew :hideSensorsTypes="[17,1001, 12]" :id.sync="deviceId" :is-drawer.sync="deviceDrawerNew"/>
        <outage-alarm-drawer :id.sync="outageAlarmId" :is-drawer.sync="outageAlarmDrawer"/>
        <PowerDrawerNew :id.sync="outageAlarmId" :is-drawer.sync="powerDrawerNew"/>
        <smart-socket-drawer
            v-if="smartSocketDrawer"
            :id.sync="smartSocketId"
            :is-drawer.sync="smartSocketDrawer"/>
        <signal-source-drawer
            v-if="isSignal"
            :id.sync="signalId"
            :is-drawer.sync="isSignal"/>
        <AlerterDrawer :id.sync="alerterId" :is-drawer.sync="alerterDrawer"/>
        <PipetteGunRackDrawer :is-drawer.sync="isGunRackDrawer" :id="gunRackId" :strId="gunRackStrId"/>
        <GatewayDrawer :is-drawer.sync="isGatewayDrawer" :id="gatewayId"/>
    </div>
</template>

<script>
import HardwareValue from "@c/HardwareValue/index";
import DeviceSignal from "@c/DeviceSignal/index";
import {alarmScope, onLineStatus} from "@/utils/methods";
import GatewayDrawer from "@/views/assetTag/components/GatewayDrawer";
import {DEVICE_USE_STATUS} from "@/utils/constant";
import mixin from "@/utils/mixin";
export default {
    name: "index",
    props: {
        device: {
            type: Array,
            default: () => []
        },
        items: {
            type: Object,
            default: () => {
            }
        },
        total: {
            type: Number,
            default: 0
        },
        type: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            onLineStatus,
            deviceDrawer: false,
            deviceDrawerNew: false,
            smartSocketDrawer: false,
            outageAlarmDrawer: false,
            powerDrawerNew: false,
            alerterDrawer: false,
            deviceId: "",
            alerterId: "",
            smartSocketId: "",
            outageAlarmId: "",
            isSignal: false,
            signalId: "",
            isGunRackDrawer: false,
            gunRackId: null,
            gunRackStrId: "",
            isGatewayDrawer: false,
            gatewayId: "",
            deviceUseStatus: DEVICE_USE_STATUS
        }
    },
    components: {
        HardwareValue,
        DeviceSignal,
        PipetteGunRackDrawer: () => import("@/views/pipetteGunRack/components/GunRackDrawer"),
        SignalSourceDrawer: () => import("@/views/signalSource/components/SignalSourceDrawer"),
        AlerterDrawer: () => import("@/views/alarmAcousto/components/AlerterDrawer"),
        // TODO: 未开通2.0用户使用老页面访问记录仪详情
        DeviceDrawer: () => import("@/views/device/components/DeviceDrawer"),
        DeviceDrawerNew: () => import("@/views/device/components/DeviceDrawerNew"),
        smartSocketDrawer: () => import("@/views/smartSocket/components/SmartSocketDrawer"),
        outageAlarmDrawer: () => import("@/views/powerOutageAlarm/components/PowerDrawer"),
        PowerDrawerNew: () => import("@/views/powerOutageAlarm/components/PowerDrawerNew"),
        GatewayDrawer
    },
    methods: {
        alarmType(item) {
            let str = "";
            if (item.status == 1) {
                str = this.$t('common.normal')
            } else if (item.status == -100) {
                str = this.$t('common.offLine')
            } else if (item.status == 0) {
                str = this.$t('common.notActivate')
            } else {
                str = this.$t('common.abnormal')
            }
            return {
                str,
                status: (item.status == 1 || item.status == 0) ? true : false
            };
        },
        getRowKey(row) {
            return row.id;
        },
        handleSelectionChange(val) {
            this.$emit("handle", val);
        },
        handleShowDrawer(item) {
            if (process.env.VUE_APP_DEMO === 'true') {
                const code = Number(item.equipmentTypeCode);
                // 0/10 → DeviceDrawerNew；7 Alerter；8 Power；14 Signal；13 GunRack；16 Gateway
                const ok = ((code === 0 || code === 10) && item.openTwoSystem)
                    || code === 7
                    || (code === 8 && item.openTwoSystem)
                    || code === 14
                    || code === 13
                    || code === 16;
                if (!ok) {
                    this.$message.info('当前硬件类型或历史版本详情尚未接入演示。');
                    return;
                }
            }
            // console.log(item.equipmentTypeCode)
            switch (item.equipmentTypeCode) {
                case 10:
                    if (item.openTwoSystem) {
                        this.deviceDrawerNew = true;
                        this.deviceId = item.strId;
                    } else {
                        this.smartSocketDrawer = true;
                        this.smartSocketId = item.strId;
                    }
                    break
                case 8:
                    if (item.openTwoSystem) {
                        this.powerDrawerNew = true;
                    } else {
                        this.outageAlarmDrawer = true;
                    }
                    this.outageAlarmId = item.strId;
                    break
                case 7:
                    this.alerterDrawer = true;
                    this.alerterId = item.strId;
                    break
                case 13:
                    this.gunRackId = item.id;
                    this.gunRackStrId = item.strId;
                    this.isGunRackDrawer = true;
                    break
                case 14:
                    this.signalId = item.strId;
                    this.isSignal = true;
                    break
                case 16:
                    this.gatewayId = item.strId;
                    this.isGatewayDrawer = true;
                    break
                default:
                    if (item.openTwoSystem) {
                        this.deviceDrawerNew = true;
                    } else {
                        this.deviceDrawer = true;
                    }
                    this.deviceId = item.strId;
                    break
            }
        },
        handleAlarm(item) {
            return alarmScope(item);
        },
        sortChange(e) {
            this.$emit('columnsort', e);
        },
    },
    watch: {
        device() {
            // 当列表数据源发生变化时，再次触发

        }
    }
}
</script>

<style lang="less" scoped>
@import "../../../src/style/table_sticky";
</style>
