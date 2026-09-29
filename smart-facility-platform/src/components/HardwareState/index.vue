<template>
    <div v-if="data.type != 0" class="status-card">
        <div
            :class="handleStatusBg(data)"
            class="state-card">
            <div class="name-unit">
                <div class="name">
                    <span>{{ isNotDevice ? data.sensorType.sensorAlias : data.sensorType.name }}</span>
                </div>
                <div
                    v-if="!deviceId[data.type]"
                    :class="handleStatusColor(data).color" class="alarm-scope">
                    <span>{{ $t('hardware.alarmScoped') }}：</span>
                    <span>
            {{ data.min + " ~ " + data.max }}
          </span>
                    <span>{{ data.sensorType.unit }}</span>
                </div>
            </div>
            <!-- <div v-if="data.signalSwitchStatus === 1" class="number-value">
              <div>关闭</div>
              <span class="icon icon-warning-line"></span>
            </div> -->
            <div :class="handleStatusColor(data).color" class="number-value">
                <div>
                    <span>{{ handleSensor(data) }}</span>
                    <!-- <span class="unit">{{ data.sensorType.unit }}</span> -->
                </div>
                <span :class="handleStatusColor(data).icon" class="icon"></span>
            </div>
        </div>
    </div>
</template>

<script>
import {ALERTOR_STATUS, DATAZOOM, DEVICE_TYPE, STATUS_VALUE, DEVICE_ID} from "@/utils/constant";

export default {
    name: "index",
    props: ["data",'isNotDevice'],
    data() {
        return {
            deviceId: DEVICE_ID,
        };
    },
    methods: {
        handleFilter(data) {
            if (DATAZOOM[data.type]) {
                const obj = DATAZOOM[data.type];
                return data.value ? obj[2] : obj[1];
            } else {
                return data.value
            }
        },
        handleStatusColor(item) {
            if (item.type === DEVICE_TYPE.SIGNAL) {
                if (item.status === ALERTOR_STATUS.NEW) {
                    return {color: "abnormal", icon: "icon-warning-line"}
                }
                if (item.value) {
                    return {color: "offline", icon: "icon-warning-line"}
                }
                return {color: "normal", icon: "icon-normal"}
            } else {
                if (item.hasOwnProperty("switchStatus") && item.switchStatus === ALERTOR_STATUS.NORMAL && item.type !== DEVICE_TYPE.OUTAGE_TYPE) {
                    return {color: "offline", icon: "icon-warning-line"};
                }
                if (item.status === STATUS_VALUE.NORMAL || item.status === STATUS_VALUE.NEWLYBUILD) {
                    return {color: "normal", icon: "icon-normal"};
                }
                return {color: "abnormal", icon: "icon-warning-line"};
            }
        },
        handleStatusBg(item) {
            let color;
            if (item.type === DEVICE_TYPE.SIGNAL) {
                if (item.status === -1) {
                    return "abnormal-background";
                }
                color = item.value ? "offLine-background" : "normal-background"
            } else {
                if (item.hasOwnProperty("switchStatus") && item.switchStatus === ALERTOR_STATUS.NORMAL && item.type !== DEVICE_TYPE.OUTAGE_TYPE) {
                    color = "offLine-background";
                } else {
                    color = item.status === STATUS_VALUE.NORMAL || item.status === STATUS_VALUE.NEWLYBUILD ? "normal-background" : "abnormal-background";
                }
            }
            return color;
        }
    }
}
</script>

<style lang="less" scoped>
@import "../../style/variable";

.status-card {
    width: 95%;
    min-width: 290px;
    margin-left: 20px;
    margin-bottom: 20px;
}

.state-card {
    width: 100%;
    height: 100px;
    padding: 20px 20px 0 30px;
    font-size: @font14;
    line-height: 14px;
    border-radius: 8px;
    background: @white;
    color: @666;
    border: 1px @666 solid;

    .name-unit {
        display: flex;
        justify-content: space-between;
    }

    .number-value {
        font-size: 32px;
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
}
</style>
