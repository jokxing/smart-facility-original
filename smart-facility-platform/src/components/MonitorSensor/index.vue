<template>
    <div class="status-card" 
        :class="sensors.signalSwitchStatus === 1 ? '' : (sensors.activateFlag === 1 ? 'abnormal' : 'normal')">
        <div class="name-unit">
            <div class="name">
                <span>{{ sensors.sensorAlias }}</span>
            </div>
            <div class="alarm-scope" v-if="!dataZoom[sensors.monitorSensorCatId] && sensors.normalMax">
                <span>{{ $t('hardware.alarmScoped') }}：</span>
                <span>
                    {{ sensors.normalMin + " ~ " + sensors.normalMax }}
                </span>
                <span>{{ sensors.unit }}</span>
            </div>
        </div>

        <!-- <template v-if="type !== 3">
            <div class="number-value" v-if="sensors.signalSwitchStatus === 1">
                <div>
                    关闭
                </div>
                <span class="icon icon-warning-line"></span>
            </div>
            <div class="number-value" v-else>
                <div v-if="dataZoom[sensors.monitorSensorCatId]">
                    {{ sensors.activateFlag === 1 ? dataZoom[sensors.monitorSensorCatId][1] : dataZoom[sensors.monitorSensorCatId][2] }}
                </div>
                <div v-else>
                    <span>{{ sensors.monitorSensorVal }}</span>
                    <span>{{ sensors.unit }}</span>
                </div>
                <span class="icon" :class="sensors.activateFlag === 1 ? 'icon-warning-line' : 'icon-normal'"></span>
            </div>
        </template> -->
        <template>
             <div class="number-value">
                <div v-if="dataZoom[sensors.monitorSensorCatId]">
                    <span v-if="sensors.monitorSensorCatId !== 12">{{ sensors.activateFlag === 1 ? dataZoom[sensors.monitorSensorCatId][1] : dataZoom[sensors.monitorSensorCatId][2] }}</span>
                    <span v-else>{{ sensors.gps }}</span>
                </div>
                <div v-else>
                    <span>{{ sensors.monitorSensorVal }}</span>
                    <span>{{ sensors.unit }}</span>
                </div>
                <span class="icon" :class="sensors.activateFlag === 1 ? 'icon-warning-line' : 'icon-normal'"></span>
            </div>
        </template>
        <div class="date">{{ sensors.monitorSensorTime | localToUtc }}</div>
    </div>
</template>

<script>
import {DATAZOOM} from "@/utils/constant"
    export default {
        props: {
            sensors: {
                type: Object,
                default: {}
            },
            // 设备2，房间3
            type: {
                type: Number,
                default: null
            }
        },
        data() {
            return {
                dataZoom: DATAZOOM
            }
        },
    }
</script>

<style lang="less" scoped>
    @import "../../style/variable";
    .status-card{
        width: 95%;
        min-width: 290px;
        height: 118px;
        padding: 14px 20px 0 20px;
        margin-left: 20px;
        margin-bottom: 20px;
        font-size: @font14;
        line-height: 14px;
        border-radius: 8px;
        background: @white;
        color: @666;
        border: 1px solid;
        &.abnormal{
            border-color: @abnormal;
        }
        &.normal{
            border-color: @normal;
        }

        .name-unit {
            display: flex;
            justify-content: space-between;
            .name{
                span{
                    color: #666666!important;
                }
            }
        }

        .number-value {
            font-size: 28px;
            line-height: 40px;
            font-weight: @fw500;
            display: flex;
            justify-content: space-between;
            margin-top: @smallInterval;

            .unit {
                color: #444444;
                font-size: @font18;
            }

            .icon {
                font-size: 36px;
            }
        }

        .date{
            color: #666666;
            margin-top: 14px;
        }
    }
</style>