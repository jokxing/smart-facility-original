<template>
    <el-dialog
        :before-close="handleClose"
        :close-on-click-modal="false"
        :title="title"
        :visible.sync="dialogVisible"
        append-to-body
        custom-class="dialog">
        <el-form v-model="form" label-position="left" label-width="auto">
            <el-form-item :rules="[{required: true}]" :label="$t('hardware.alarmType')">
                <el-select
                    v-model="form.errorType"
                    allow-create
                    class="select-change-p"
                    default-first-option
                    :placeholder="$t('common.placeholder')">
                    <el-option
                        v-for="item in alarmTypes"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('hardware.disposeTime')">
                <el-date-picker
                    v-model="form.processDate"
                    class="select-change-p"
                    default-time="12:00:00"
                    :placeholder="$t('common.selectTime')"
                    type="datetime">
                </el-date-picker>
            </el-form-item>
            <el-form-item :label="$t('hardware.processUsername')">
                {{ this.form.userName }}
            </el-form-item>
            <el-form-item :label="$t('hardware.processMethod')">
                <el-input
                    v-model.trim="form.errorCauseMethod"
                    autocomplete="off"
                    class="select-change-p"
                    maxlength="30"
                    show-word-limit
                    type="textarea"/>
            </el-form-item>
            <el-form-item :label="$t('hardware.alarmCause')">
                <el-input
                    v-model.trim="form.errorCauseMsg"
                    autocomplete="off"
                    class="select-change-p"
                    maxlength="30"
                    show-word-limit
                    type="textarea"/>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button :disabled="disabled" @click="handleClose">{{ $t("common.cancel") }}</el-button>
            <el-button :loading="disabled" type="primary" @click="handleSubmit()">{{ $t("common.confirm") }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import { getAlarmErrorList } from "@/api/device";
    import { postMonitorIndicatorExceptionHandle } from "@/api/monitorIndicator";
    import moment from "moment"

    export default {
        name: "AlarmProcessing",
        data() {
            return {
                title: "报警处理",
                dialogVisible: false,
                form: {
                    errorType: 0,
                    objSensorId: "",
                    processDate: null,
                    errorCauseMethod: null,
                    errorCauseMsg: "",
                    time: "",
                    userId: JSON.parse(localStorage.getItem("USERINFO")).id,
                    userName: localStorage.getItem("username"),
                    process: null
                },
                alarmTypes: [],
                disabled: false
            }
        },
        methods: {
            open(row, type) {
                this.dialogVisible = true;
                this.form.objSensorId = row.objSensorId;
                this.form.time = row.time;
                this.form.process = row.process;
                if (!row.process) {
                    this.title = this.$t("hardware.addDisposeAlarm");
                    this.form.processDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
                } else {
                    this.title = this.$t("hardware.editDisposeAlarm");
                    this.form.processDate = row.errorCauseTime;
                    this.form.errorCauseMsg = row.errorCauseMsg;
                    this.form.errorType = row.errorCauseTypeFormat;
                    this.form.errorCauseMethod = row.errorCauseMethod;
                }

                if(type){
                    var data = {
                        type: type
                    }
                }
                getAlarmErrorList(data).then(res => {
                    this.alarmTypes = res.items.list;
                })
            },
            handleSubmit() {
                this.disabled = true;
                postMonitorIndicatorExceptionHandle(this.form).then(res => {
                    this.disabled = false;
                    if(res.code){
                        if(res.code === 1){
                            this.$message.success(this.form.process ? this.$t("common.editSuccess") : this.$t("hardware.exportTitle"));
                            this.dialogVisible = false;
                            this.$emit('handle')
                        }else{
                            this.$message.error(res.messge)
                        }
                    }else{
                        this.$message.error(res.messsage)
                    }
                })
            },
            handleClose() {
                this.dialogVisible = false;
                this.form = {
                    errorType: 0,
                    objSensorId: "",
                    processDate: null,
                    errorCauseMethod: null,
                    errorCauseMsg: "",
                    time: "",
                    userId: JSON.parse(localStorage.getItem("USERINFO")).id,
                    userName: localStorage.getItem("username"),
                    process: null
                }
            },
        }
    }
</script>
