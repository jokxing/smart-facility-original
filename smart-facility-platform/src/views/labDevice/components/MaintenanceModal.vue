<template>
    <el-dialog
        :before-close="handleClose"
        :close-on-click-modal="false"
        :title="$t('labDevice.addMaintenance')"
        :visible.sync="dialogVisible"
        append-to-body
        destroy-on-close
        width="520px">
        <SubmitForm :formData="formData" :data="data" :labelWidth="'auto'" />
        <div class="formDesc">{{ $t('labDevice.addMaintenanceHint') }}</div>
        <span slot="footer" class="dialog-footer">
            <el-button :disabled="btnLoading" @click="handleClose">{{ $t('common.cancel') }}</el-button>
            <el-button type="primary" :loading="btnLoading" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import SubmitForm from "@c/SubmitForm";
    import {
        postMaintenanceAdd,
    } from "@/api/labDevice";
    export default {
        components: {
            SubmitForm
        },
        data() {
            const _this = this;
            return {
                btnLoading: false,
                dialogVisible: false,
                formData: [
                    {
                        label: _this.$t('labDevice.remark'),
                        prop: "remark",
                        type: "textarea",
                        maxlength: "50",
                        rows: "5",
                        showWordLimit: true
                    }
                ],
                data: {
                    remark: ""
                },
                row: {}
            }
        },
        methods: {
            open(row){
                this.dialogVisible = true;
                this.row = row;
            },
            handleSubmit() {
                var data = {
                    companyId: this.row.companyId,
                    departmentId: this.row.departmentId,
                    departmentName: this.row.departmentName,
                    instrumentId: this.row.id,
                    instrumentName: this.row.name,
                    instrumentNo: this.row.no,
                    remark: this.data.remark,
                    userId: this.row.createUserId,
                }
                this.btnLoading = true;
                postMaintenanceAdd(data).then(res => {
                    this.btnLoading = false;
                    if(res.code){
                        if(res.code === 1){
                            this.$message.success(this.$t('labDevice.maintenanceSuccess'));
                            this.handleClose();
                            this.$emit('handle')
                        }else{
                            this.$message.error(res.message)
                        }
                    }else{
                        this.$message.error(res.message)
                    }
                })
            },
            handleClose() {
                this.dialogVisible = false
            }
        },
    }
</script>

<style lang="less" scoped>
    .formDesc {
        padding-left: 16px;
        color: #ff4949;
    }
</style>