<template>
    <el-dialog
        :before-close="handleClose"
        :close-on-click-modal="false"
        title="申请维保"
        :visible.sync="dialogVisible"
        append-to-body
        destroy-on-close
        width="520px">
        <SubmitForm :formData="formData" :data="data" :labelWidth="'85px'" />
        <div class="formDesc">申请维保后，报警功能暂停服务</div>
        <span slot="footer" class="dialog-footer">
            <el-button :disabled="btnLoading" @click="handleClose">取 消</el-button>
            <el-button type="primary" :loading="btnLoading" @click="handleSubmit">确 定</el-button>
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
            return {
                btnLoading: false,
                dialogVisible: false,
                formData: [
                    {
                        label: '故障描述',
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
                            this.$message.success('申请维保成功');
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