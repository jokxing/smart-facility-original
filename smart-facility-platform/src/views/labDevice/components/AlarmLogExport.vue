<template>
    <el-dialog
        :title="title"
        :visible.sync="dialogVisible"
        append-to-body
        width="30%"
        :before-close="handleClose">
        <el-form label-position="left" label-width="auto">
            <el-form-item :label="$t('hardware.sensorName1')">
                <el-select
                    class="select-change-p"
                    v-model="form.objSensorIds"
                    multiple
                    collapse-tags
                    :placeholder="$t('common.placeholder')">
                    <el-option v-for="item in sensors" :label="item.sensorAlias" :value="item.objSensorId"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('labDevice.labDeviceExportStartDate')">
                <el-date-picker
                    class="select-change-p"
                    v-model="dateTime"
                    type="datetimerange"
                    :range-separator="$t('common.most')"
                    :start-placeholder="$t('common.startDate')"
                    :end-placeholder="$t('common.endDate')"
                    :default-time="['00:00:00', '23:59:59']"
                    :value-format="'yyyy-MM-dd HH:mm:ss'"
                    @change="handleEquipmentData"
                    @close="handleEquipmentData">
                </el-date-picker>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button :disabled="loading" @click="handleClose">{{ $t('common.cancel') }}</el-button>
            <el-button type="primary" :loading="loading" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
import {postMonitorHistoryAlarmExport} from "@/api/labDevice";
import minxin from "@/utils/mixin";
import moment from "moment";

export default {
    name: "AlarmLogExport",
    data() {
        return {
            title: this.$t('labDevice.alarmLogExport'),
            dialogVisible: false,
            form: {
                objNo: "",
                objType: "",
                beginDate: "",
                endDate: "",
                objId: "",
                offLineFlag: 1,
                objSensorIds: [],
            },
            sensors: [],
            dateTime: [],
            loading: false,
        }
    },
    methods: {
        handleClose() {
            this.dialogVisible = false;
            this.form.objNo = "";
            this.form.objType = "";
            this.form.beginDate = "";
            this.form.endDate = "";
            this.form.objId = "";
            this.form.offLineFlag = 1;
            this.form.objSensorIds = [];
            this.sensors = [];
            this.dateTime = [];
        },
        open(arr, type, item) {
            this.form.objType = type;
            this.form.objId = item.id;
            this.form.objNo = item.no;
            this.dialogVisible = true;
            this.sensors = arr;
        },
        handleEquipmentData(val) {
            if (val) {
                this.form.beginDate = this.dateTime[0];
                this.form.endDate = this.dateTime[1];
            } else {
                this.form.beginDate = "";
                this.form.endDate = "";
            }
        },
        handleSubmit() {
            if (this.form.objSensorIds.length === 0) {
                this.$message.error(this.$t('common.placeholder') + " " + this.$t('hardware.sensorName1'));
                return;
            }
            this.loading = true;
            postMonitorHistoryAlarmExport(this.form).then(res => {
                new Promise(resolve => {
                    setTimeout(() => {
                        resolve();
                    }, 1000);
                }).then(() => {
                    this.loading = false;
                    if (res?.code) {
                        this.$message.error(res.message);
                        return;
                    }
                    this.$message.success(this.$t('common.exportSuccess'));
                    const data = moment(new Date()).format('YYYYMMDDHHmmss');
                    minxin.methods.download(res, decodeURIComponent(this.$t('hardware.alarmLog') + data, 'utf-8'));
                    this.handleClose();
                })
            }).catch(err => {
                this.loading = false;
            })
        },
    }
}
</script>

<style scoped>

</style>