<template>
    <el-dialog
        :before-close="handleClose"
        :close-on-click-modal="false"
        title="修改下次维保时间"
        :visible.sync="dialogVisible"
        append-to-body
        destroy-on-close
        width="520px">
        <SubmitForm :formData="formData" :data="data" :labelWidth="'85px'" />
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
        postMaintenanceUpdateMaintenance,
    } from "@/api/labDevice";
    export default {
        components: {
            SubmitForm
        },
        data() {
            return {
                title: "",
                btnLoading: false,
                dialogVisible: false,
                formData: [
                    {
                        label: '下次维保时间',
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
            },
            handleSubmit() {
                if(new Date(this.data.nextMaintenanceDate).getTime() < new Date(this.row.createDate).getTime()){
                    return this.$message.error("下次维保时间不能小于当前维保的申请时间")
                }
                var data = {
                    nextMaintenanceDate: this.nextMaintenanceDate,
                    maintenanceId: this.row.id,
                }
                this.btnLoading = true;
                postMaintenanceUpdateMaintenance(data).then(res => {
                    this.btnLoading = false;
                    if(res.code){
                        if(res.code === 1){
                            this.$message.success('设置成功');
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