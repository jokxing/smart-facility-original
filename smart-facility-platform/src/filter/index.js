import Vue from "vue";
import {DATAZOOM, DEVICE_ID, HINT_DEFAULT, TIME_FORMAT} from "@/utils/constant";
import {getSenorStatus} from "@/utils/methods";
import i18n from "@/i18n";
import moment from "moment";
Vue.prototype.refreshLoading = false;
Vue.prototype.refreshLoadingText = HINT_DEFAULT;
Vue.prototype.refreshLoadingBg = "rgba(0, 0, 0, 0.8)";

Vue.prototype.valueFilter = function (item) {
    if(item.status === -111){
        return "（"+i18n.t('common.abnormal')+"）"
    }else{
        if (item !== [] && item["sensorType"] && !DEVICE_ID[item.sensorType.id]) {
            return "（ " + getSenorStatus(item.status, 0)[0] + " ）"
        } else {
            return ""
        }
    }
}
Vue.filter('localToUtc', function (date) {
    if (!date) {
        return ""
    }
    const time = moment(date).utc();
    const GMT = localStorage.getItem("GMT");
    let utc = -8;
    if (GMT && GMT.toString() !== "undefined") {
        utc = -8 + 2*(Number(GMT));
    }
    return moment(time).utcOffset(utc).format(TIME_FORMAT)
})
/** 过滤传感器
 * @param item 传感器
 * @returns {*}
 */
Vue.prototype.handleSensor = function (item) {
    if (item !== [] && item["sensorType"]) {
        if (DATAZOOM[item.type]) {
            if (item.type === 12) {
                return item.gps
            }
            const obj = DATAZOOM[item.type];
            if(item.status === -111){
                return obj[1]
            }else{
                return item.value ? obj[2] : obj[1];
            }
        } else {
            return item.value + item.sensorType.unit
        }
    }
}

Vue.prototype.handleAlarmScope = function (row) {
    if (!row) {
        return
    }
    if (DEVICE_ID[row.sensorType] || row.sensorType === 1000) {
        return {scope: "-", value: "-"};
    } else {
        return {scope: row.min + '~' + row.max, value: row.value};
    }
}

const LEVEL = {
    0: "-",
    1: i18n.t('room.qualified'),
    "-1": i18n.t('room.rectification'),
    "-2": i18n.t('room.abQualified')
}
// 房间报告等级过滤器
Vue.filter("levelFilter", function (value) {
    return LEVEL[value];
})

