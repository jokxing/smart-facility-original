<template>
    <div>
        <template v-for="(item, index) in data.sensors">
            <div v-if="![17,1001].includes(item.type)" :key="index">
                <span>
                  {{ item !== [] && item["sensorType"] ? item.sensorType.name + "：" : "" }}
                </span>
                <span :class="(item.status !== 1 && DEVICE_ID[item.type] && item.status !== 0) ? 'abnormal':''">
                    {{ item.signalSwitchStatus === 1 ? $t('common.close') : handleSensor(item) }}
                </span>
                <span
                    v-if="item.signalSwitchStatus !== 1"
                    :class="item !== [] && item['sensorType'] && (item.status === STATUS_VALUE.NORMAL || item.status === STATUS_VALUE.NEWLYBUILD)?'normal':'abnormal'"
                    v-text="valueFilter(item)">
                </span>
            </div>
        </template>
        <div v-if="data.reportDate && showReportDate">
            <span>{{ $t('hardware.detectionDate') }}：</span>
            <span :span="16">{{ data.reportDate | localToUtc }}</span>
        </div>
    </div>
</template>
<script>

import {STATUS_VALUE, DEVICE_ID} from "@/utils/constant";

let lastName, id, type;
export default {
    name: "index",
    props: {
        data: {
            type: Object,
            default: () => {
            }
        },
        showReportDate: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            STATUS_VALUE,
            DEVICE_ID
        }
    },
}
</script>
