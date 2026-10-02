<template>
    <el-dialog
        :before-close="handleClose"
        :close-on-click-modal="false"
        :title="$t('labDevice.updateNextMaintenanceDate')"
        :visible.sync="dialogVisible"
        append-to-body
        destroy-on-close
        width="520px">
        <SubmitForm :formData="formData" :data="data" :labelWidth="'85px'" />
        <span slot="footer" class="dialog-footer">
            <el-button :disabled="btnLoading" @click="handleClose">{{ $t('common.cancel') }}</el-button>
            <el-button type="primary" :loading="btnLoading" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import SubmitForm from "@c/SubmitForm";
    import {
        postMaintenanceUpdateMaintenance,
    } from "@/api/labDevice";
    export default {
        components: {
            SubmitForm
        },
        data() {
            const _this = this;
            return {
                title: "",
                btnLoading: false,
                dialogVisible: false,
                formData: [
                    {
                        label: _this.$t('labDevice.nextMaintenanceDate'),
                        prop: "nextMaintenanceDate",
                        type: "datetime",
                        pickerOptions: {
                            disabledDate(time) {
                                return time.getTime() < Date.now() - 8.64e7;
                            }
                        }
                    }
                ],
                data: {
                    nextMaintenanceDate: ""
                },
                row: {}
            }
        },
        methods: {
            open(row){
                this.dialogVisible = true;
                this.row = row;
                this.data = {
                    nextMaintenanceDate: row && row.nextMaintenanceDate ? row.nextMaintenanceDate : ""
                };
            },
            handleSubmit() {
                if (this.btnLoading) return;
                if(!this.data.nextMaintenanceDate){
                    return this.$message.error(this.$t('labDevice.changeNextMaintenanceDate'))
                }
                if(new Date(this.data.nextMaintenanceDate).getTime() < new Date(this.row.createDate).getTime()){
                    return this.$message.error(this.$t('labDevice.nextMaintenanceDateMessage'))
                }
                var data = {
                    nextMaintenanceDate: this.data.nextMaintenanceDate,
                    maintenanceId: this.row.id,
                }
                this.btnLoading = true;
                postMaintenanceUpdateMaintenance(data).then(res => {
                    this.btnLoading = false;
                    if(res.code){
                        if(res.code === 1){
                            this.$message.success(this.$t('hardware.systemSuccess'));
                            if (process.env.VUE_APP_DEMO === 'true') this.$store.commit('lab/REFLESH');
                            this.handleClose();
                            this.$emit('handle')
                        }else{
                            this.$message.error(res.message)
                        }
                    }else{
                        this.$message.error(res.message)
                    }
                }).catch(() => {
                    this.btnLoading = false;
                })
            },
            handleClose() {
                this.dialogVisible = false;
                this.data = { nextMaintenanceDate: "" };
            }
        },
    }
</script>
