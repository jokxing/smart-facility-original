<template>
    <el-dialog
        :before-close="handleModalClose"
        :title="$t('labDevice.timeInterval')"
        :visible.sync="dialogVisible"
        :close-on-click-modal="false"
        destroy-on-close
        append-to-body
        width="23%"
        custom-class="time-period-selection">
        <el-form :model="form">
            <el-form-item :label="$t('labDevice.timeType')">
                <el-select 
                    v-model="form.periodType">
                    <template v-for="item in PERIODTYPES" >
                        <el-option 
                            v-if="item.value !== 0"
                            :key="item.value" 
                            :value="item.value" 
                            :label="item.label">
                        </el-option>
                    </template>
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('labDevice.timePeriod')">
                <el-time-select
                    class="time-select"
                    :placeholder="$t('common.startTime')"
                    v-model="form.startTime"
                    :picker-options="{
                        start: '00:00',
                        step: '01:00',
                        end: '23:00'
                    }">
                </el-time-select>
                <span>&nbsp;&nbsp;-&nbsp;&nbsp;</span>
                <el-time-select
                    class="time-select"
                    :placeholder="$t('common.endTime')"
                    v-model="form.endTime"
                    :picker-options="{
                        start: '00:00',
                        step: '01:00',
                        end: '24:00',
                        minTime: form.startTime
                    }">
                </el-time-select>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button :disabled="loading" @click="handleModalClose">{{ $t('common.cancel') }}</el-button>
            <el-button type="primary" :loading="loading" @click="submitForm">{{ $t('common.confirm') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import { PERIODTYPES } from "@/utils/constant";
    export default {
        data() {
            return {
                PERIODTYPES,
                loading: false,
                dialogVisible: false,
                form:{
                    periodType: 1,
                    startTime: "",
                    endTime: ""
                }
            }
        },
        methods: {
            open(time) {
                this.dialogVisible = true;
                this.form.startTime = time[0];
                this.form.endTime = time[1]
            },
            submitForm() {
                this.$emit('handle', this.form);
                this.handleModalClose();
            },
            handleModalClose() {
                this.dialogVisible = false;
                this.form = {
                    periodType: 1,
                    startTime: "",
                    endTime: ""
                }
            }
        },
    }
</script>

<style lang="less" scoped>
    .time-period-selection{
        .time-select{
            width: 120px;
        }
    }
</style>