<template>
    <div class="time-out-setting">
        <el-dialog
            :before-close="handleClose"
            :close-on-click-modal="false"
            :title="$t('hardware.timeOutSetting')"
            :visible.sync="dialogVisible"
            id="time-out-setting"
            custom-class="time-out-setting"
            append-to-body>
            <el-form v-model="form" label-width="auto" label-position="left">
                <el-form-item :label="$t('hardware.taskStatus6')">
                    <el-input type="number" v-model="form.aboutTimeOut" min="1" :placeholder="$t('common.inputNum')">
                        <template slot="append">{{ $t('labDevice.host') }}</template>
                    </el-input>
                </el-form-item>
                <el-form-item :label="$t('labDevice.overTimed')">
                    <el-input type="number" v-model="form.timeOut" min="1" :placeholder="$t('common.inputNum')">
                        <template slot="append">{{ $t('labDevice.host') }}</template>
                    </el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
          <el-button :disabled="disabled" @click="handleClose">{{ $t('common.cancel') }}</el-button>
          <el-button :disabled="disabled" :loading="disabled" type="primary" @click="handleSubmit()">{{ $t('common.confirm') }}</el-button>
        </span>
        </el-dialog>
    </div>
</template>

<script>
import {getActivitiTimeOutConfig, postActivitiTimeOutConfig} from "@/api/activiti";

export default {
    name: "TimeOutSetting",
    data() {
        return {
            form: {
                aboutTimeOut: 0,
                timeOut: 0
            },
            dialogVisible: false,
            disabled: false
        }
    },
    methods: {
        open() {
            this.dialogVisible = true;
            this.handleGetTimeSetting();
        },
        handleGetTimeSetting() {
            getActivitiTimeOutConfig().then(res => {
                if (res.code) {
                    this.form = res.items;
                    Object.keys(res.items).map(item => {
                        this.form[item] = res.items[item];
                    })
                }
            })
        },
        handleClose() {
            this.dialogVisible = false;
            this.$emit("close");
            Object.keys(this.form).map(item => {
                this.form[item] = "";
            })
        },
        handleSubmit() {
            this.form.timeOut = Number(this.form.timeOut);
            this.form.aboutTimeOut = Number(this.form.aboutTimeOut);
            if (this.form.aboutTimeOut <= 0) {
                return this.$message.error(this.$t('hardware.taskStatus8'));
            }
            if (this.form.timeOut <= 0) {
                return this.$message.error(this.$t('hardware.taskStatus8'));
            }
            if (this.form.timeOut <= this.form.aboutTimeOut) {
                return this.$message.error(this.$t('hardware.taskStatus9'));
            }
            this.disabled = true;
            postActivitiTimeOutConfig(this.form).then(res => {
                this.disabled = false;
                if (res.code) {
                    this.handleClose();
                    this.$message.success(this.$t('hardware.systemSuccess'));
                } else {
                    this.$message.error(res.message);
                }
            }).catch(e => {
                this.disabled = false;
            })
        }
    }
}
</script>

<style scoped>
</style>